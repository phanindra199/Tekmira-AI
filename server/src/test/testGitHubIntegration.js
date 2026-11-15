import { GitHubService } from '../services/githubService.js';
import { RepositoryService } from '../services/repositoryService.js';
import { RepositorySnapshot } from '../models/RepositorySnapshot.js';
import { AppError } from '../utils/AppError.js';

console.log('🧪 Starting Tekmira AI GitHub REST API & Repository Evidence Mining Tests (Day 11)...\n');

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${description}`);
    failed++;
  }
}

/**
 * Mock GitHub API Fetcher for deterministic automated testing
 */
function createMockGitHubFetcher(options = {}) {
  return async (url, fetchOptions = {}) => {
    // 1. Rate Limit Simulation
    if (options.simulateRateLimit) {
      return {
        ok: false,
        status: 403,
        headers: new Map([['x-ratelimit-reset', '1763214567']]),
        json: async () => ({ message: 'API rate limit exceeded' })
      };
    }

    // 2. 404 Not Found Simulation
    if (options.simulateNotFound) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' })
      };
    }

    // 3. Repository Metadata Route
    if (url.includes('/repos/test-owner/test-repo') && !url.includes('/languages') && !url.includes('/trees') && !url.includes('/commits')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          name: 'test-repo',
          full_name: 'test-owner/test-repo',
          description: 'A modern Full Stack Tekmira AI capstone project',
          fork: false,
          stargazers_count: 42,
          forks_count: 5,
          open_issues_count: 2,
          default_branch: 'main'
        })
      };
    }

    // 4. Languages Breakdown Route
    if (url.includes('/languages')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          JavaScript: 75000,
          HTML: 15000,
          CSS: 10000
        })
      };
    }

    // 5. Git Trees Route
    if (url.includes('/git/trees')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          sha: 'main-tree-sha',
          tree: [
            { path: 'package.json', type: 'blob' },
            { path: 'src/server.js', type: 'blob' },
            { path: 'src/test/server.test.js', type: 'blob' },
            { path: 'node_modules/express/index.js', type: 'blob' }, // Should be filtered out
            { path: '.git/config', type: 'blob' },                   // Should be filtered out
            { path: 'dist/bundle.js', type: 'blob' },               // Should be filtered out
            { path: 'public/avatar.png', type: 'blob' }             // Should be filtered out
          ]
        })
      };
    }

    // 6. Raw package.json Content Route
    if (url.includes('raw.githubusercontent.com') && url.includes('package.json')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          name: 'test-app',
          dependencies: {
            express: '^4.21.2',
            react: '^18.3.1',
            prisma: '^6.0.0',
            tailwindcss: '^3.4.0'
          },
          devDependencies: {
            jest: '^29.7.0',
            supertest: '^7.0.0'
          }
        })
      };
    }

    // 7. Commits Route
    if (url.includes('/commits')) {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            sha: 'abcdef1234567890',
            commit: {
              message: 'feat: implement evidence triangulation engine',
              author: {
                name: 'Alex Morgan',
                email: 'alex@example.com',
                date: '2026-11-15T10:00:00Z'
              }
            },
            author: { login: 'alex-morgan-dev' }
          }
        ]
      };
    }

    // Default 404
    return { ok: false, status: 404, json: async () => ({ message: 'Not Found' }) };
  };
}

async function runTests() {
  // =========================================================================
  // 1. GitHub URL Sanitization & SSRF Defense
  // =========================================================================
  console.log('--- 1. GitHub URL Sanitization & SSRF Defense ---');

  // Valid formats
  const parsed1 = GitHubService.parseGitHubUrl('https://github.com/facebook/react');
  assert('Parses standard HTTPS GitHub URL', parsed1.owner === 'facebook' && parsed1.repo === 'react');

  const parsed2 = GitHubService.parseGitHubUrl('https://github.com/facebook/react.git');
  assert('Strips .git extension safely', parsed2.repo === 'react');

  const parsed3 = GitHubService.parseGitHubUrl('github.com/facebook/react/');
  assert('Handles bare domain without protocol and trims trailing slash', 
    parsed3.owner === 'facebook' && parsed3.repo === 'react');

  const parsed4 = GitHubService.parseGitHubUrl('http://www.github.com/prisma/prisma');
  assert('Handles www subdomain', parsed4.owner === 'prisma' && parsed4.repo === 'prisma');

  // SSRF and Security Rejections
  let ssrfError = null;
  try {
    GitHubService.parseGitHubUrl('https://gitlab.com/facebook/react');
  } catch (err) {
    ssrfError = err;
  }
  assert('SSRF Guard: Rejects non-GitHub hosts with HTTP 400', 
    ssrfError instanceof AppError && ssrfError.statusCode === 400);

  let internalIpError = null;
  try {
    GitHubService.parseGitHubUrl('http://169.254.169.254/latest/meta-data');
  } catch (err) {
    internalIpError = err;
  }
  assert('SSRF Guard: Rejects cloud metadata IP requests', 
    internalIpError instanceof AppError && internalIpError.statusCode === 400);

  let malformedError = null;
  try {
    GitHubService.parseGitHubUrl('https://github.com/incomplete');
  } catch (err) {
    malformedError = err;
  }
  assert('Rejects URL missing repository name', 
    malformedError instanceof AppError && malformedError.statusCode === 400);

  let traversalError = null;
  try {
    GitHubService.parseGitHubUrl('https://github.com/../etc/passwd');
  } catch (err) {
    traversalError = err;
  }
  assert('Rejects path traversal attempts', 
    traversalError instanceof AppError && traversalError.statusCode === 400);

  // =========================================================================
  // 2. Language Breakdown & Percentage Calculations
  // =========================================================================
  console.log('\n--- 2. Language Breakdown & Percentage Calculations ---');

  const rawLangs = { JavaScript: 75000, HTML: 15000, CSS: 10000 };
  const calculated = GitHubService.calculateLanguagePercentages(rawLangs);
  
  assert('Calculates 3 languages from breakdown', calculated.length === 3);
  assert('Calculates correct 75.0% for JavaScript', calculated[0].name === 'JavaScript' && calculated[0].percentage === 75.0);
  assert('Calculates correct 15.0% for HTML', calculated[1].name === 'HTML' && calculated[1].percentage === 15.0);
  assert('Calculates correct 10.0% for CSS', calculated[2].name === 'CSS' && calculated[2].percentage === 10.0);
  assert('Calculates empty array for 0 bytes', GitHubService.calculateLanguagePercentages({}).length === 0);

  // =========================================================================
  // 3. Full Repository Evidence Retrieval (Mocked Fetcher)
  // =========================================================================
  console.log('\n--- 3. Repository Evidence Mining Execution ---');

  GitHubService.clearCache();
  const mockFetch = createMockGitHubFetcher();

  const snapshot = await GitHubService.fetchRepositoryEvidence(
    'https://github.com/test-owner/test-repo',
    { customFetch: mockFetch, candidateEmail: 'alex@example.com' }
  );

  assert('Mines repository owner and name correctly', 
    snapshot.githubHandle === 'test-owner' && snapshot.repoName === 'test-repo');
  assert('Preserves stargazers count', snapshot.stargazersCount === 42);
  assert('Preserves default branch as main', snapshot.defaultBranch === 'main');
  assert('Preserves language breakdown', snapshot.languages.length === 3);
  assert('Detects express dependency from package.json', snapshot.detectedDependencies.includes('express'));
  assert('Detects react dependency from package.json', snapshot.detectedDependencies.includes('react'));
  assert('Detects devDependency jest from package.json', snapshot.detectedDependencies.includes('jest'));
  assert('Detects automated test suite in repository (hasTestFiles = true)', snapshot.hasTestFiles === true);
  assert('Filters out node_modules, .git, and binaries from file count', snapshot.fileCount === 3); // package.json, server.js, server.test.js
  assert('Mines recent commits with author verification', snapshot.authenticCommits.length > 0);
  assert('Verifies commit authored flag matching candidate email', snapshot.authenticCommits[0].verifiedAuthored === true);

  // =========================================================================
  // 4. In-Memory Caching Verification
  // =========================================================================
  console.log('\n--- 4. In-Memory Snapshots Caching ---');

  // Second fetch without bypassCache should return cached object
  let fetchCount = 0;
  const countingFetch = async (url, opts) => {
    fetchCount++;
    return mockFetch(url, opts);
  };

  await GitHubService.fetchRepositoryEvidence(
    'https://github.com/test-owner/test-repo',
    { customFetch: countingFetch }
  );
  assert('Hits in-memory cache on subsequent call (zero additional network requests)', fetchCount === 0);

  // =========================================================================
  // 5. API Rate Limit & 404 Error Handling
  // =========================================================================
  console.log('\n--- 5. API Rate Limits & Error Boundary Verification ---');

  // Rate Limit 403/429
  let rateLimitError = null;
  try {
    GitHubService.clearCache();
    await GitHubService.fetchRepositoryEvidence(
      'https://github.com/test-owner/test-repo',
      { customFetch: createMockGitHubFetcher({ simulateRateLimit: true }) }
    );
  } catch (err) {
    rateLimitError = err;
  }
  assert('Rate limit triggers HTTP 429 AppError', 
    rateLimitError instanceof AppError && rateLimitError.statusCode === 429);
  assert('Rate limit error message guides user regarding 60 req/hr and GITHUB_TOKEN', 
    rateLimitError.message.includes('60 requests/hour') && rateLimitError.message.includes('GITHUB_TOKEN'));

  // 404 Not Found / Private Repo
  let notFoundError = null;
  try {
    GitHubService.clearCache();
    await GitHubService.fetchRepositoryEvidence(
      'https://github.com/test-owner/test-repo',
      { customFetch: createMockGitHubFetcher({ simulateNotFound: true }) }
    );
  } catch (err) {
    notFoundError = err;
  }
  assert('Non-existent or private repo triggers HTTP 404 AppError', 
    notFoundError instanceof AppError && notFoundError.statusCode === 404);
  assert('404 message explicitly mentions public repository requirement', 
    notFoundError.message.includes('requires public GitHub repositories'));

  // =========================================================================
  // 6. RepositoryService Persistence & Schema Compliance
  // =========================================================================
  console.log('\n--- 6. RepositoryService Persistence & Schema Compliance ---');

  GitHubService.clearCache();
  const userId = '12345678-1234-1234-1234-123456789012';
  const persisted = await RepositoryService.fetchAndPersistRepository(
    'https://github.com/test-owner/test-repo',
    userId,
    { customFetch: mockFetch }
  );

  assert('Persisted snapshot records userId', persisted.userId === userId);
  assert('Persisted snapshot records repoName', persisted.repoName === 'test-repo');
  assert('Persisted snapshot preserves detected dependencies', persisted.detectedDependencies.includes('prisma'));

  // Validate Mongoose schema
  const mongoDoc = new RepositorySnapshot(persisted);
  const schemaError = mongoDoc.validateSync();
  assert('RepositorySnapshot Mongoose document passes schema validation', !schemaError);

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n===============================================');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log('===============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled GitHub test failure:', err);
  process.exit(1);
});
