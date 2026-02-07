import { describe, expect, it } from "bun:test";
import { consumeValueFlag } from "./run_tests_support";

describe("consumeValueFlag()", () => {
  it("consumes separate flag value", () => {
    const args = ["--coverage", "--coverage-dir", "coverage_fe", "--timeout=1000"];
    const value = consumeValueFlag(args, "--coverage-dir");
    expect(value).toBe("coverage_fe");
    expect(args).toEqual(["--coverage", "--timeout=1000"]);
  });

  it("consumes inline flag value", () => {
    const args = ["--coverage", "--coverage-dir=coverage_fe"];
    const value = consumeValueFlag(args, "--coverage-dir");
    expect(value).toBe("coverage_fe");
    expect(args).toEqual(["--coverage"]);
  });
});
