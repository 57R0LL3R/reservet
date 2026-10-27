
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  createUser,
  findUserByEmail,
  findUserById,
  type UserRecord,
} from './auth.repository.js';

export interface PublicUserDTO {
  id: number;
  email: string;
  createdAt: Date;
}

export interface AuthResult {
  user: PublicUserDTO;
  token: string;
}

export class AuthServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 bytes.');
  }

  return secret;
}

function toPublicUser(user: UserRecord): PublicUserDTO {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
  };
}

function createToken(user: UserRecord): string {
  return jwt.sign({}, getJwtSecret(), {
    subject: String(user.id),
    expiresIn: '1h',
  });
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') {
    throw new AuthServiceError(
      400,
      'INVALID_EMAIL',
      'Debes proporcionar un correo válido.',
    );
  }

  const email = value.trim().toLowerCase();

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new AuthServiceError(
      400,
      'INVALID_EMAIL',
      'Debes proporcionar un correo válido.',
    );
  }

  return email;
}

function validatePassword(value: unknown): string {
  if (
    typeof value !== 'string' ||
    value.length < 8 ||
    Buffer.byteLength(value, 'utf8') > 72
  ) {
    throw new AuthServiceError(
      400,
      'INVALID_PASSWORD',
      'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.',
    );
  }

  return value;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}

export async function register(
  input: unknown,
): Promise<AuthResult> {
  if (
    typeof input !== 'object' ||
    input === null ||
    Array.isArray(input)
  ) {
    throw new AuthServiceError(
      400,
      'INVALID_BODY',
      'El cuerpo debe ser un objeto JSON.',
    );
  }

  const body = input as Record<string, unknown>;
  const email = normalizeEmail(body.email);
  const password = validatePassword(body.password);

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AuthServiceError(
      409,
      'EMAIL_ALREADY_REGISTERED',
      'Este correo ya está registrado.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let user: UserRecord;

  try {
    user = await createUser({ email, passwordHash });
  } catch (error: unknown) {
    // La restricción UNIQUE también protege ante registros simultáneos.
    if (isUniqueViolation(error)) {
      throw new AuthServiceError(
        409,
        'EMAIL_ALREADY_REGISTERED',
        'Este correo ya está registrado.',
      );
    }

    throw error;
  }

  return {
    user: toPublicUser(user),
    token: createToken(user),
  };
}

export async function login(
  input: unknown,
): Promise<AuthResult> {
  if (
    typeof input !== 'object' ||
    input === null ||
    Array.isArray(input)
  ) {
    throw new AuthServiceError(
      400,
      'INVALID_BODY',
      'El cuerpo debe ser un objeto JSON.',
    );
  }

  const body = input as Record<string, unknown>;
  const email = normalizeEmail(body.email);

  if (
    typeof body.password !== 'string' ||
    body.password.length === 0
  ) {
    throw new AuthServiceError(
      400,
      'INVALID_PASSWORD',
      'Debes proporcionar una contraseña.',
    );
  }

  const user = await findUserByEmail(email);
  const passwordMatches = user
    ? await bcrypt.compare(body.password, user.password_hash)
    : false;

  if (!user || !passwordMatches) {
    throw new AuthServiceError(
      401,
      'INVALID_CREDENTIALS',
      'Correo o contraseña incorrectos.',
    );
  }

  return {
    user: toPublicUser(user),
    token: createToken(user),
  };
}

export async function getAuthenticatedUser(
  id: number,
): Promise<PublicUserDTO> {
  const user = await findUserById(id);

  if (!user) {
    throw new AuthServiceError(
      401,
      'INVALID_TOKEN',
      'El usuario del token ya no existe.',
    );
  }

  return toPublicUser(user);
}

export function verifyToken(token: string): number {
  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !/^[1-9]\d*$/.test(payload.sub)
    ) {
      throw new Error('Token sin identificador válido.');
    }

    const id = Number(payload.sub);

    if (!Number.isSafeInteger(id)) {
      throw new Error('Identificador fuera de rango.');
    }

    return id;
  } catch {
    throw new AuthServiceError(
      401,
      'INVALID_TOKEN',
      'El token es inválido o ha expirado.',
    );
  }
}
