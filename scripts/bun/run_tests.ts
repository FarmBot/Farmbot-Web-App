#!/usr/bin/env bun

import fs from "fs";
import path from "path";
import {
  consumeValueFlag,
  createBatchOutputScanner,
  parsePositiveInt,
} from "./run_tests_support";

const args = process.argv.slice(2);
const fileWorkersArg = consumeValueFlag(args, "--file-workers");
const coverageDirArg = consumeValueFlag(args, "--coverage-dir");
const failingTestsFileArg = consumeValueFlag(args, "--failing-tests-file");
const batchSizeArg = consumeValueFlag(args, "--batch-size");
const batchLogDirArg = consumeValueFlag(args, "--batch-log-dir");
const defaultFileWorkers = "11";
const fileWorkers = parsePositiveInt(
  fileWorkersArg ?? process.env.BUN_TEST_FILE_WORKERS ?? defaultFileWorkers,
  "--file-workers",
);
const hasTimeout = args.some(arg =>
  arg === "--timeout" || arg.startsWith("--timeout="));
const normalizedArgs = [...args];
if (!hasTimeout) {
  normalizedArgs.push("--timeout=20000");
}
if (!args.some(arg =>
  arg === "--max-concurrency" || arg.startsWith("--max-concurrency="))) {
  normalizedArgs.push(`--max-concurrency=${fileWorkers}`);
}
const cwd = process.cwd();
if (batchSizeArg || process.env.BUN_TEST_BATCH_SIZE) {
  console.warn("Batching is disabled; --batch-size/BUN_TEST_BATCH_SIZE are ignored.");
}
if (batchLogDirArg || process.env.BUN_TEST_BATCH_LOG_DIR) {
  console.warn(
    "Batch log instrumentation is disabled; --batch-log-dir/BUN_TEST_BATCH_LOG_DIR are ignored.",
  );
}
const failingTestsPath = path.resolve(
  cwd,
  failingTestsFileArg
    ?? process.env.BUN_TEST_FAILING_TESTS_FILE
    ?? "failing_tests.txt",
);
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

const outputScanner = createBatchOutputScanner(0);
const writeOutput = (stream: "stdout" | "stderr", text: string) => {
  outputScanner.consume(stream, text);
  if (stream === "stdout") {
    process.stdout.write(text);
  } else {
    process.stderr.write(text);
  }
};
const streamOutput = async (
  stream: "stdout" | "stderr",
  readable: ReadableStream<Uint8Array> | null,
) => {
  if (!readable) {
    return;
  }
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (!value) {
      continue;
    }
    const text = decoder.decode(value, { stream: true });
    if (text) {
      writeOutput(stream, text);
    }
  }
  const tail = decoder.decode();
  if (tail) {
    writeOutput(stream, tail);
  }
};

const runTests = async (files: string[]) => {
  const cmd = [bunBinary, "test", ...normalizedArgs, ...files];
  const proc = Bun.spawn({
    cmd,
    cwd,
    stdin: "inherit",
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdoutTask = streamOutput("stdout", proc.stdout);
  const stderrTask = streamOutput("stderr", proc.stderr);
  const exitCode = await proc.exited;
  await stdoutTask;
  await stderrTask;
  outputScanner.flush();
  return exitCode;
};

console.log(`Running ${testFiles.length} files in one Bun process...`);
const exitCode = await runTests(testFiles);

const failingTestsOutput = outputScanner.summary.failedTests.length > 0
  ? `${outputScanner.summary.failedTests
    .map(failure => `${failure.file ?? "unknown"} | ${failure.test}`)
    .join("\n")}\n`
  : "";
fs.writeFileSync(failingTestsPath, failingTestsOutput);
const failingTestsDisplay = path.relative(cwd, failingTestsPath) || ".";
console.log(`Failing tests file: ${failingTestsDisplay}`);

process.exit(exitCode);
