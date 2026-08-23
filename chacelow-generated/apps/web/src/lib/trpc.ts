import type { AppRouter } from "@chacelow-generated/api/routers/index";
import { env } from "@chacelow-generated/env/web";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

const serverUrl = env.VITE_SERVER_URL.endsWith("/")
  ? env.VITE_SERVER_URL.slice(0, -1)
  : env.VITE_SERVER_URL;

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
      url: `${serverUrl}/trpc`,
    }),
  ],
});

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
