import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Client } from 'pg';
import { loadEnvFiles } from './loadEnv.mjs';

await loadEnvFiles();

const requestedMigrationPath = process.argv[2];
const migrationPath =
  requestedMigrationPath === 'latest'
    ? await getLatestMigrationPath()
    : requestedMigrationPath;
const connectionString =
  process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!migrationPath) {
  console.error('Usage: node scripts/applyMigration.mjs <migration.sql|latest>');
  process.exit(1);
}

if (!connectionString) {
  console.error('Set SUPABASE_DATABASE_URL or DATABASE_URL before running.');
  process.exit(1);
}

const sql = await readFile(migrationPath, 'utf8');
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query('begin');
  await client.query(sql);
  await client.query('commit');
  console.log(`Applied migration: ${migrationPath}`);
} catch (error) {
  await client.query('rollback').catch(() => undefined);
  throw error;
} finally {
  await client.end();
}

async function getLatestMigrationPath() {
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();
  const latestMigrationFile = migrationFiles.at(-1);

  if (!latestMigrationFile) {
    console.error('No migration files found in supabase/migrations.');
    process.exit(1);
  }

  return join(migrationsDir, latestMigrationFile);
}
