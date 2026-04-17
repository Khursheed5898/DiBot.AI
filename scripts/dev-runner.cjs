const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

const viteExecutable = isWindows
  ? `"${path.join(rootDir, "node_modules", ".bin", "vite.cmd")}"`
  : path.join(rootDir, "node_modules", ".bin", "vite");

const nodemonExecutable = isWindows
  ? `"${path.join(rootDir, "server", "node_modules", ".bin", "nodemon.cmd")}"`
  : path.join(rootDir, "server", "node_modules", ".bin", "nodemon");

const processes = [
  spawn(`${nodemonExecutable} server.js`, {
    cwd: path.join(rootDir, "server"),
    stdio: "inherit",
    shell: true,
  }),
  spawn(`${viteExecutable} --host 127.0.0.1`, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  }),
];

function shutdown(signal) {
  processes.forEach((child) => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

processes.forEach((child) => {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown("SIGTERM");
      process.exitCode = code;
    }
  });
});
