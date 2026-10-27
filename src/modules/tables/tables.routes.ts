
import { Router, type NextFunction, type Response } from 'express';
import {
  changeTableStatus,
  createNewTable,
  getTables,
  TableServiceError,
} from './tables.service.js';

const router = Router();

function handleError(
  error: unknown,
  res: Response,
  next: NextFunction,
): void {
  if (error instanceof TableServiceError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
    });
    return;
  }

  next(error);
}

router.get('/', async (_req, res, next) => {
  try {
    const tables = await getTables();
    res.status(200).json(tables);
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const table = await createNewTable(req.body);
    res.status(201).json(table);
  } catch (error: unknown) {
    handleError(error, res, next);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const table = await changeTableStatus(
      req.params.id,
      req.body?.status,
    );

    res.status(200).json(table);
  } catch (error: unknown) {
    handleError(error, res, next);
  }
});

export default router;
