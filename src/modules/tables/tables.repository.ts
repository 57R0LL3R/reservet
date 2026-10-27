
import { pool } from '../../shared/database.js';

export type TableStatus =
  | 'available'
  | 'occupied'
  | 'out_of_service';

export interface RestaurantTable {
  id: number;
  name: string;
  capacity: number;
  status: TableStatus;
  created_at: Date;
}

export interface CreateTableData {
  name: string;
  capacity: number;
}

export async function listTables(): Promise<RestaurantTable[]> {
  const result = await pool.query<RestaurantTable>(
    `SELECT id, name, capacity, status, created_at
     FROM restaurant_tables
     ORDER BY id ASC`,
  );

  return result.rows;
}

export async function createTable(
  data: CreateTableData,
): Promise<RestaurantTable> {
  const result = await pool.query<RestaurantTable>(
    `INSERT INTO restaurant_tables (name, capacity)
     VALUES ($1, $2)
     RETURNING id, name, capacity, status, created_at`,
    [data.name, data.capacity],
  );

  return result.rows[0]!;
}

export async function updateTableStatus(
  id: number,
  status: TableStatus,
): Promise<RestaurantTable | null> {
  const result = await pool.query<RestaurantTable>(
    `UPDATE restaurant_tables
     SET status = $1
     WHERE id = $2
     RETURNING id, name, capacity, status, created_at`,
    [status, id],
  );

  return result.rows[0] ?? null;
}
