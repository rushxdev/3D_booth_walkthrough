import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libs = path.join(root, "node_modules", "three", "examples", "jsm", "libs");

const jobs = [
  { from: path.join(libs, "draco", "gltf"), to: path.join(root, "public", "draco") },
  { from: path.join(libs, "basis"), to: path.join(root, "public", "basis") },
];

for (const { from, to } of jobs) {
  if (!existsSync(from)) {
    console.warn(`[copy-decoders] not found: ${from} (is three installed?)`);
    continue; // never fail an install over this
  }
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}