import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  GEMINI_API_KEY: z.string().min(30), // Agregar validación para Gemini
  SESSION_SECRET: z.string().min(32),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );

    throw new Error("Invalid environment variables");
  }

  // Log que las variables importantes están configuradas
  console.log("🔧 Environment validation passed");
  console.log(
    `🔑 GEMINI_API_KEY configured: ${
      process.env.GEMINI_API_KEY ? "YES" : "NO"
    }`,
  );
  if (process.env.GEMINI_API_KEY) {
    console.log(
      `🔑 GEMINI_API_KEY preview: ${process.env.GEMINI_API_KEY.substring(
        0,
        8,
      )}...${process.env.GEMINI_API_KEY.slice(-4)}`,
    );
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}