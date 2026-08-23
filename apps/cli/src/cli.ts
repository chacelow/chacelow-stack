import { createBtsCli } from "./index";
import { startBtsMcpServer } from "./mcp";

const [, , command, ...args] = process.argv;

if (command === "mcp") {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: @chacelow-stack/create mcp

Start the Chacelow Stack MCP server over stdio.

This command is intended to be launched by an MCP client, for example:
  @chacelow-stack/create mcp`);
    process.exit(0);
  }

  await startBtsMcpServer();
} else {
  await createBtsCli().run();
}
