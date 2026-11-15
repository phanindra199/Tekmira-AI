import { AuthService } from '../services/authService.js';

/**
 * Authentication Controller
 * Handles HTTP requests for candidate registration, authentication, and profile verification
 */
export const register = async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);

    return res.status(201).json({
      success: true,
      message: 'Candidate account registered successfully',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user was populated by authenticate middleware
    const user = await AuthService.getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export default { register, login, getMe };
