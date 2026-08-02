import { readFile } from 'node:fs/promises';

// A tiny dotenv reader. Local scripts need the same keys the app reads, and a real
// dependency would be more than this is worth. Values already present in the
// environment win, so a one-off override on the command line still works.
export async function loadEnvFiles() {
  await loadEnvFile('.env.local');
  await loadEnvFile('.env');
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
