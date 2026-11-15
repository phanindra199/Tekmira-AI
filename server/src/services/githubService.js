import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// In-memory cache for recent repository queries (TTL: 5 minutes)
const repoCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Maximum number of files to process from git tree to prevent memory bloat
export const MAX_TREE_FILES = 300;

// Maximum byte size to read from a single source file (30 KB)
export const MAX_FILE_READ_BYTES = 30 * 1024;

// Directories and patterns excluded from tree analysis
export const IGNORED_PATH_PATTERNS = [
  /^(node_modules|\.git|\.github|\.vscode|dist|build|\.next|out|coverage|vendor|tmp)/i,
  /\.(png|jpe?g|gif|svg|ico|webp|mp4|webm|pdf|zip|tar|gz|exe|dll|so|dylib|bin|lock)$/i
];

/**
 * GitHub API & Repository Mining Service
 * Safely fetches public repository metadata, file trees, dependencies, and commit evidence
 */
export class GitHubService {
  /**
   * Parses and strictly sanitizes a GitHub repository URL
   * Prevents Server-Side Request Forgery (SSRF) and malicious redirects
   * 
   * @param {string} rawUrl 
   * @returns {{ owner: string, repo: string, canonicalUrl: string }}
   */
  static parseGitHubUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') {
      throw new AppError('GitHub repository URL is required', 400);
    }

    const trimmed = rawUrl.trim();

    // Check for malicious protocols
    if (/^(file|ftp|gopher|data|javascript):/i.test(trimmed)) {
      throw new AppError('Invalid URL protocol. Only standard HTTP/HTTPS GitHub URLs are permitted.', 400);
    }

    // Check for path traversal characters before URL normalization
    if (/\/\.\.(\/|$)/.test(trimmed) || /\\\.\.(\\|$)/.test(trimmed) || trimmed.includes('/../')) {
      throw new AppError('Path traversal characters are strictly forbidden in repository identifiers.', 400);
    }

    // Normalize URL with protocol if omitted
    let urlString = trimmed;
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = `https://${urlString}`;
    }

    let parsed;
    try {
      parsed = new URL(urlString);
    } catch (err) {
      throw new AppError(`Malformed repository URL: '${rawUrl}'`, 400);
    }

    // SSRF Guard: Enforce strict github.com host whitelist
    const host = parsed.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') {
      throw new AppError(
        `Unsupported repository host '${host}'. Tekmira AI currently evaluates public repositories hosted on github.com.`,
        400
      );
    }

    // Split pathname into path segments (e.g. /owner/repo)
    const segments = parsed.pathname
      .split('/')
      .filter(Boolean)
      .map(s => s.trim());

    if (segments.length < 2) {
      throw new AppError('Invalid GitHub URL structure. Expected format: https://github.com/owner/repository', 400);
    }

    const owner = segments[0];
    let repo = segments[1];

    // Strip .git suffix if present
    if (repo.toLowerCase().endsWith('.git')) {
      repo = repo.slice(0, -4);
    }

    // Validate owner and repo identifiers: alphanumeric, hyphens, underscores, dots
    const identifierRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!identifierRegex.test(owner) || !identifierRegex.test(repo)) {
      throw new AppError('Invalid characters in GitHub repository owner or name.', 400);
    }

    // Disallow path traversal attempts
    if (owner === '..' || owner === '.' || repo === '..' || repo === '.') {
      throw new AppError('Path traversal characters are strictly forbidden in repository identifiers.', 400);
    }

    return {
      owner,
      repo,
      canonicalUrl: `https://github.com/${owner}/${repo}`
    };
  }

  /**
   * Fetches full evidence snapshot for a public GitHub repository
   * 
   * @param {string} repoUrl - Public GitHub URL
   * @param {Object} options - { candidateEmail?: string, bypassCache?: boolean, customFetch?: Function }
   * @returns {Promise<Object>} Mined repository evidence snapshot
   */
  static async fetchRepositoryEvidence(repoUrl, options = {}) {
    const { owner, repo, canonicalUrl } = this.parseGitHubUrl(repoUrl);
    const cacheKey = `${owner}/${repo}`.toLowerCase();

    // Check memory cache unless bypassed
    if (!options.bypassCache && repoCache.has(cacheKey)) {
      const cached = repoCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
      repoCache.delete(cacheKey);
    }

    const fetcher = options.customFetch || globalThis.fetch;
    if (typeof fetcher !== 'function') {
      throw new AppError('Fetch API is not available in the current runtime environment', 500);
    }

    const headers = {
      'User-Agent': 'Tekmira-AI-Evidence-Engine/1.0',
      'Accept': 'application/vnd.github.v3+json'
    };

    if (config.githubToken) {
      headers['Authorization'] = `Bearer ${config.githubToken}`;
    }

    try {
      // 1. Fetch Repository Metadata
      const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const repoRes = await fetcher(repoApiUrl, { headers });

      if (repoRes.status === 404) {
        throw new AppError(
          `Repository '${owner}/${repo}' was not found or is private. Tekmira AI requires public GitHub repositories.`,
          404
        );
      }

      if (repoRes.status === 403 || repoRes.status === 429) {
        const resetHeader = repoRes.headers?.get?.('x-ratelimit-reset');
        const resetTime = resetHeader ? new Date(parseInt(resetHeader, 10) * 1000).toLocaleTimeString() : 'shortly';
        throw new AppError(
          `GitHub API rate limit reached (60 requests/hour unauthenticated). Reset at ${resetTime}. Configure GITHUB_TOKEN in server/.env for 5,000 requests/hour.`,
          429
        );
      }

      if (!repoRes.ok) {
        throw new AppError(`GitHub API responded with HTTP status ${repoRes.status}`, repoRes.status);
      }

      const repoMetadata = await repoRes.json();
      const defaultBranch = repoMetadata.default_branch || 'main';

      // 2. Fetch Languages Breakdown
      const langRes = await fetcher(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
      const rawLanguages = langRes.ok ? await langRes.json() : {};
      const languages = this.calculateLanguagePercentages(rawLanguages);

      // 3. Fetch Git Tree (Recursive)
      const treeRes = await fetcher(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers }
      );
      
      let rawTree = [];
      if (treeRes.ok) {
        const treeJson = await treeRes.json();
        rawTree = treeJson.tree || [];
      }

      // Filter and sanitize tree
      const filteredFiles = rawTree
        .filter(item => item.type === 'blob')
        .map(item => item.path)
        .filter(p => !IGNORED_PATH_PATTERNS.some(regex => regex.test(p)))
        .slice(0, MAX_TREE_FILES);

      // Check for automated test suites
      const hasTestFiles = filteredFiles.some(f => 
        /\b(test|spec|tests|__tests__)\b/i.test(f) || 
        /\.(test|spec)\.[jt]sx?$/i.test(f)
      );

      // 4. Inspect Dependencies (e.g. package.json)
      const detectedDependencies = await this.mineDependencies(owner, repo, defaultBranch, filteredFiles, fetcher, headers);

      // 5. Fetch Recent Commits & Verify Author
      const commitsRes = await fetcher(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
        { headers }
      );

      let authenticCommits = [];
      if (commitsRes.ok) {
        const rawCommits = await commitsRes.json();
        if (Array.isArray(rawCommits)) {
          authenticCommits = rawCommits.map(c => {
            const authorEmail = c.commit?.author?.email || '';
            const authorLogin = c.author?.login || '';
            
            // If candidateEmail provided, check match
            let verifiedAuthored = true;
            if (options.candidateEmail) {
              const candClean = options.candidateEmail.toLowerCase().trim();
              verifiedAuthored = authorEmail.toLowerCase().includes(candClean) || 
                                 authorLogin.toLowerCase().includes(owner.toLowerCase());
            }

            return {
              hash: (c.sha || '').slice(0, 7),
              message: (c.commit?.message || '').split('\n')[0].slice(0, 100),
              committedAt: new Date(c.commit?.author?.date || Date.now()),
              verifiedAuthored,
              author: authorLogin || authorEmail || 'Contributor'
            };
          });
        }
      }

      const snapshot = {
        githubHandle: owner,
        repoName: repo,
        repoUrl: canonicalUrl,
        description: repoMetadata.description || '',
        isFork: Boolean(repoMetadata.fork),
        defaultBranch,
        stargazersCount: repoMetadata.stargazers_count || 0,
        forksCount: repoMetadata.forks_count || 0,
        openIssuesCount: repoMetadata.open_issues_count || 0,
        languages,
        authenticCommits,
        detectedDependencies,
        hasTestFiles,
        fileCount: filteredFiles.length,
        minedAt: new Date()
      };

      // Store in memory cache
      repoCache.set(cacheKey, { timestamp: Date.now(), data: snapshot });

      return snapshot;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to fetch repository evidence: ${error.message}`, 502);
    }
  }

  /**
   * Calculates exact percentage breakdown from GitHub languages byte counts
   * @param {Object} rawLanguages - e.g. { JavaScript: 15400, HTML: 2300 }
   * @returns {Array<{ name: string, bytes: number, percentage: number }>}
   */
  static calculateLanguagePercentages(rawLanguages = {}) {
    const totalBytes = Object.values(rawLanguages).reduce((sum, bytes) => sum + bytes, 0);
    if (totalBytes === 0) return [];

    return Object.entries(rawLanguages)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: Math.round((bytes / totalBytes) * 1000) / 10 // Rounded to 1 decimal place
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }

  /**
   * Inspects repository for dependency manifests (e.g. package.json, requirements.txt)
   * Safely parses JSON without executing code
   */
  static async mineDependencies(owner, repo, branch, files, fetcher, headers) {
    const dependenciesSet = new Set();

    // Look for root package.json or server/package.json
    const packageJsonFiles = files.filter(f => /(^|\/)package\.json$/i.test(f)).slice(0, 2);

    for (const pkgPath of packageJsonFiles) {
      try {
        const rawContentUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${pkgPath}`;
        const res = await fetcher(rawContentUrl, { headers });
        if (res.ok) {
          const content = await res.text();
          if (content.length <= MAX_FILE_READ_BYTES) {
            const parsed = JSON.parse(content);
            const allDeps = {
              ...(parsed.dependencies || {}),
              ...(parsed.devDependencies || {})
            };
            Object.keys(allDeps).forEach(dep => dependenciesSet.add(dep.toLowerCase()));
          }
        }
      } catch (err) {
        // Silently skip malformed or unreadable dependency manifests
      }
    }

    // Look for Python requirements.txt
    const reqFiles = files.filter(f => /(^|\/)requirements\.txt$/i.test(f)).slice(0, 1);
    for (const reqPath of reqFiles) {
      try {
        const rawContentUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${reqPath}`;
        const res = await fetcher(rawContentUrl, { headers });
        if (res.ok) {
          const content = await res.text();
          if (content.length <= MAX_FILE_READ_BYTES) {
            content.split('\n').forEach(line => {
              const clean = line.trim().split(/[=<>~#]/)[0].trim().toLowerCase();
              if (clean && !clean.startsWith('-')) {
                dependenciesSet.add(clean);
              }
            });
          }
        }
      } catch (err) {
        // Skip on error
      }
    }

    return Array.from(dependenciesSet).sort();
  }

  /**
   * Clear cache for testing or reset
   */
  static clearCache() {
    repoCache.clear();
  }
}

export default GitHubService;
