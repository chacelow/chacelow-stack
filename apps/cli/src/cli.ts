import { createBtsCli } from "./index";
import { startBtsMcpServer } from "./mcp";

const [, , command, ...args] = process.argv;

if (command === "mcp") {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: create-chacelow-stack mcp

Start the Chacelow Stack MCP server over stdio.

This command is intended to be launched by an MCP client, for example:
  create-chacelow-stack mcp`);
    process.exit(0);
  }

  await startBtsMcpServer();
} else {
  await createBtsCli().run();
}
