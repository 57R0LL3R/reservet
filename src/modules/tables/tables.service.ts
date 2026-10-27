
import {
  createTable as insertTable,
  listTables as findTables,
  updateTableStatus as saveTableStatus,
  type TableStatus,
} from './tables.repository.js';

export class TableServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'TableServiceError';
  }
}

const validStatuses: TableStatus[] = [
  'available',
  'occupied',
  'out_of_service',
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function getTables() {
  return findTables();
}

export async function createNewTable(input: unknown) {
  if (!isObject(input)) {
    throw new TableServiceError(400, 'INVALID_BODY', 'El cuerpo debe ser un objeto JSON.');
  }

  if (typeof input.name !== 'string') {
    throw new TableServiceError(400, 'INVALID_NAME', 'El nombre debe ser texto.');
  }

  const name = input.name.trim();

  if (name.length === 0 || name.length > 80) {
    throw new TableServiceError(
      400,
      'INVALID_NAME',
      'El nombre debe tener entre 1 y 80 caracteres.',
    );
  }

  if (
    typeof input.capacity !== 'number' ||
    !Number.isInteger(input.capacity) ||
    input.capacity < 1 ||
    input.capacity > 20
  ) {
    throw new TableServiceError(
      400,
      'INVALID_CAPACITY',
      'La capacidad debe ser un entero entre 1 y 20.',
    );
  }

  try {
    return await insertTable({
      name,
      capacity: input.capacity,
    });
  } catch (error: unknown) {
    if (
      isObject(error) &&
      error.code === '23505'
    ) {
      throw new TableServiceError(
        409,
        'TABLE_NAME_EXISTS',
        'Ya existe una mesa con ese nombre.',
      );
    }

    throw error;
  }
}

export async function changeTableStatus(
  rawId: unknown,
  rawStatus: unknown,
) {
  const id =
    typeof rawId === 'string' && /^\d+$/.test(rawId)
      ? Number(rawId)
      : rawId;

  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) {
    throw new TableServiceError(
      400,
      'INVALID_ID',
      'El identificador debe ser un entero positivo.',
    );
  }

  if (
    typeof rawStatus !== 'string' ||
    !validStatuses.includes(rawStatus as TableStatus)
  ) {
    throw new TableServiceError(
      400,
      'INVALID_STATUS',
      'El estado de la mesa no es válido.',
    );
  }

  const table = await saveTableStatus(id, rawStatus as TableStatus);

  if (!table) {
    throw new TableServiceError(
      404,
      'TABLE_NOT_FOUND',
      'No existe una mesa con ese identificador.',
    );
  }

  return table;
}
