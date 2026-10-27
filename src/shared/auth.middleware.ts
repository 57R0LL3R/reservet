
import type { RequestHandler } from 'express';
import {
  AuthServiceError,
  verifyToken,
} from '../modules/auth/auth.service.js';

export const requireAuth: RequestHandler = (
  req,
  res,
  next,
) => {
  const authorization = req.get('authorization');

  if (!authorization) {
    res.status(401).json({
      code: 'AUTH_REQUIRED',
      message: 'Debes iniciar sesión.',
    });
    return;
  }

  const match = /^Bearer\s+(\S+)$/i.exec(authorization);

  if (!match) {
    res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Debes enviar un token Bearer válido.',
    });
    return;
  }

  try {
    res.locals.userId = verifyToken(match[1]!);
    next();
  } catch (error: unknown) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({
        code: error.code,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};
