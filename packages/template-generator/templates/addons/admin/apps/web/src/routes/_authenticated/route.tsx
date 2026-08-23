import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data } = await authClient.getSession();
    if (!data?.session) {
      throw redirect({
        search: { redirect: location.href },
        to: "/sign-in",
      });
    }
  },
  component: AuthenticatedLayout,
});
