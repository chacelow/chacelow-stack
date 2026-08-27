import type { ProjectConfig } from "@chacelow-stack/types";

import type { JsonObject } from "../core/json-types";
import type { VirtualFileSystem } from "../core/virtual-fs";
import { type TemplateData, processTemplatesFromPrefix } from "./utils";

export async function processAddonTemplates(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (!config.addons || config.addons.length === 0) return;
  if (config.addons.includes("admin")) {
    for (const obsoletePath of [
      "apps/web/src/routes/index.tsx",
      "apps/web/src/routes/login.tsx",
      "apps/web/src/routes/_auth/dashboard.tsx",
      "apps/web/src/routes/_auth/route.tsx",
      "apps/web/src/components/header.tsx",
      "apps/web/src/components/sign-in-form.tsx",
      "apps/web/src/components/sign-up-form.tsx",
      "apps/web/src/components/user-menu.tsx",
    ]) {
      vfs.deleteFile(obsoletePath);
    }
  }

  for (const addon of config.addons) {
    if (addon === "none") continue;

    // Task runners are handled programmatically by generators.
    if (addon === "turborepo" || addon === "nx" || addon === "vite-plus") continue;

    if (addon === "pwa") {
      if (config.frontend.includes("next")) {
        processTemplatesFromPrefix(vfs, templates, "addons/pwa/apps/web/next", "apps/web", config);
      } else if (
        config.frontend.some((f) => ["tanstack-router", "react-router", "solid"].includes(f))
      ) {
        processTemplatesFromPrefix(vfs, templates, "addons/pwa/apps/web/vite", "apps/web", config);
      }
      continue;
    }

    if (addon === "rbac" || addon === "i18n") continue;
    processTemplatesFromPrefix(vfs, templates, `addons/${addon}`, "", config);
  }
  for (const demoPath of [
    "apps/web/src/features/chats",
    "apps/web/src/features/tasks",
    "apps/web/src/features/apps",
    "apps/web/src/features/users/components",
    "apps/web/src/features/users/data",
    "apps/web/src/features/dashboard/components",
    "apps/web/src/routes/_authenticated/chats",
    "apps/web/src/routes/clerk",
    "apps/web/src/routes/(auth)/forgot-password.tsx",
    "apps/web/src/routes/(auth)/otp.tsx",
    "apps/web/src/routes/(auth)/sign-in-2.tsx",
    "apps/web/src/routes/_authenticated/settings/notifications.tsx",
    "apps/web/src/routes/_authenticated/settings/display.tsx",
    "apps/web/src/features/auth/forgot-password",
    "apps/web/src/features/auth/sign-in/sign-in-2.tsx",
    "apps/web/src/features/auth/otp",
    "apps/web/src/features/settings/notifications",
    "apps/web/src/features/settings/display",
    "apps/web/src/components/coming-soon.tsx",
    "apps/web/src/lib/show-submitted-data.tsx",
  ]) {
    vfs.deletePath(demoPath);
  }

  if (!config.addons.includes("rbac")) {
    for (const rbacPath of [
      "packages/db/src/schema/rbac.ts",
      "packages/api/src/permissions.ts",
      "packages/api/src/rbac.ts",
      "packages/api/src/routers/admin.ts",
      "apps/server/src/permissions.integration.test.ts",
      "apps/server/test/global-setup.ts",
      "apps/server/vitest.integration.config.ts",
      "apps/web/src/components/layout/app-sidebar.test.tsx",
      "apps/web/src/components/permission-guard.tsx",
      "apps/web/src/components/permission-guard.test.tsx",
      "apps/web/src/context/access-context.tsx",
      "apps/web/src/routes/_authenticated/-access-routes.test.tsx",
      "packages/api/CONTEXT.md",
      "apps/web/src/features/users",
      "apps/web/src/features/roles",
      "apps/web/src/features/audit",
      "apps/web/src/routes/_authenticated/users",
      "apps/web/src/routes/_authenticated/roles",
      "apps/web/src/routes/_authenticated/audit",
    ]) {
      vfs.deletePath(rbacPath);
    }
  }

  if (!config.addons.includes("organization")) {
    for (const organizationPath of [
      "apps/server/src/organization.integration.test.ts",
      "packages/db/src/schema/organization.ts",
      "packages/api/src/routers/organization.ts",
      "apps/web/src/features/organizations",
      "apps/web/src/routes/_authenticated/organizations",
      "apps/web/src/routes/_authenticated/accept-invitation",
    ]) {
      vfs.deletePath(organizationPath);
    }

    for (const localePath of [
      "packages/i18n/src/locales/en.json",
      "packages/i18n/src/locales/zh.json",
    ]) {
      const locale = vfs.readJson<JsonObject>(localePath);
      if (!locale) continue;
      delete locale.organization;
      const navigation = locale.navigation as JsonObject | undefined;
      if (navigation) delete navigation.organizations;
      vfs.writeJson(localePath, locale);
    }
  }

  vfs.deletePath("apps/web/src/routeTree.gen.ts");
}
