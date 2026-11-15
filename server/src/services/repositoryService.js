import mongoose from 'mongoose';
import { RepositorySnapshot } from '../models/RepositorySnapshot.js';
import { GitHubService } from './githubService.js';
import { AppError } from '../utils/AppError.js';

/**
 * Repository Service
 * Manages CRUD operations and GitHub evidence mining workflows for candidate repositories
 */
export class RepositoryService {
  /**
   * Mine repository evidence from GitHub API and persist to MongoDB
   * 
   * @param {string} repoUrl - Public GitHub URL
   * @param {string} userId - Authenticated user UUID or guest ID
   * @param {Object} options - { candidateEmail?: string, bypassCache?: boolean, customFetch?: Function }
   * @returns {Promise<Object>} Persisted repository snapshot
   */
  static async fetchAndPersistRepository(repoUrl, userId, options = {}) {
    if (!repoUrl) {
      throw new AppError('GitHub repository URL is required', 400);
    }

    const candidateUserId = userId || '00000000-0000-0000-0000-000000000000';

    // 1. Mine repository snapshot via GitHub REST API
    const snapshotData = await GitHubService.fetchRepositoryEvidence(repoUrl, options);

    // 2. Prepare database payload
    const payload = {
      userId: candidateUserId,
      githubHandle: snapshotData.githubHandle,
      repoName: snapshotData.repoName,
      repoUrl: snapshotData.repoUrl,
      isFork: snapshotData.isFork,
      defaultBranch: snapshotData.defaultBranch,
      stargazersCount: snapshotData.stargazersCount,
      languages: snapshotData.languages,
      authenticCommits: snapshotData.authenticCommits,
      detectedDependencies: snapshotData.detectedDependencies,
      hasTestFiles: snapshotData.hasTestFiles,
      minedAt: snapshotData.minedAt || new Date()
    };

    // 3. Upsert into MongoDB
    if (mongoose.connection.readyState === 1) {
      const filter = { userId: candidateUserId, repoName: snapshotData.repoName };
      const upsertOptions = { new: true, upsert: true, runValidators: true };
      return await RepositorySnapshot.findOneAndUpdate(filter, payload, upsertOptions);
    }

    // Offline / testing fallback
    return {
      _id: new mongoose.Types.ObjectId(),
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * CREATE or UPDATE: Upsert a repository snapshot for a candidate
   * @param {Object} repoData
   * @returns {Promise<Object>} Upserted Repository Snapshot
   */
  static async upsertRepositorySnapshot(repoData) {
    if (!repoData.userId || !repoData.repoName || !repoData.githubHandle) {
      throw new AppError('userId, repoName, and githubHandle are required', 400);
    }

    const filter = { userId: repoData.userId, repoName: repoData.repoName };
    const options = { new: true, upsert: true, runValidators: true };

    if (mongoose.connection.readyState === 1) {
      return await RepositorySnapshot.findOneAndUpdate(filter, repoData, options);
    }

    return {
      _id: new mongoose.Types.ObjectId(),
      ...repoData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * READ: Fetch all mined repository snapshots for a candidate
   * @param {string} userId - PostgreSQL User UUID
   * @returns {Promise<Array>}
   */
  static async getUserRepositories(userId) {
    if (!userId) {
      throw new AppError('Candidate user identifier is required', 400);
    }
    if (mongoose.connection.readyState !== 1) {
      return [];
    }
    return await RepositorySnapshot.find({ userId }).sort({ stargazersCount: -1, updatedAt: -1 });
  }

  /**
   * READ: Fetch a specific repository snapshot by ID
   * @param {string} snapshotId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async getRepositoryById(snapshotId, userId) {
    if (!mongoose.Types.ObjectId.isValid(snapshotId)) {
      throw new AppError(`Invalid repository snapshot ID: '${snapshotId}'`, 400);
    }

    if (mongoose.connection.readyState !== 1) {
      return {
        _id: snapshotId,
        userId: userId || '00000000-0000-0000-0000-000000000000',
        githubHandle: 'sample-author',
        repoName: 'sample-repo',
        repoUrl: 'https://github.com/sample-author/sample-repo',
        languages: [{ name: 'JavaScript', bytes: 1000, percentage: 100 }],
        detectedDependencies: ['express', 'react'],
        hasTestFiles: true
      };
    }

    const document = await RepositorySnapshot.findById(snapshotId);
    if (!document) {
      throw new AppError('Repository snapshot not found', 404);
    }

    if (userId && document.userId !== userId) {
      throw new AppError('Access denied: Unauthorized to view this repository snapshot', 403);
    }

    return document;
  }

  /**
   * DELETE: Remove a repository snapshot with ownership verification
   * @param {string} snapshotId
   * @param {string} userId
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async deleteRepository(snapshotId, userId) {
    await this.getRepositoryById(snapshotId, userId);
    if (mongoose.connection.readyState === 1) {
      await RepositorySnapshot.findByIdAndDelete(snapshotId);
    }

    return {
      success: true,
      message: 'Repository snapshot deleted successfully'
    };
  }
}

export default RepositoryService;
