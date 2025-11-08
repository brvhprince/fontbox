#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const subprocess = spawn("pnpm", ["dlx", "shadcn-ui@latest", "init"], {
  cwd: workspaceRoot,
  stdio: "inherit"
});

subprocess.on("close", (code) => {
  process.exit(code ?? 0);
});
