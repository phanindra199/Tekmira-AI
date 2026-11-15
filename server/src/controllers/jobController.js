import { JobService } from '../services/jobService.js';

export const getJobs = async (req, res, next) => {
  try {
    const jobs = await JobService.getAllJobs();
    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await JobService.getJobById(req.params.id);
    return res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const result = await JobService.saveJob(userId, req.params.jobId);
    return res.status(201).json({
      success: true,
      message: 'Job successfully saved to your bookmarks',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default { getJobs, getJobById, saveJob };
