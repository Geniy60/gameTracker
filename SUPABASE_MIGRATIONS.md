# Supabase Migrations

Use the project migration runner:

```powershell
npm.cmd run db:apply -- supabase/migrations/<migration-file>.sql
```

To apply the latest migration file:

```powershell
npm.cmd run db:apply:latest
```

The runner reads `.env.local` first, then `.env`, and then uses the database
connection string from one of these environment variables:

- `SUPABASE_DATABASE_URL`
- `DATABASE_URL`

For this local project, keep the real database connection string in
`.env.local`. That file is ignored by git and lets future Codex sessions apply
migrations without asking for the password again.

Do not commit the real database password to the repository.

If neither variable is already available, set `SUPABASE_DATABASE_URL`
temporarily in the same PowerShell session.

Example:

```powershell
$env:SUPABASE_DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
npm.cmd run db:apply -- supabase/migrations/20260626130000_gymbro_initial_schema.sql
Remove-Item Env:\SUPABASE_DATABASE_URL
```

The command prints `Applied migration: ...` when the migration succeeds.
