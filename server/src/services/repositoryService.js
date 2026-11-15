import { RepositorySnapshot } from '../models/RepositorySnapshot.js';
import { AppError } from '../utils/AppError.js';

/**
 * Repository Service
 * Manages CRUD operations for mined GitHub repository snapshots in MongoDB
 */
export class RepositoryService {
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

    return await RepositorySnapshot.findOneAndUpdate(filter, repoData, options);
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
    return await RepositorySnapshot.find({ userId }).sort({ stargazersCount: -1, updatedAt: -1 });
  }

  /**
   * READ: Fetch a specific repository snapshot by ID
   * @param {string} snapshotId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async getRepositoryById(snapshotId, userId) {
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
    await RepositorySnapshot.findByIdAndDelete(snapshotId);

    return {
      success: true,
      message: 'Repository snapshot deleted successfully'
    };
  }
}

export default RepositoryService;
