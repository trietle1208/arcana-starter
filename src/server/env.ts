import 'server-only';
import { z } from 'zod';

// Nothing is required for the core app; every variable has a default.
const EnvSchema = z.object({
  ARCANA_DB_PATH: z.string().min(1).default('./data/arcana.db'),
});

export type Env = z.infer<typeof EnvSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
    throw new Error(`Invalid environment: ${problems.join('; ')}`);
  }
  return result.data;
}

export const env: Env = parseEnv(process.env);
