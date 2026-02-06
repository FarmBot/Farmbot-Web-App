import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "bun:test";
import {
  chunk,
  combineLcovFiles,
  createBatchOutputScanner,
  consumeValueFlag,
  parsePositiveInt,
  stripAnsi,
} from "./run_tests_support";

const tempDirs: string[] = [];

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("consumeValueFlag()", () => {
  it("consumes separate flag value", () => {
    const args = ["--coverage", "--batch-size", "20", "--timeout=1000"];
    const value = consumeValueFlag(args, "--batch-size");
    expect(value).toBe("20");
    expect(args).toEqual(["--coverage", "--timeout=1000"]);
  });

  it("consumes inline flag value", () => {
    const args = ["--coverage", "--batch-size=7"];
    const value = consumeValueFlag(args, "--batch-size");
    expect(value).toBe("7");
    expect(args).toEqual(["--coverage"]);
  });
});

describe("parsePositiveInt()", () => {
  it("parses a valid positive integer", () => {
    expect(parsePositiveInt("3", "--batch-size")).toBe(3);
  });

  it("throws for invalid values", () => {
    expect(() => parsePositiveInt("0", "--batch-size")).toThrow();
    expect(() => parsePositiveInt("abc", "--batch-size")).toThrow();
  });
});

describe("chunk()", () => {
  it("chunks an array by size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("combineLcovFiles()", () => {
  it("concatenates LCOV files in input order without filtering", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "run-tests-support-"));
    tempDirs.push(tempDir);
    const inputA = path.join(tempDir, "a.info");
    const inputB = path.join(tempDir, "b.info");
    const output = path.join(tempDir, "merged.info");

    fs.writeFileSync(inputA, [
      "TN:",
      "SF:frontend/a.ts",
      "DA:1,1",
      "LF:1",
      "LH:1",
      "end_of_record",
      "",
    ].join("\n"));

    fs.writeFileSync(inputB, [
      "TN:",
      "SF:frontend/__tests__/a_test.ts",
      "DA:2,1",
      "LF:1",
      "LH:1",
      "end_of_record",
      "",
    ].join("\n"));

    expect(combineLcovFiles([inputA, inputB], output)).toBe(2);
    const merged = fs.readFileSync(output, "utf8");
    const firstIndex = merged.indexOf("SF:frontend/a.ts");
    const secondIndex = merged.indexOf("SF:frontend/__tests__/a_test.ts");
    expect(firstIndex).toBeGreaterThanOrEqual(0);
    expect(secondIndex).toBeGreaterThan(firstIndex);
  });

  it("writes output when only a subset of input files exist", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "run-tests-support-"));
    tempDirs.push(tempDir);
    const input = path.join(tempDir, "present.info");
    const missing = path.join(tempDir, "missing.info");
    const output = path.join(tempDir, "merged.info");

    fs.writeFileSync(input, [
      "TN:",
      "SF:frontend/api/maybe_start_tracking.ts",
      "DA:1,1",
      "LF:1",
      "LH:1",
      "end_of_record",
      "",
    ].join("\n"));

    expect(combineLcovFiles([missing, input], output)).toBe(1);
    const merged = fs.readFileSync(output, "utf8");
    expect(merged).toContain("SF:frontend/api/maybe_start_tracking.ts");
  });
});

describe("stripAnsi()", () => {
  it("removes ANSI escape sequences", () => {
    const line = "\u001b[32mfrontend/__tests__/app_test.tsx:\u001b[0m";
    expect(stripAnsi(line)).toEqual("frontend/__tests__/app_test.tsx:");
  });
});

describe("createBatchOutputScanner()", () => {
  it("tracks the latest test file and suspicious output patterns", () => {
    const scanner = createBatchOutputScanner();
    scanner.consume("stdout", "\u001b[32mfrontend/sequences/__tests__/index_test.tsx:\u001b[0m\n");
    scanner.consume("stderr", "stateNode: [Object ...]\n");
    scanner.consume("stderr", "alternate: [Circular]\n");
    scanner.flush();

    expect(scanner.summary.lastTestFile)
      .toEqual("frontend/sequences/__tests__/index_test.tsx");
    expect(scanner.summary.suspiciousEvents.length).toEqual(2);
    expect(scanner.summary.suspiciousEvents[0]?.rule).toEqual("object-ellipsis");
    expect(scanner.summary.suspiciousEvents[1]?.rule).toEqual("circular-ref");
    expect(scanner.summary.suspiciousEvents[0]?.testFile)
      .toEqual("frontend/sequences/__tests__/index_test.tsx");
  });

  it("flags very long lines as suspicious", () => {
    const scanner = createBatchOutputScanner();
    scanner.consume("stdout", `${"x".repeat(2100)}\n`);
    scanner.flush();
    expect(scanner.summary.suspiciousEvents[0]?.rule).toEqual("very-long-line");
  });

  it("flags matcher and axios errors early", () => {
    const scanner = createBatchOutputScanner();
    scanner.consume("stdout", "frontend/saved_gardens/__tests__/actions_test.ts:\n");
    scanner.consume("stderr", "(fail) actions > throws on bad payload\n");
    scanner.consume("stderr",
      "Matcher error: received value must be a mock function\n");
    scanner.consume("stderr", "Received: [Function: wrap]\n");
    scanner.consume("stderr", "AxiosError: Request aborted\n");
    scanner.flush();

    expect(scanner.summary.suspiciousEvents[0]?.rule).toEqual("non-mock-matcher");
    expect(scanner.summary.suspiciousEvents[1]?.rule).toEqual("wrapped-function");
    expect(scanner.summary.suspiciousEvents[2]?.rule).toEqual("axios-error");
    expect(scanner.summary.suspiciousEvents[0]?.testFile)
      .toEqual("frontend/saved_gardens/__tests__/actions_test.ts");
    expect(scanner.summary.failedTests[0]?.file)
      .toEqual("frontend/saved_gardens/__tests__/actions_test.ts");
    expect(scanner.summary.failedTests[0]?.test)
      .toEqual("actions > throws on bad payload");
  });
});
