import { getPrismaClient } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

const APPLICATION_STATUSES = new Set(['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED']);

/**
 * Job Application & Relational Queries Service
 * 
 * Implements relational query logic using Prisma ORM with equivalent
 * SQL JOIN demonstrations for academic viva voce and technical defense.
 */
export class JobApplicationService {
  /** Apply atomically and remove a matching bookmark when one exists. */
  static async applyToJob(userId, jobId) {
    const prisma = getPrismaClient();
    return prisma.$transaction(async (tx) => {
      const existing = await tx.jobApplication.findFirst({ where: { userId, jobId } });
      if (existing) return existing;
      const application = await tx.jobApplication.create({ data: { userId, jobId, status: 'APPLIED', appliedAt: new Date() } });
      await tx.savedJob.deleteMany({ where: { userId, jobId } });
      return application;
    });
  }

  /**
   * Fetches all job applications for a user with their associated job descriptions
   * Demonstrates 1-to-many relationship and foreign key traversal.
   * 
   * Equivalent SQL:
   * SELECT a.id, a.status, a.matchScore, a.appliedAt, 
   *        j.id as jobId, j.title, j.company, j.location, j.requiredSkills
   * FROM job_applications a
   * INNER JOIN job_descriptions j ON a.jobId = j.id
   * WHERE a.userId = $1
   * ORDER BY a.createdAt DESC;
   * 
   * @param {string} userId - UUID of the student user
   * @returns {Promise<Array>} List of applications with embedded job details
   */
  static async getUserApplications(userId) {
    const prisma = getPrismaClient();
    return await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            jobType: true,
            requiredSkills: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /** Update one of the signed-in candidate's application statuses (CRUD: Update). */
  static async updateUserApplication(userId, applicationId, status) {
    if (!APPLICATION_STATUSES.has(status)) throw new AppError('Invalid application status', 400);
    const prisma = getPrismaClient();
    const result = await prisma.jobApplication.updateMany({
      where: { id: applicationId, userId },
      data: { status, ...(status === 'APPLIED' ? { appliedAt: new Date() } : {}) }
    });
    if (result.count === 0) throw new AppError('Application not found', 404);
    return prisma.jobApplication.findFirst({
      where: { id: applicationId, userId },
      include: { job: { select: { id: true, title: true, company: true, location: true, jobType: true, requiredSkills: true } } }
    });
  }

  /** Delete one of the signed-in candidate's applications (CRUD: Delete). */
  static async deleteUserApplication(userId, applicationId) {
    const prisma = getPrismaClient();
    const result = await prisma.jobApplication.deleteMany({ where: { id: applicationId, userId } });
    if (result.count === 0) throw new AppError('Application not found', 404);
  }

  /**
   * Fetches all saved (bookmarked) jobs for a user
   * Demonstrates many-to-many junction table traversal (User -> SavedJob -> JobDescription).
   * 
   * Equivalent SQL:
   * SELECT s.id, s.savedAt, j.id as jobId, j.title, j.company, j.requiredSkills
   * FROM saved_jobs s
   * INNER JOIN job_descriptions j ON s.jobId = j.id
   * WHERE s.userId = $1
   * ORDER BY s.savedAt DESC;
   * 
   * @param {string} userId - UUID of the candidate user
   * @returns {Promise<Array>} List of saved jobs with details
   */
  static async getUserSavedJobs(userId) {
    const prisma = getPrismaClient();
    return await prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: true
      },
      orderBy: { savedAt: 'desc' }
    });
  }

  /**
   * Fetches a job posting along with all candidate applicants
   * Demonstrates recruiter view joining JobDescription -> JobApplication -> User.
   * 
   * Equivalent SQL:
   * SELECT j.id, j.title, j.company, 
   *        a.id as applicationId, a.status, a.matchScore,
   *        u.id as userId, u.fullName, u.githubHandle, u.email
   * FROM job_descriptions j
   * LEFT JOIN job_applications a ON j.id = a.jobId
   * LEFT JOIN users u ON a.userId = u.id
   * WHERE j.id = $1;
   * 
   * @param {string} jobId - UUID of the target job posting
   * @returns {Promise<Object>} Job description with list of candidate applications
   */
  static async getJobWithApplicants(jobId) {
    const prisma = getPrismaClient();
    return await prisma.jobDescription.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                githubHandle: true,
                collegeName: true,
                graduationYr: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Returns documentation on equivalent SQL JOIN statements for viva presentation
   * @returns {Object}
   */
  static getVivaJoinReference() {
    return {
      candidateApplications: `
        SELECT u.fullName, u.githubHandle, j.title, j.company, a.status, a.matchScore
        FROM users u
        INNER JOIN job_applications a ON u.id = a.userId
        INNER JOIN job_descriptions j ON a.jobId = j.id;
      `.trim(),
      inactiveCandidates: `
        SELECT u.fullName, u.email
        FROM users u
        LEFT JOIN job_applications a ON u.id = a.userId
        WHERE a.id IS NULL;
      `.trim(),
      jobMatchAggregation: `
        SELECT j.title, j.company, ROUND(AVG(a.matchScore)::numeric, 2) AS avgMatch, COUNT(a.id) AS applicantCount
        FROM job_descriptions j
        INNER JOIN job_applications a ON j.id = a.jobId
        GROUP BY j.id, j.title, j.company
        ORDER BY avgMatch DESC;
      `.trim()
    };
  }
}

export default JobApplicationService;
