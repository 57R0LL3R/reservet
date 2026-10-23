import 'dotenv/config';

// Validar configuración al arrancar evita errores confusos en la primera petición.
export function readConfig(env: NodeJS.ProcessEnv) {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un entero entre 1 y 65535.');
  }
  if (!env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL. Copia .env.example a .env.');
  }
  let databaseUrl: URL;
  try {
    databaseUrl = new URL(env.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL debe ser una URL de PostgreSQL válida.');
  }
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol) || !databaseUrl.hostname) {
    throw new Error('DATABASE_URL debe usar postgres:// o postgresql:// con un servidor.');
  }
  return Object.freeze({ port, databaseUrl: env.DATABASE_URL });
}

export const config = readConfig(process.env);
