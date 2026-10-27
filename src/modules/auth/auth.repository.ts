
import { pool } from '../../shared/database.js';

export interface UserRecord {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
}

export async function findUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    `SELECT id, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function findUserById(
  id: number,
): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    `SELECT id, email, password_hash, created_at
     FROM users
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createUser(
  data: CreateUserData,
): Promise<UserRecord> {
  const result = await pool.query<UserRecord>(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, password_hash, created_at`,
    [data.email, data.passwordHash],
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error('La inserción no devolvió el usuario.');
  }

  return user;
}
