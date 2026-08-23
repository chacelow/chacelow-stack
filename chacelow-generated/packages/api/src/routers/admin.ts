import { db } from "@chacelow-generated/db";
import { user } from "@chacelow-generated/db/schema/auth";
import {
  auditLog,
  permission,
  role,
  rolePermission,
  userRole,
} from "@chacelow-generated/db/schema/rbac";
import { TRPCError } from "@trpc/server";
import { asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

import { permissionProcedure, protectedProcedure, router } from "../index";
import { ALL_PERMISSION_KEYS } from "../permissions";
import {
  assertPermissionKeys,
  countSuperAdmins,
  ensureRbacSeed,
  existingRoleIds,
  getUserAccess,
  isSuperAdmin,
  replaceRolePermissions,
  replaceUserRoles,
  SUPER_ADMIN_SLUG,
  writeAudit,
} from "../rbac";

const auditContext = (ctx: {
  session: { user: { id: string } };
  request: { ipAddress?: string; userAgent?: string };
}) => ({
  actorId: ctx.session.user.id,
  ipAddress: ctx.request.ipAddress,
  userAgent: ctx.request.userAgent,
});

export const adminRouter = router({
  access: protectedProcedure.query(async ({ ctx }) => {
    const access = await getUserAccess(ctx.session.user.id);
    const allowed =
      access.isSuperAdmin ||
      access.permissions.some(
        (key) => key.startsWith("user:") || key.startsWith("role:") || key.startsWith("audit:"),
      );
    return { ...access, allowed };
  }),

  auditLogs: permissionProcedure("audit:read").query(async () =>
    db
      .select({
        action: auditLog.action,
        actorEmail: user.email,
        actorName: user.name,
        createdAt: auditLog.createdAt,
        id: auditLog.id,
        ipAddress: auditLog.ipAddress,
        metadata: auditLog.metadata,
        targetId: auditLog.targetId,
        targetType: auditLog.targetType,
        userAgent: auditLog.userAgent,
      })
      .from(auditLog)
      .leftJoin(user, eq(auditLog.actorId, user.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(200),
  ),

  createRole: permissionProcedure("role:create")
    .input(
      z.object({
        description: z.string().trim().max(240),
        name: z.string().trim().min(2).max(60),
        permissionKeys: z.array(z.string()),
        slug: z
          .string()
          .trim()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .max(60),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const permissionKeys = assertPermissionKeys(input.permissionKeys);
      const id = crypto.randomUUID();
      try {
        await db.transaction(async (tx) => {
          await tx.insert(role).values({
            description: input.description,
            id,
            name: input.name,
            slug: input.slug,
          });
          if (permissionKeys.length > 0) {
            await tx.insert(rolePermission).values(
              permissionKeys.map((permissionId) => ({
                permissionId,
                roleId: id,
              })),
            );
          }
          await tx.insert(auditLog).values({
            ...auditContext(ctx),
            action: "role.created",
            id: crypto.randomUUID(),
            metadata: { name: input.name, permissionKeys },
            targetId: id,
            targetType: "role",
          });
        });
      } catch (error) {
        throw new TRPCError({
          cause: error,
          code: "CONFLICT",
          message: "Role slug already exists",
        });
      }
      return { id };
    }),

  deleteRole: permissionProcedure("role:delete")
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.select().from(role).where(eq(role.id, input.id)).limit(1);
      if (!existing[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
      }
      if (existing[0].isSystem) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "System roles cannot be deleted",
        });
      }
      await db.delete(role).where(eq(role.id, input.id));
      await writeAudit({
        ...auditContext(ctx),
        action: "role.deleted",
        metadata: { name: existing[0].name },
        targetId: input.id,
        targetType: "role",
      });
      return { success: true };
    }),

  permissions: permissionProcedure("role:read").query(async () => {
    await ensureRbacSeed();
    return db.select().from(permission).orderBy(asc(permission.resource), asc(permission.action));
  }),

  revokeUserSessions: permissionProcedure("user:revoke-session")
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await db.execute(sql`delete from "session" where "user_id" = ${input.userId}`);
      await writeAudit({
        ...auditContext(ctx),
        action: "user.sessions.revoked",
        targetId: input.userId,
        targetType: "user",
      });
      return { success: true };
    }),

  roles: permissionProcedure("role:read").query(async () => {
    await ensureRbacSeed();
    const roles = await db
      .select({
        createdAt: role.createdAt,
        description: role.description,
        id: role.id,
        isSystem: role.isSystem,
        name: role.name,
        slug: role.slug,
        userCount: count(userRole.userId),
      })
      .from(role)
      .leftJoin(userRole, eq(userRole.roleId, role.id))
      .groupBy(role.id)
      .orderBy(asc(role.name));
    const grants = await db.select().from(rolePermission);
    return roles.map((item) => ({
      ...item,
      permissionKeys: grants
        .filter(({ roleId }) => roleId === item.id)
        .map(({ permissionId }) => permissionId),
    }));
  }),

  setUserBanned: permissionProcedure("user:update")
    .input(z.object({ banned: z.boolean(), userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id && input.banned) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot ban yourself",
        });
      }
      await db
        .update(user)
        .set({
          banExpires: null,
          banned: input.banned,
          banReason: input.banned ? "Disabled by administrator" : null,
        })
        .where(eq(user.id, input.userId));
      await writeAudit({
        ...auditContext(ctx),
        action: input.banned ? "user.banned" : "user.unbanned",
        targetId: input.userId,
        targetType: "user",
      });
      return { success: true };
    }),

  setUserRoles: permissionProcedure("user:assign-role")
    .input(
      z.object({
        roleIds: z.array(z.string()).max(20),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const validRoleIds = await existingRoleIds(input.roleIds);
      if (validRoleIds.length !== input.roleIds.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown role" });
      }
      const targetIsSuperAdmin = await isSuperAdmin(input.userId);
      const keepsSuperAdmin = validRoleIds.includes(SUPER_ADMIN_SLUG);
      if (targetIsSuperAdmin && !keepsSuperAdmin && (await countSuperAdmins()) <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The final super administrator cannot be removed",
        });
      }
      await replaceUserRoles(input.userId, validRoleIds);
      await writeAudit({
        ...auditContext(ctx),
        action: "user.roles.updated",
        metadata: { roleIds: validRoleIds },
        targetId: input.userId,
        targetType: "user",
      });
      return { success: true };
    }),

  updateRole: permissionProcedure("role:update")
    .input(
      z.object({
        description: z.string().trim().max(240),
        id: z.string().min(1),
        name: z.string().trim().min(2).max(60),
        permissionKeys: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [current] = await db.select().from(role).where(eq(role.id, input.id)).limit(1);
      if (!current) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
      }
      const permissionKeys = current.isSystem
        ? [...ALL_PERMISSION_KEYS]
        : assertPermissionKeys(input.permissionKeys);
      await db
        .update(role)
        .set({ description: input.description, name: input.name })
        .where(eq(role.id, input.id));
      await replaceRolePermissions(input.id, permissionKeys);
      await writeAudit({
        ...auditContext(ctx),
        action: "role.updated",
        metadata: { name: input.name, permissionKeys },
        targetId: input.id,
        targetType: "role",
      });
      return { success: true };
    }),

  users: permissionProcedure("user:read")
    .input(z.object({ search: z.string().trim().max(100).default("") }))
    .query(async ({ input }) => {
      await ensureRbacSeed();
      const condition = input.search
        ? or(ilike(user.name, `%${input.search}%`), ilike(user.email, `%${input.search}%`))
        : undefined;
      const users = await db
        .select()
        .from(user)
        .where(condition)
        .orderBy(desc(user.createdAt))
        .limit(100);
      const assignments = await db
        .select({
          roleId: role.id,
          roleName: role.name,
          roleSlug: role.slug,
          userId: userRole.userId,
        })
        .from(userRole)
        .innerJoin(role, eq(userRole.roleId, role.id));
      return users.map((item) => ({
        ...item,
        roles: assignments.filter(({ userId }) => userId === item.id),
      }));
    }),
});
