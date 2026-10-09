// Usage: node scripts/audit-style.mjs   (exit code 1 when anything is found)
// Add "audit-ignore" in a comment on a line to allow it on purpose.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = fileURLToPath(new URL("../app", import.meta.url));
const EXTENSIONS = new Set([".ts", ".tsx", ".css"]);
const SKIP_DIRS = new Set(["node_modules", "dev"]); // src/app/dev is the throwaway gallery (deleted in 13.3)
const SKIP_FILE = /\.(test|testutil)\.[tj]sx?$/;

const PALETTE = "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";

export const RULES = [
  ["gradient", /\b(?:linear|radial|conic)-gradient\b|(?<![\w-])bg-(?:gradient-|linear-|radial-|conic-)/],
  ["shadow or ring", /box-shadow|(?<![\w-])(?:drop-|inset-|text-)?shadow(?:-[\w./[\]#%]+)?(?![\w-])|(?<![\w-])ring(?:-[\w./[\]#%]+)?(?![\w-])/],
  ["blur or glow", /(?<![\w-])backdrop-blur|backdrop-filter|filter:\s*blur|(?<![\w.-])blur-[\w[\]]+|(?<![\w-])glow(?![\w-])/i],
  ["emoji", /\p{Extended_Pictographic}/u],
  ["oversized radius", /(?<![\w-])rounded-(?:3xl|4xl)(?![\w-])/],
  ["off-palette color", new RegExp(`(?<![\\w-])(?:bg|text|border|fill|stroke|outline|from|to|via)-(?:${PALETTE})-\\d{2,3}(?![\\w-])`)],
];

const isComment = (line) => /^\s*(?:\/\/|\/\*|\*)/.test(line);
const isThemeReset = (line) => /^\s*--(?:shadow|inset-shadow|drop-shadow|blur)-\*:\s*initial/.test(line);

export function auditText(text, file = "") {
  const found = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (isComment(line) || isThemeReset(line) || line.includes("audit-ignore")) return;
    for (const [rule, re] of RULES) {
      const m = re.exec(line);
      if (m) found.push({ file, line: i + 1, rule, match: m[0] });
    }
  });
  return found;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* walk(path);
    } else if (EXTENSIONS.has(extname(name)) && !SKIP_FILE.test(name)) {
      yield path;
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const problems = [...walk(SRC)].flatMap((f) => auditText(readFileSync(f, "utf8"), relative(process.cwd(), f)));
  for (const p of problems) console.log(`${p.file}:${p.line}  [${p.rule}]  ${p.match}`);
  console.log(problems.length ? `\n${problems.length} problem(s) found.` : "Style audit clean.");
  process.exit(problems.length ? 1 : 0);
}