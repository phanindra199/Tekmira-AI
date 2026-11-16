/**
 * Tekmira AI — MongoDB Aggregation Analytics Controller (Day 18)
 * 
 * Exposes endpoints for cohort-level skill deficits, readiness tier distribution,
 * and individual longitudinal candidate growth trajectories.
 */

import { AnalyticsAggregationService } from '../services/analyticsAggregationService.js';

export const getCohortAnalytics = async (req, res, next) => {
  try {
    const data = await AnalyticsAggregationService.getCohortOverview();
    return res.status(200).json({
      success: true,
      message: 'Cohort analytics retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateTrajectory = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user?.id;
    const data = await AnalyticsAggregationService.getCandidateTrajectory(userId);
    return res.status(200).json({
      success: true,
      message: 'Candidate PRI trajectory retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewAnalytics = async (req, res, next) => {
  try {
    const data = await AnalyticsAggregationService.getInterviewAnalytics();
    return res.status(200).json({
      success: true,
      message: 'Interview practice analytics retrieved successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCohortAnalytics,
  getCandidateTrajectory,
  getInterviewAnalytics
};
