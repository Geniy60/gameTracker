import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Client } from 'pg';

await loadEnvFile('.env.local');
await loadEnvFile('.env');

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

async function loadEnvFile(envPath) {
  let contents;

  try {
    contents = await readFile(envPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }

    throw error;
  }

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = unquoteEnvValue(rawValue.trim());
  }
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
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
