export const PERMISSIONS = [
  {
    action: "read",
    description: "View the dashboard",
    key: "dashboard:read",
    resource: "Dashboard",
  },
  {
    action: "read",
    description: "View users",
    key: "user:read",
    resource: "Users",
  },
  {
    action: "update",
    description: "Update users and account status",
    key: "user:update",
    resource: "Users",
  },
  {
    action: "assign-role",
    description: "Assign roles to users",
    key: "user:assign-role",
    resource: "Users",
  },
  {
    action: "revoke-session",
    description: "Revoke user sessions",
    key: "user:revoke-session",
    resource: "Users",
  },
  {
    action: "read",
    description: "View roles and permissions",
    key: "role:read",
    resource: "Roles",
  },
  {
    action: "create",
    description: "Create roles",
    key: "role:create",
    resource: "Roles",
  },
  {
    action: "update",
    description: "Update roles and permissions",
    key: "role:update",
    resource: "Roles",
  },
  {
    action: "delete",
    description: "Delete roles",
    key: "role:delete",
    resource: "Roles",
  },
  {
    action: "read",
    description: "View audit logs",
    key: "audit:read",
    resource: "Audit",
  },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const ALL_PERMISSION_KEYS = PERMISSIONS.map(({ key }) => key);
