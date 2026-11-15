import { InterviewService } from '../services/interviewService.js';

export const createSessionHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || req.body?.userId || '00000000-0000-0000-0000-000000000000';
    const { reportId, difficulty, targetRole } = req.body;

    const session = await InterviewService.generateSession({
      userId,
      reportId,
      difficulty,
      targetRole
    });

    return res.status(201).json({
      success: true,
      message: 'Interview practice session generated successfully',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

export const evaluateAnswerHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || req.body?.userId;
    const { sessionId } = req.params;
    const { questionIndex, studentAnswer } = req.body;

    const result = await InterviewService.evaluateAnswer({
      sessionId,
      questionIndex,
      studentAnswer,
      userId
    });

    return res.status(200).json({
      success: true,
      message: 'Answer evaluated against viva rubrics',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || req.query?.userId;
    const session = await InterviewService.getSessionById(req.params.id, userId);

    return res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSessionsHandler = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user?.id;
    const sessions = await InterviewService.getUserSessions(userId);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createSessionHandler,
  evaluateAnswerHandler,
  getSessionHandler,
  getUserSessionsHandler
};
