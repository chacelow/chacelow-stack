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

    processTemplatesFromPrefix(vfs, templates, `addons/${addon}`, "", config);
  }
}
