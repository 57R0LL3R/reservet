
import {
  Router,
  type Response,
  type NextFunction,
} from 'express';
import {
  AuthServiceError,
  getAuthenticatedUser,
  login,
  register,
} from './auth.service.js';
import { requireAuth } from '../../shared/auth.middleware.js';

const router = Router();

function handleError(
  error: unknown,
  res: Response,
  next: NextFunction,
): void {
  if (error instanceof AuthServiceError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
    });
    return;
  }

  next(error);
}

router.post('/register', async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (error: unknown) {
    handleError(error, res, next);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.status(200).json(result);
  } catch (error: unknown) {
    handleError(error, res, next);
  }
});

router.get('/me', requireAuth, async (_req, res, next) => {
  try {
    const user = await getAuthenticatedUser(res.locals.userId);
    res.status(200).json({ user });
  } catch (error: unknown) {
    handleError(error, res, next);
  }
});

export default router;
