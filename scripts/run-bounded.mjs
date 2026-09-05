import { spawn } from "node:child_process";

const duration = (value) => {
  const match = /^(\d+)(ms|s|m)?$/.exec(value);
  if (!match) throw new Error(`Invalid build duration: ${value}`);
  return Number(match[1]) * ({ ms: 1, s: 1000, m: 60000 }[match[2] ?? "s"]);
};
const child = spawn(process.argv[2], process.argv.slice(3), { stdio: "inherit", detached: true });
const stop = (signal) => { try { process.kill(-child.pid, signal); } catch (error) { if (error.code !== "ESRCH") throw error; } };
let expired = false;
let killTimer;
const timer = setTimeout(() => {
  expired = true;
  stop("SIGTERM");
  killTimer = setTimeout(() => stop("SIGKILL"), duration(process.env.SITES_BUILD_KILL_AFTER ?? "10s"));
}, duration(process.env.SITES_BUILD_TIMEOUT ?? "3m"));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop(signal));
child.on("error", (error) => { clearTimeout(timer); console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { clearTimeout(timer); clearTimeout(killTimer); process.exitCode = expired ? 124 : code ?? 1; });
