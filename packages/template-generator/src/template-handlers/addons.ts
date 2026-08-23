import type { ProjectConfig } from "@chacelow-stack/types";

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
    "apps/web/src/features/tasks/data/tasks.ts",
    "apps/web/src/features/users/data/users.ts",
    "apps/web/src/features/dashboard/components",
    "apps/web/src/routes/_authenticated/chats",
    "apps/web/src/routes/clerk",
  ]) {
    vfs.deletePath(demoPath);
  }

  if (!config.addons.includes("rbac")) {
    for (const rbacPath of [
      "packages/db/src/schema/rbac.ts",
      "packages/api/src/permissions.ts",
      "packages/api/src/rbac.ts",
      "packages/api/src/routers/admin.ts",
      "apps/web/src/features/users",
      "apps/web/src/features/tasks",
      "apps/web/src/features/apps",
      "apps/web/src/routes/_authenticated/users",
      "apps/web/src/routes/_authenticated/tasks",
      "apps/web/src/routes/_authenticated/apps",
    ]) {
      vfs.deletePath(rbacPath);
    }
  }

  if (!config.addons.includes("organization")) {
    for (const organizationPath of [
      "packages/db/src/schema/organization.ts",
      "packages/api/src/routers/organization.ts",
      "apps/web/src/features/organizations",
    ]) {
      vfs.deletePath(organizationPath);
    }
  }
}
