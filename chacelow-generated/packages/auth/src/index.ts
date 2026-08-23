import { createDb } from "@chacelow-generated/db";
import { account, session, user, verification } from "@chacelow-generated/db/schema/auth";
import { env } from "@chacelow-generated/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

export function createAuth() {
  const db = createDb();

  const isProduction = env.NODE_ENV === "production";

  return betterAuth({
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
      },
    },
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",

      schema: { account, session, user, verification },
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [admin()],
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.CORS_ORIGIN],
  });
}

export const auth = createAuth();
