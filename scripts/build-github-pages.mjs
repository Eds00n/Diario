import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const backupRoot = path.join(root, ".pages-build-backup");

const toDisable = ["src/middleware.ts", "src/app/api", "src/app/admin"];

const loginActionsPath = path.join(root, "src/app/login/actions.ts");
const loginActionsBackup = path.join(backupRoot, "login-actions.ts");

const actionsStub = `"use client";

export async function submitSiteLogin() {
  throw new Error("Login no servidor indisponível neste build.");
}
`;

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyRecursive(from, to);
    else fs.copyFileSync(from, to);
  }
}

function disablePath(relative) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) return;
  const backup = path.join(backupRoot, relative);
  fs.rmSync(backup, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  const stat = fs.statSync(full);
  if (stat.isDirectory()) copyRecursive(full, backup);
  else fs.copyFileSync(full, backup);
  fs.rmSync(full, { recursive: true, force: true });
}

function stubLoginActions() {
  if (!fs.existsSync(loginActionsPath)) return;
  fs.mkdirSync(path.dirname(loginActionsBackup), { recursive: true });
  fs.copyFileSync(loginActionsPath, loginActionsBackup);
  fs.writeFileSync(loginActionsPath, actionsStub, "utf8");
}

function restoreAll() {
  if (fs.existsSync(loginActionsBackup)) {
    fs.copyFileSync(loginActionsBackup, loginActionsPath);
    fs.unlinkSync(loginActionsBackup);
  }

  if (!fs.existsSync(backupRoot)) return;
  for (const relative of toDisable) {
    const full = path.join(root, relative);
    const backup = path.join(backupRoot, relative);
    if (!fs.existsSync(backup)) continue;
    fs.rmSync(full, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(full), { recursive: true });
    const stat = fs.statSync(backup);
    if (stat.isDirectory()) copyRecursive(backup, full);
    else fs.copyFileSync(backup, full);
  }
  fs.rmSync(backupRoot, { recursive: true, force: true });
}

process.on("exit", restoreAll);
process.on("SIGINT", () => process.exit(1));
process.on("SIGTERM", () => process.exit(1));

for (const relative of toDisable) disablePath(relative);
stubLoginActions();

fs.rmSync(path.join(root, ".next"), { recursive: true, force: true });

const prep = spawnSync(process.execPath, ["scripts/prepare-static-assets.mjs"], {
  cwd: root,
  stdio: "inherit",
});
if (prep.status !== 0) process.exit(prep.status ?? 1);

const env = {
  ...process.env,
  STATIC_EXPORT: "1",
  NEXT_PUBLIC_STATIC_EXPORT: "1",
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || "/Diario",
};

const build = spawnSync("npm", ["run", "build"], {
  cwd: root,
  stdio: "inherit",
  env,
  shell: true,
});

restoreAll();

if (build.status !== 0) process.exit(build.status ?? 1);

const publish = spawnSync(process.execPath, ["scripts/publish-static-to-root.mjs"], {
  cwd: root,
  stdio: "inherit",
});
process.exit(publish.status ?? 0);
