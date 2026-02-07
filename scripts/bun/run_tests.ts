#!/usr/bin/env bun

import fs from "fs";
import path from "path";
import {
  consumeValueFlag,
} from "./run_tests_support";

const args = process.argv.slice(2);
const coverageDirArg = consumeValueFlag(args, "--coverage-dir");
const hasTimeout = args.some(arg =>
  arg === "--timeout" || arg.startsWith("--timeout="));
const normalizedArgs = [...args];
if (!hasTimeout) {
  normalizedArgs.push("--timeout=20000");
}
const cwd = process.cwd();
const extensions = ["ts", "tsx", "js", "jsx"] as const;
const globs = [
  "frontend/**/__tests__/**/*",
  "frontend/**/*_test",
  "frontend/**/*_spec",
  "frontend/**/*.test",
  "frontend/**/*.spec",
];

const files = new Set<string>();
const isFile = (file: string) => {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
};

for (const base of globs) {
  for (const ext of extensions) {
    const pattern = `${base}.${ext}`;
    const glob = new Bun.Glob(pattern);
    try {
      for await (const file of glob.scan({ cwd })) {
        const normalized = file.startsWith("/") ? file : `${cwd}/${file}`;
        if (isFile(normalized)) {
          files.add(file);
        }
      }
    } catch (error) {
      const err = error as { code?: string };
      if (err?.code !== "ENOENT") {
        throw error;
      }
    }
  }
}

const fileList = Array.from(files).sort();
if (fileList.length === 0) {
  console.error("No test files found under frontend/.");
  process.exit(1);
}

const testFiles = fileList.map(file =>
  file.startsWith("./") || file.startsWith("/") ? file : `./${file}`,
);

const bunBinary = process.execPath || "bun";
const hasCoverage = normalizedArgs.includes("--coverage");
const coverageRoot = hasCoverage ? path.resolve(cwd, coverageDirArg ?? "coverage_fe") : undefined;

if (hasCoverage && coverageRoot) {
  fs.rmSync(coverageRoot, { recursive: true, force: true });
  fs.mkdirSync(coverageRoot, { recursive: true });
  normalizedArgs.push(`--coverage-dir=${coverageRoot}`);
}

const runTests = async (files: string[]) => {
  const cmd = [bunBinary, "test", ...normalizedArgs, ...files];
  const proc = Bun.spawn({
    cmd,
    cwd,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  return await proc.exited;
};

console.log(`Running ${testFiles.length} files in one Bun process...`);
const exitCode = await runTests(testFiles);

process.exit(exitCode);
