import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export default createEnv({
  server: {
    CONVEX_DEPLOYMENT: z.string().optional(),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    CLERK_SECRET_KEY: z.string(),
    CLERK_JWT_ISSUER_DOMAIN: z.string().url(),
  },

  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string().url().optional(),

    // AUTH
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),

    // POSTHOG
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().startsWith("phc_"),
    NEXT_PUBLIC_POSTHOG_PROJECT_ID: z.string(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_JWT_ISSUER_DOMAIN: process.env.CLERK_JWT_ISSUER_DOMAIN,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_PROJECT_ID: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
