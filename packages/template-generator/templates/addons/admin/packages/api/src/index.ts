import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";
import type { PermissionKey } from "./permissions";
import { hasPermission } from "./rbac";

const t = initTRPC.context<Context>().create();

export const { procedure: publicProcedure, router } = t;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      cause: "No session",
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const permissionProcedure = (permission: PermissionKey) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const allowed = await hasPermission(ctx.session.user.id, permission);
    if (!allowed) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Permission denied" });
    }
    return next({ ctx });
  });
