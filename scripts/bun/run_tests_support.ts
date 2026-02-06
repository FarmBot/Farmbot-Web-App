import fs from "fs";
import path from "path";

export const combineLcovFiles = (
  inputPaths: string[],
  outputPath: string,
): number => {
  const mergedParts: string[] = [];
  let existingCount = 0;
  for (const inputPath of inputPaths) {
    try {
      if (!fs.statSync(inputPath).isFile()) {
        continue;
      }
    } catch {
      continue;
    }
    existingCount += 1;
    const report = fs.readFileSync(inputPath, "utf8").trimEnd();
    if (report.length > 0) {
      mergedParts.push(report);
    }
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const mergedOutput = mergedParts.length > 0
    ? `${mergedParts.join("\n")}\n`
    : "";
  fs.writeFileSync(outputPath, mergedOutput);
  return existingCount;
};

export type OutputStream = "stdout" | "stderr";

export interface SuspiciousOutputEvent {
  stream: OutputStream;
  lineNumber: number;
  rule: string;
  testFile?: string;
  line: string;
}

export interface BatchOutputSummary {
  totalBytes: number;
  totalLines: number;
  lastTestFile?: string;
  suspiciousEvents: SuspiciousOutputEvent[];
  failedTests: Array<{ file?: string; test: string }>;
}

export const stripAnsi = (text: string) =>
  text.replace(/\x1B\[[0-9;?]*[ -/]*[@-~]/g, "");

const SUSPICIOUS_OUTPUT_RULES: Array<{ rule: string; regex: RegExp }> = [
  {
    rule: "non-mock-matcher",
    regex: /Matcher error: received value must be a mock function/,
  },
  { rule: "wrapped-function", regex: /Received:\s*\[Function:\s*wrap\]/ },
  { rule: "axios-error", regex: /^AxiosError:/ },
  { rule: "fiber-node", regex: /\bFiberNode\s*\{/ },
  { rule: "circular-ref", regex: /\[Circular\]/ },
  { rule: "object-ellipsis", regex: /\[Object \.\.\.\]/ },
  { rule: "react-fiber-alternate", regex: /\balternate:\s*FiberNode\b/ },
];

const TEST_FILE_HEADER = /^frontend\/.+:\s*$/;
const TEST_RESULT_LINE = /^\((pass|fail)\)\s+(.+)$/;
const FAIL_SUMMARY_LINE = /^\d+\s+tests?\s+failed:/;
const STACK_FILE_LINE = /\/(frontend\/[^:\s]+):\d+:\d+/;

export const createBatchOutputScanner = (maxEvents = 25) => {
  const buffers: Record<OutputStream, string> = { stdout: "", stderr: "" };
  const testToFile = new Map<string, string>();
  let inFailSummary = false;
  const summary: BatchOutputSummary = {
    totalBytes: 0,
    totalLines: 0,
    suspiciousEvents: [],
    failedTests: [],
  };

  const maybeAddSuspiciousEvent = (stream: OutputStream, line: string) => {
    if (summary.suspiciousEvents.length >= maxEvents) {
      return;
    }
    const plainLine = stripAnsi(line).trim();
    const lineForChecks = plainLine;
    const lineForEvent = lineForChecks.slice(0, 500);
    const suspiciousRule =
      SUSPICIOUS_OUTPUT_RULES.find(({ regex }) => regex.test(lineForChecks))?.rule
      ?? (lineForChecks.length >= 2000 ? "very-long-line" : undefined);
    if (!suspiciousRule) {
      return;
    }
    summary.suspiciousEvents.push({
      stream,
      lineNumber: summary.totalLines,
      rule: suspiciousRule,
      testFile: summary.lastTestFile,
      line: lineForEvent,
    });
  };

  const processLine = (stream: OutputStream, line: string) => {
    summary.totalLines += 1;
    const plainLine = stripAnsi(line).trim();
    if (FAIL_SUMMARY_LINE.test(plainLine)) {
      // Bun prints failed test names without file headers after this line.
      // Clear stale file context and rely on known test->file mappings.
      inFailSummary = true;
      summary.lastTestFile = undefined;
      return;
    }
    if (inFailSummary && plainLine.length === 0) {
      return;
    }
    if (inFailSummary && !plainLine.startsWith("(fail)")) {
      inFailSummary = false;
    }
    if (TEST_FILE_HEADER.test(plainLine)) {
      inFailSummary = false;
      summary.lastTestFile = plainLine.replace(/:\s*$/, "");
    }
    const stackFileMatch = plainLine.match(STACK_FILE_LINE);
    if (stackFileMatch?.[1]) {
      summary.lastTestFile = stackFileMatch[1];
    }
    const testResultMatch = plainLine.match(TEST_RESULT_LINE);
    if (testResultMatch) {
      const result = testResultMatch[1];
      const testName = testResultMatch[2] ?? plainLine;
      if (summary.lastTestFile) {
        testToFile.set(testName, summary.lastTestFile);
      }
      if (result === "fail") {
        const mappedFile = testToFile.get(testName);
        const failureFile = mappedFile ?? summary.lastTestFile;
        summary.failedTests.push({
          file: failureFile,
          test: testName,
        });
      }
    }
    maybeAddSuspiciousEvent(stream, line);
  };

  const consume = (stream: OutputStream, text: string) => {
    summary.totalBytes += text.length;
    const combined = buffers[stream] + text;
    const lines = combined.split(/\r?\n/);
    buffers[stream] = lines.pop() ?? "";
    for (const line of lines) {
      processLine(stream, line);
    }
  };

  const flush = () => {
    (Object.keys(buffers) as OutputStream[]).forEach(stream => {
      const tail = buffers[stream];
      if (!tail) { return; }
      processLine(stream, tail);
      buffers[stream] = "";
    });
  };

  return { consume, flush, summary };
};

export const consumeValueFlag = (
  argv: string[],
  flag: string,
): string | undefined => {
  const inlinePrefix = `${flag}=`;
  for (let index = 0; index < argv.length; index++) {
    const current = argv[index];
    if (current === flag) {
      const value = argv[index + 1];
      argv.splice(index, 2);
      return value;
    }
    if (current.startsWith(inlinePrefix)) {
      const value = current.slice(inlinePrefix.length);
      argv.splice(index, 1);
      return value;
    }
  }
  return undefined;
};

export const parsePositiveInt = (value: string, flag: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid ${flag} value '${value}'. Expected a positive integer.`);
  }
  return parsed;
};

export const chunk = <T>(values: T[], size: number): T[][] => {
  if (size < 1) {
    throw new Error(`Invalid chunk size '${size}'.`);
  }
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
};
