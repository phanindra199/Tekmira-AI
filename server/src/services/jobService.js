import { getPrismaClient } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

// Fallback benchmark jobs for development/offline mode
const FALLBACK_BENCHMARK_JOBS = [
  {
    id: 'job-bench-001',
    title: 'Junior Full-Stack Engineer (Campus 2026)',
    company: 'CloudScale Technologies',
    location: 'Bangalore, India (Hybrid)',
    jobType: 'Full-Time',
    minExperience: 0,
    requiredSkills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Git', 'REST APIs'],
    rawText: 'We are looking for an ambitious 2026 Graduate Junior Full-Stack Engineer with React, Node.js and SQL skills.'
  },
  {
    id: 'job-bench-002',
    title: 'Backend Systems Engineer (Internship)',
    company: 'Nexus Distributed Labs',
    location: 'Remote',
    jobType: 'Internship',
    minExperience: 0,
    requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis', 'Jest', 'Git'],
    rawText: 'Backend engineering internship focusing on scalable API services and automated testing.'
  },
  {
    id: 'job-bench-003',
    title: 'Frontend UI/UX Engineer',
    company: 'Veloce Digital Systems',
    location: 'Hyderabad, India (On-site)',
    jobType: 'Full-Time',
    minExperience: 0,
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'State Management'],
    rawText: 'Frontend UI developer with strong functional component and responsive CSS skills.'
  }
];

/**
 * Job Service
 * Manages benchmark campus job descriptions and candidate saved jobs
 */
export class JobService {
  /**
   * Retrieves all available campus benchmark jobs
   * @returns {Promise<Array>}
   */
  static async getAllJobs() {
    try {
      const prisma = getPrismaClient();
      const jobs = await prisma.jobDescription.findMany({
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          jobType: true,
          minExperience: true,
          requiredSkills: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return jobs.length > 0 ? jobs : FALLBACK_BENCHMARK_JOBS;
    } catch (error) {
      // Graceful offline fallback
      return FALLBACK_BENCHMARK_JOBS;
    }
  }

  /**
   * Retrieves single job posting by ID
   * @param {string} jobId
   * @returns {Promise<Object>}
   */
  static async getJobById(jobId) {
    try {
      const prisma = getPrismaClient();
      const job = await prisma.jobDescription.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        const fallback = FALLBACK_BENCHMARK_JOBS.find(j => j.id === jobId);
        if (!fallback) throw new AppError('Job description not found', 404);
        return fallback;
      }
      return job;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const fallback = FALLBACK_BENCHMARK_JOBS.find(j => j.id === jobId);
      if (!fallback) throw new AppError('Job description not found', 404);
      return fallback;
    }
  }

  /**
   * Saves/Bookmarks a job for a candidate
   * @param {string} userId
   * @param {string} jobId
   * @returns {Promise<Object>}
   */
  static async saveJob(userId, jobId) {
    if (!userId || !jobId) {
      throw new AppError('userId and jobId are required', 400);
    }

    const prisma = getPrismaClient();
    try {
      return await prisma.savedJob.create({
        data: { userId, jobId }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Job is already saved in your bookmarks', 409);
      }
      throw error;
    }
  }
}

export default JobService;
