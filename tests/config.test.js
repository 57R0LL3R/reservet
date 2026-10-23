import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
const { readConfig } = await import('../src/shared/config.ts');

test('rechaza configuración inválida antes de abrir el servidor', () => {
  for (const PORT of ['0', '-1', 'abc', '65536', '3.5', '']) {
    assert.throws(() => readConfig({ PORT, DATABASE_URL: process.env.DATABASE_URL }), /PORT/);
  }
  for (const DATABASE_URL of ['', 'invalid', 'https://localhost/db']) {
    assert.throws(() => readConfig({ DATABASE_URL }), /DATABASE_URL/);
  }
  assert.equal(readConfig({ DATABASE_URL: process.env.DATABASE_URL }).port, 3000);
});
