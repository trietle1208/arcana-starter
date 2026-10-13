import { defineConfig } from 'drizzle-kit';

// `pnpm db:generate` writes numbered SQL files to drizzle/; they are committed and reviewed like
// code. Never use `drizzle-kit push` against the real journal (docs/TECH_DESIGN.md §5.4).
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/server/db/schema.ts',
  out: './drizzle',
});
