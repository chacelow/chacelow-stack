import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const organization = pgTable(
  "organization",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    logo: text("logo"),
    metadata: text("metadata"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (table) => [uniqueIndex("organization_slug_idx").on(table.slug)],
);

export const member = pgTable(
  "member",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("member_organization_idx").on(table.organizationId),
    index("member_user_idx").on(table.userId),
    uniqueIndex("member_organization_user_idx").on(table.organizationId, table.userId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    email: text("email").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: text("role"),
    status: text("status").default("pending").notNull(),
  },
  (table) => [
    index("invitation_organization_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const organizationRole = pgTable(
  "organization_role",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    permission: text("permission").notNull(),
    role: text("role").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_role_organization_idx").on(table.organizationId),
    uniqueIndex("organization_role_slug_idx").on(table.organizationId, table.role),
  ],
);

export const organizationRelations = relations(organization, ({ many }) => ({
  invitations: many(invitation),
  members: many(member),
  roles: many(organizationRole),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, { fields: [member.userId], references: [user.id] }),
}));
