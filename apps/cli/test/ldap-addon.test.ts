import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { expectSuccess, runTRPCTest } from "./test-utils";

describe("LDAP addon", () => {
  it("emits directory templates and wires plugin when ldap is selected", async () => {
    const result = await runTRPCTest({
      projectName: "ldap-admin-rbac",
      addons: ["admin", "rbac", "ldap", "i18n", "turborepo"],
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "postgres",
      orm: "drizzle",
      auth: "better-auth",
      payments: "none",
      api: "trpc",
      examples: ["none"],
      dbSetup: "docker",
      webDeploy: "none",
      serverDeploy: "none",
      install: false,
    });

    expectSuccess(result);

    const projectDir = result.projectDir!;
    const expectedFiles = [
      "packages/auth/src/ldap.ts",
      "packages/auth/src/ldap-settings.ts",
      "packages/auth/src/ldap-user.ts",
      "packages/db/src/schema/settings.ts",
      "apps/web/src/features/settings/directory/directory-form.tsx",
      "apps/web/src/features/settings/directory/index.tsx",
      "apps/web/src/routes/_authenticated/settings/directory.tsx",
    ];
    for (const rel of expectedFiles) {
      expect(existsSync(join(projectDir, rel))).toBe(true);
    }

    const authPkg = await readFile(
      join(projectDir, "packages/auth/package.json"),
      "utf-8",
    );
    expect(authPkg).toContain("better-auth-credentials-plugin");
    expect(authPkg).toContain("ldapts");

    const authIndex = await readFile(
      join(projectDir, "packages/auth/src/index.ts"),
      "utf-8",
    );
    expect(authIndex).toContain('from "./ldap"');
    expect(authIndex).toContain("ldapPlugin");

    const adminRouter = await readFile(
      join(projectDir, "packages/api/src/routers/admin.ts"),
      "utf-8",
    );
    expect(adminRouter).toContain("ldapSettings");
    expect(adminRouter).toContain("updateLdapSettings");

    const permissions = await readFile(
      join(projectDir, "packages/api/src/permissions.ts"),
      "utf-8",
    );
    expect(permissions).toContain("setting:read");
    expect(permissions).toContain("setting:update");

    const dbSchemaIndex = await readFile(
      join(projectDir, "packages/db/src/schema/index.ts"),
      "utf-8",
    );
    expect(dbSchemaIndex).toContain("./settings");

    const signInForm = await readFile(
      join(projectDir, "apps/web/src/features/auth/sign-in/components/user-auth-form.tsx"),
      "utf-8",
    );
    expect(signInForm).toContain("directory_account");
    expect(signInForm).toContain("Tabs");
  });

  it("omits directory templates when ldap addon is not selected", async () => {
    const result = await runTRPCTest({
      projectName: "no-ldap-admin-rbac",
      addons: ["admin", "rbac", "i18n", "turborepo"],
      frontend: ["tanstack-router"],
      backend: "hono",
      runtime: "bun",
      database: "postgres",
      orm: "drizzle",
      auth: "better-auth",
      payments: "none",
      api: "trpc",
      examples: ["none"],
      dbSetup: "docker",
      webDeploy: "none",
      serverDeploy: "none",
      install: false,
    });

    expectSuccess(result);

    const projectDir = result.projectDir!;
    const forbiddenFiles = [
      "packages/auth/src/ldap.ts",
      "packages/auth/src/ldap-settings.ts",
      "packages/auth/src/ldap-user.ts",
      "packages/db/src/schema/settings.ts",
      "apps/web/src/features/settings/directory/directory-form.tsx",
      "apps/web/src/features/settings/directory/index.tsx",
      "apps/web/src/routes/_authenticated/settings/directory.tsx",
    ];
    const leaked = forbiddenFiles.filter((rel) => existsSync(join(projectDir, rel)));
    expect(leaked).toEqual([]);

    const authPkg = await readFile(
      join(projectDir, "packages/auth/package.json"),
      "utf-8",
    );
    expect(authPkg).not.toContain("better-auth-credentials-plugin");
    expect(authPkg).not.toContain("ldapts");

    const permissions = await readFile(
      join(projectDir, "packages/api/src/permissions.ts"),
      "utf-8",
    );
    expect(permissions).not.toContain("setting:read");

    const signInForm = await readFile(
      join(projectDir, "apps/web/src/features/auth/sign-in/components/user-auth-form.tsx"),
      "utf-8",
    );
    expect(signInForm).not.toContain("directory_account");
  });
});
