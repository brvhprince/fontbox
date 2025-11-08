#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const components = process.argv.slice(2);

if (components.length === 0) {
  console.error("Please provide at least one component name to install via shadcn-ui.");
  process.exit(1);
}

const subprocess = spawn("pnpm", ["dlx", "shadcn-ui@latest", "add", ...components], {
  cwd: workspaceRoot,
  stdio: "inherit"
});

subprocess.on("close", (code) => {
  process.exit(code ?? 0);
});
