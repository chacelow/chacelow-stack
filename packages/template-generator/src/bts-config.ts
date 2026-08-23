import type { BetterTStackConfig, ProjectConfig } from "@chacelow-stack/types";

import type { VirtualFileSystem } from "./core/virtual-fs";

const BTS_CONFIG_FILE = "bts.jsonc";

/**
 * Writes the BTS configuration file to the VFS (for new project creation).
 * This is browser-safe as it only writes to VFS, not the real filesystem.
 */
export function writeBtsConfigToVfs(
  vfs: VirtualFileSystem,
  projectConfig: ProjectConfig,
  version: string,
  reproducibleCommand?: string,
): void {
  const btsConfig: BetterTStackConfig = {
    version,
    createdAt: new Date().toISOString(),
    reproducibleCommand,
    addonOptions: projectConfig.addonOptions,
    dbSetupOptions: projectConfig.dbSetupOptions,
    database: projectConfig.database,
    orm: projectConfig.orm,
    backend: projectConfig.backend,
    runtime: projectConfig.runtime,
    frontend: projectConfig.frontend,
    addons: projectConfig.addons,
    examples: projectConfig.examples,
    auth: projectConfig.auth,
    payments: projectConfig.payments,
    packageManager: projectConfig.packageManager,
    dbSetup: projectConfig.dbSetup,
    api: projectConfig.api,
    webDeploy: projectConfig.webDeploy,
    serverDeploy: projectConfig.serverDeploy,
  };

  const baseContent = {
    $schema: "https://r2.chacelow-stack.dev/schema.json",
    ...btsConfig,
  };

  const jsonContent = JSON.stringify(baseContent, null, 2);

  const addCommand =
    projectConfig.packageManager === "npm"
      ? "npx create-chacelow-stack@latest add"
      : projectConfig.packageManager === "pnpm"
        ? "pnpm dlx create-chacelow-stack@latest add"
        : "bunx create-chacelow-stack@latest add";

  const finalContent = `// Chacelow-Stack project metadata
//
// Keep this file to use the \`add\` command.
// Add addons: ${addCommand}
//
// Docs: https://chacelow-stack.dev/docs
// Stack Builder: https://chacelow-stack.dev/new

${jsonContent}`;

  vfs.writeFile(BTS_CONFIG_FILE, finalContent);
}
