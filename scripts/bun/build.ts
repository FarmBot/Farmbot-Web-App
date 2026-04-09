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
const isProd =
  process.env.NODE_ENV === "production" ||
  process.env.RAILS_ENV === "production";
const nodeEnv = isProd ? "production" : "development";

const ensureDir = (path: string) => {
  mkdirSync(path, { recursive: true });
};

ensureDir(resolvedOutdir);
cssEntries.forEach(([, output]) => {
  ensureDir(dirname(output));
});

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
  "--define",
  `process.env.NODE_ENV="${nodeEnv}"`,
  "--entry-naming",
  "[dir]-[name].[ext]",
  "--chunk-naming",
  "[name]-[hash].js",
];

if (!isProd) {
  bunArgs.push("--sourcemap");
}

if (isProd) {
  bunArgs.push("--minify");
}

console.log(`bun ${bunArgs.join(" ")}`);

const bunProc = Bun.spawn(["bun", ...bunArgs], {
  cwd: frontendRoot,
  stdout: "inherit",
  stderr: "inherit",
});
const bunExit = await bunProc.exited;
if (bunExit !== 0) {
  process.exit(bunExit);
}

if (cssEntries.length === 0) {
  process.exit(0);
}

const sassArgs = ["sass", "--load-path=node_modules"];
if (isProd) {
  sassArgs.push("--no-source-map", "--style=compressed");
} else {
  sassArgs.push("--source-map");
}

cssEntries.forEach(([input, output]) => {
  sassArgs.push(`${input}:${output}`);
});

const sassProc = Bun.spawn(["bunx", ...sassArgs], {
  stdout: "inherit",
  stderr: "inherit",
});
const sassExit = await sassProc.exited;
process.exit(sassExit || 0);
