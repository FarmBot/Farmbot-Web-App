import { mkdirSync } from "fs";
import { dirname, join, parse, relative, resolve } from "path";

declare const Bun: any;

type EntryPair = [string, string];

type JsonFallback<T> = {
  key: string;
  fallback: T;
};

const readJson = <T>({ key, fallback }: JsonFallback<T>): T => {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const projectRoot = process.cwd();
const frontendRoot = resolve(projectRoot, "frontend");

const normalizeEntry = (entry: string) =>
  relative(frontendRoot, resolve(entry));

const outputKey = (entry: string) => {
  const rel = normalizeEntry(entry);
  const parsed = parse(rel);
  if (parsed.dir.length === 0 || parsed.dir === ".") {
    return `${parsed.name}.js`;
  }
  return `${parsed.dir}-${parsed.name}.js`;
};

const uniqEntries = (entries: string[]) => {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = outputKey(entry);
    if (seen.has(key)) {
      console.warn(
        `Duplicate asset entry output: ${key} (from ${entry})`,
      );
      return false;
    }
    seen.add(key);
    return true;
  });
};

const rawEntries = readJson<string[]>({
  key: "ASSET_JS_ENTRIES",
  fallback: [],
});
const jsEntries = uniqEntries(rawEntries);
const cssEntries = readJson<EntryPair[]>({
  key: "ASSET_CSS_ENTRIES",
  fallback: [],
});
const outdir = process.env.ASSET_OUTDIR || "public/assets/dist";
const resolvedOutdir = resolve(projectRoot, outdir);
const publicPath = process.env.ASSET_PUBLIC_PATH || "/assets/dist/";

const ensureDir = (path: string) => {
  mkdirSync(path, { recursive: true });
};

const entryDir = (entry: string) => {
  const dir = dirname(outputKey(entry));
  return dir === "." ? resolvedOutdir : join(resolvedOutdir, dir);
};

ensureDir(resolvedOutdir);
jsEntries.forEach((entry) => ensureDir(entryDir(entry)));
cssEntries.forEach(([, output]) => ensureDir(dirname(output)));

const bunArgs = [
  "build",
  ...jsEntries.map(normalizeEntry),
  "--outdir",
  resolvedOutdir,
  "--target",
  "browser",
  "--format",
  "esm",
  "--splitting",
  "--public-path",
  publicPath,
  "--entry-naming",
  "[dir]-[name].[ext]",
  "--chunk-naming",
  "[name]-[hash].js",
  "--sourcemap",
  "--watch",
];

const bunProc = Bun.spawn(["bun", ...bunArgs], {
  cwd: frontendRoot,
  stdout: "inherit",
  stderr: "inherit",
});

let sassExit: Promise<number> | undefined;
if (cssEntries.length > 0) {
  const sassArgs = [
    "sass",
    "--watch",
    "--source-map",
    "--load-path=node_modules",
  ];
  cssEntries.forEach(([input, output]) => {
    sassArgs.push(`${input}:${output}`);
  });
  const sassProc = Bun.spawn(["bunx", ...sassArgs], {
    stdout: "inherit",
    stderr: "inherit",
  });
  sassExit = sassProc.exited;
}

const bunExit = bunProc.exited;
const exitCode = sassExit ?
  await Promise.race([bunExit, sassExit]) :
  await bunExit;
process.exit(exitCode || 0);
