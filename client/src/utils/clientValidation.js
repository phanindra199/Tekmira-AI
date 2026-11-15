/**
 * Tekmira AI — Client-Side Validation Utilities
 * 
 * Provides fast, synchronous client-side validation to provide immediate UI feedback,
 * improve accessibility (aria-invalid), and prevent unnecessary network calls.
 * 
 * NOTE: Server-side Zod validation remains the authoritative security boundary.
 */

// GitHub repository regex: https://github.com/owner/repository
export const GITHUB_REPO_REGEX = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/;

// GitHub username regex: alphanumeric with single hyphens, 1-39 chars
export const GITHUB_HANDLE_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

// Standard RFC 5322 simplified email regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email address format and non-empty state
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email address is required.';
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return 'Email address cannot be empty or whitespace.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address (e.g., student@university.edu).';
  }
  return null;
}

/**
 * Validate password length and presence
 */
export function validatePassword(password, minLength = 8) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  if (password.length > 128) {
    return 'Password must not exceed 128 characters.';
  }
  return null;
}

/**
 * Validate candidate full name
 */
export function validateFullName(name) {
  if (!name || typeof name !== 'string') {
    return 'Full name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  if (trimmed.length > 100) {
    return 'Full name must not exceed 100 characters.';
  }
  return null;
}

/**
 * Validate GitHub public repository URL
 */
export function validateGitHubUrl(url) {
  if (!url || typeof url !== 'string') {
    return 'GitHub repository URL is required.';
  }
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return 'Please provide a repository URL.';
  }
  if (!trimmed.startsWith('https://github.com/')) {
    return 'Repository must be hosted on public GitHub (starting with https://github.com/).';
  }
  const match = trimmed.match(GITHUB_REPO_REGEX);
  if (!match) {
    return 'Please enter a valid GitHub repository URL format: https://github.com/owner/repository';
  }
  return null;
}

/**
 * Validate GitHub username / handle
 */
export function validateGitHubHandle(handle) {
  if (!handle || typeof handle !== 'string') return null; // Optional
  const trimmed = handle.trim().replace(/^@/, '');
  if (trimmed.length === 0) return null;
  if (!GITHUB_HANDLE_REGEX.test(trimmed)) {
    return 'Invalid GitHub username format. Alphanumeric and single hyphens only (max 39 chars).';
  }
  return null;
}

/**
 * Validate custom job description text
 */
export function validateCustomJobDescription(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < 20) {
    return 'Job description is too brief. Please provide at least 20 characters of responsibilities or requirements.';
  }
  if (trimmed.length > 20000) {
    return 'Job description exceeds maximum limit of 20,000 characters.';
  }
  return null;
}

/**
 * Validate student viva voce answer
 */
export function validateVivaAnswer(answer) {
  if (!answer || typeof answer !== 'string') {
    return 'Technical answer is required.';
  }
  const trimmed = answer.trim();
  if (trimmed.length < 15) {
    return `Answer is too brief (${trimmed.length} chars). Please provide at least 15 characters of architectural explanation.`;
  }
  if (trimmed.length > 4000) {
    return `Answer exceeds maximum limit of 4,000 characters (${trimmed.length} chars).`;
  }
  return null;
}

/**
 * Sanitize untrusted input strings
 */
export function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  // Strip null bytes and non-printable control characters (except newline \n and tab \t)
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export default {
  validateEmail,
  validatePassword,
  validateFullName,
  validateGitHubUrl,
  validateGitHubHandle,
  validateCustomJobDescription,
  validateVivaAnswer,
  sanitizeInput
};
