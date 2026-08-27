import { describe, expect, it } from "bun:test";

import { createVirtual } from "../src/index";
import { collectFiles } from "./setup";

const AGENT_DOC_PATHS = [
  "AGENTS.md",
  "CLAUDE.md",
  "CONTEXT-MAP.md",
  "docs/agents/domain.md",
  "docs/agents/issue-tracker.md",
  "docs/agents/triage-labels.md",
  "packages/api/CONTEXT.md",
] as const;

async function generateAdmin(addons: string[]) {
  const result = await createVirtual({
    api: "trpc",
    auth: "better-auth",
    backend: "hono",
    database: "postgres",
    dbSetup: "docker",
    examples: ["none"],
    frontend: ["tanstack-router"],
    git: false,
    install: false,
    orm: "drizzle",
    packageManager: "pnpm",
    payments: "none",
    projectName: "agent-ready-admin",
    runtime: "bun",
    serverDeploy: "none",
    webDeploy: "none",
    addons,
  });

  expect(result.isOk()).toBe(true);
  if (result.isErr()) throw result.error;
  return collectFiles(result.value.root, result.value.root.path);
}

function expectCompleteAgentDocs(files: Map<string, string>) {
  for (const path of AGENT_DOC_PATHS) {
    expect(files.has(path), `${path} should be generated`).toBe(true);
    expect(files.get(path)).not.toContain("{{");
  }

  expect(files.get("CLAUDE.md")).toBe("@AGENTS.md\n");
  expect(files.get("CONTEXT-MAP.md")).toContain("./packages/api/CONTEXT.md");
  expect(files.get("AGENTS.md")).toContain("`agent-ready-admin`");
  expect(files.get("AGENTS.md")).toContain("@agent-ready-admin/*");
  expect(files.get("AGENTS.md")).toContain("MCP 与 Agent Skills 是可选工具集成");
}

describe("admin agent documentation", () => {
  it("generates complete project and domain context for RBAC", async () => {
    const files = await generateAdmin(["admin", "rbac", "i18n", "turborepo"]);

    expectCompleteAgentDocs(files);
    expect(files.get("AGENTS.md")).not.toContain("组织 router");
  });

  it("adds organization invariants for SaaS", async () => {
    const files = await generateAdmin(["admin", "rbac", "organization", "i18n", "turborepo"]);

    expectCompleteAgentDocs(files);
    expect(files.get("AGENTS.md")).toContain("组织 router");
    expect(files.get("AGENTS.md")).toContain("最后一个 owner");
  });

  it("does not publish RBAC domain documentation for admin base", async () => {
    const files = await generateAdmin(["admin", "i18n", "turborepo"]);

    for (const path of AGENT_DOC_PATHS) {
      expect(files.has(path), `${path} should not be generated`).toBe(false);
    }
  });
});
