import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const role = pgTable(
  "role",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    description: text("description"),
    id: text("id").primaryKey(),
    isSystem: boolean("is_system").default(false).notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("role_slug_idx").on(table.slug)],
);

export const permission = pgTable(
  "permission",
  {
    action: text("action").notNull(),
    description: text("description").notNull(),
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    resource: text("resource").notNull(),
  },
  (table) => [uniqueIndex("permission_key_idx").on(table.key)],
);

export const userRole = pgTable(
  "user_role",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
    index("user_role_user_idx").on(table.userId),
    index("user_role_role_idx").on(table.roleId),
  ],
);

export const rolePermission = pgTable(
  "role_permission",
  {
    permissionId: text("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index("role_permission_role_idx").on(table.roleId),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    action: text("action").notNull(),
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    ipAddress: text("ip_address"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    targetId: text("target_id"),
    targetType: text("target_type").notNull(),
    userAgent: text("user_agent"),
  },
  (table) => [index("audit_log_created_at_idx").on(table.createdAt)],
);

export const roleRelations = relations(role, ({ many }) => ({
  permissions: many(rolePermission),
  users: many(userRole),
}));

export const permissionRelations = relations(permission, ({ many }) => ({
  roles: many(rolePermission),
}));

export const userRoleRelations = relations(userRole, ({ one }) => ({
  role: one(role, { fields: [userRole.roleId], references: [role.id] }),
  user: one(user, { fields: [userRole.userId], references: [user.id] }),
}));

export const rolePermissionRelations = relations(rolePermission, ({ one }) => ({
  permission: one(permission, {
    fields: [rolePermission.permissionId],
    references: [permission.id],
  }),
  role: one(role, { fields: [rolePermission.roleId], references: [role.id] }),
}));
