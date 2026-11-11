#!/usr/bin/env node
/**
 * Oütlas token-drift check.
 *
 * Three things the compiler can't tell you:
 *   1. Off-brand colours — any hex in app/ or tailwind.config.ts that isn't one of
 *      the six brand hexes. Legacy files (see LEGACY_ALLOW) report as LEGACY, not errors.
 *   2. Theme parity — every semantic variable declared in :root must also be declared
 *      in :root[data-theme="dark"] AND in the prefers-color-scheme dark block, or
 *      System mode on a dark OS silently falls back to the light value.
 *   3. Undefined variables — every var(--x) referenced in app/ (and tailwind.config.ts)
 *      resolves to something declared in globals.css or injected by next/font (--font-*).
 *
 * Usage: node .claude/skills/review-qa/scripts/check-tokens.mjs [--strict]
 *   --strict  treat LEGACY findings as errors (for a burn-down day)
 *
 * Exit 0 clean (or LEGACY only), 1 on any error.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "../../../..");
const STRICT = process.argv.includes("--strict");

// ---- Contract -------------------------------------------------------------

const BRAND_HEX = new Set(["FFEF9E", "1E1E1E", "FFFFFF", "C55045", "22604A", "94D1D9"]);

// Files that pre-date the design system and carry known off-brand values.
// Burn these down, then delete the entry. New files never go here.
const LEGACY_ALLOW = [
  "app/ui/sidebar.css",
  "app/ui/mapbox/map.tsx",
];

// Variables that are allowed in :root without a dark counterpart.
const THEME_EXEMPT = /^--(brand-|font-|background$|foreground$)/;

// Variables defined outside globals.css that components may legitimately reference.
const EXTERNAL_VARS = new Set(["--font-vollkorn", "--font-archivo", "--font-geist-mono"]);

const SCAN_DIRS = ["app"];
const SCAN_EXT = [".ts", ".tsx", ".css"];
const IGNORE_DIRS = new Set(["node_modules", ".next", "fonts"]);

// ---- Helpers --------------------------------------------------------------

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (SCAN_EXT.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

function rel(p) {
  return relative(ROOT, p);
}

/** Return the text inside the first `{ … }` that follows `selectorRe`. */
function blockAfter(css, selectorRe) {
  const m = selectorRe.exec(css);
  if (!m) return null;
  let i = css.indexOf("{", m.index + m[0].length);
  if (i < 0) return null;
  let depth = 0;
  const start = i + 1;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(start, i);
    }
  }
  return null;
}

function declaredVars(block) {
  const out = new Set();
  if (!block) return out;
  for (const m of block.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) out.add(m[1]);
  return out;
}

/** Blank out comments but keep newlines so line numbers stay true. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (s) => s.replace(/[^\n]/g, " "));
}

function lineOf(src, index) {
  return src.slice(0, index).split("\n").length;
}

// ---- Collect --------------------------------------------------------------

const errors = [];
const legacy = [];
const warnings = [];

const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));
files.push(join(ROOT, "tailwind.config.ts"));

const globalsPath = join(ROOT, "app/globals.css");
const globals = stripComments(readFileSync(globalsPath, "utf8"));

// 1. Off-brand hexes ---------------------------------------------------------

for (const f of files) {
  const src = stripComments(readFileSync(f, "utf8"));
  const r = rel(f);
  const isLegacy = LEGACY_ALLOW.includes(r);
  const bucket = isLegacy && !STRICT ? legacy : errors;

  for (const m of src.matchAll(/#([0-9a-fA-F]{6})\b(?![0-9a-fA-F])/g)) {
    const hex = m[1].toUpperCase();
    if (BRAND_HEX.has(hex)) continue;
    bucket.push(`${r}:${lineOf(src, m.index)}  off-brand hex #${m[1]}`);
  }
  for (const m of src.matchAll(/#([0-9a-fA-F]{3})\b(?![0-9a-fA-F])/g)) {
    // 3-digit shorthand — expand and compare; skip JSX anchors like href="#nav"
    const before = src[m.index - 1];
    if (before === '"' || before === "'" || before === "`") continue;
    const hex = m[1].toUpperCase().split("").map((c) => c + c).join("");
    if (BRAND_HEX.has(hex)) continue;
    bucket.push(`${r}:${lineOf(src, m.index)}  off-brand hex #${m[1]}`);
  }
}

// 2. Theme parity ------------------------------------------------------------

const rootBlock = blockAfter(globals, /(^|\n)\s*:root\s*(?=\{)/);
const darkBlock = blockAfter(globals, /:root\[data-theme="dark"\]\s*(?=\{)/);
const mediaBlock = blockAfter(globals, /@media\s*\(prefers-color-scheme:\s*dark\)\s*(?=\{)/);
const systemDarkBlock = mediaBlock ? blockAfter(mediaBlock, /:root:not\(\[data-theme="light"\]\)\s*(?=\{)/) : null;

if (!rootBlock) errors.push("app/globals.css  no :root block found");
if (!darkBlock) errors.push('app/globals.css  no :root[data-theme="dark"] block found');
if (!systemDarkBlock) errors.push('app/globals.css  no @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) } block found');

const rootVars = declaredVars(rootBlock);
const darkVars = declaredVars(darkBlock);
const sysVars = declaredVars(systemDarkBlock);

for (const v of rootVars) {
  if (THEME_EXEMPT.test(v)) continue;
  const missing = [];
  if (!darkVars.has(v)) missing.push(':root[data-theme="dark"]');
  if (!sysVars.has(v)) missing.push("prefers-color-scheme dark block");
  if (missing.length) errors.push(`app/globals.css  ${v} declared in :root but missing from ${missing.join(" and ")}`);
}
for (const v of darkVars) {
  if (!rootVars.has(v)) warnings.push(`app/globals.css  ${v} declared in dark block but not in :root (light has no value)`);
}
for (const v of sysVars) {
  if (!darkVars.has(v)) warnings.push(`app/globals.css  ${v} in system-dark block but not in [data-theme="dark"] — explicit Dark and System-dark will differ`);
}

// 3. Undefined var(--x) references --------------------------------------------

const allDeclared = new Set([...declaredVars(globals), ...EXTERNAL_VARS]);
for (const f of files) {
  const src = stripComments(readFileSync(f, "utf8"));
  const r = rel(f);
  for (const m of src.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
    const v = m[1];
    if (allDeclared.has(v)) continue;
    errors.push(`${r}:${lineOf(src, m.index)}  var(${v}) is not declared in app/globals.css`);
  }
}

// 4. Tailwind opacity on semantic colours ---------------------------------------
// `bg-ink/40`, `bg-canvas/90`, `border-rule/60` … compile to NOTHING here:
// Tailwind injects alpha as `rgb(var(--x) / α)`, which needs an RGB triplet,
// and the semantic variables are hex. Brand names (`bg-pine/20`) are fine —
// `--brand-*` are triplets. Reported as warnings until the existing uses are
// burned down (track in an XS brief); then promote to errors.
const OPACITY_TRAP = /\b(bg|text|border|ring|divide|from|via|to|outline|shadow|fill|stroke)-(ink|canvas|rule|accent)(-[a-z]+)*\/(\[?[0-9.]+\]?)\b/g;
for (const f of files) {
  if (!f.endsWith(".tsx") && !f.endsWith(".ts")) continue;
  const src = stripComments(readFileSync(f, "utf8"));
  const r = rel(f);
  for (const m of src.matchAll(OPACITY_TRAP)) {
    warnings.push(`${r}:${lineOf(src, m.index)}  ${m[0]} compiles to no CSS (hex variable) — bake alpha into a token and bind with bg-[var(--token)]`);
  }
}

// ---- Report ---------------------------------------------------------------

const log = (label, items, colour) => {
  if (!items.length) return;
  console.log(`${colour}${label} (${items.length})\x1b[0m`);
  for (const i of items) console.log(`  ${i}`);
  console.log();
};

log("ERRORS", errors, "\x1b[31m");
log("LEGACY (allow-listed — burn down, then remove from LEGACY_ALLOW)", legacy, "\x1b[33m");
log("WARNINGS", warnings, "\x1b[33m");

const semanticCount = [...rootVars].filter((v) => !THEME_EXEMPT.test(v)).length;
console.log(
  `Scanned ${files.length} files · brand hexes ${[...BRAND_HEX].join(" ")} · ` +
    `${rootVars.size} :root vars (${semanticCount} semantic, parity-checked)`
);

if (errors.length) {
  console.log("\x1b[31mToken drift: FAIL\x1b[0m");
  process.exit(1);
}
console.log(legacy.length ? "\x1b[33mToken drift: PASS with LEGACY findings\x1b[0m" : "\x1b[32mToken drift: PASS\x1b[0m");
