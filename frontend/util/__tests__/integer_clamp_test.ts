import { IntegerSize, clampUnsignedInteger } from "../integer_clamp";

describe("clampUnsignedInteger()", () => {
  function clampTest(
    input: string,
    output: number | undefined,
    message: string,
    size: IntegerSize) {
    it(`${size}: ${message}`, () => {
      const result = clampUnsignedInteger(input, size);
      expect(result.outcome).toEqual(message);
      expect(result.result).toEqual(output);
    });
  }
  clampTest("nope", undefined, "malformed", "short");
  clampTest("100000", 32000, "high", "short");
  clampTest("-100000", 0, "low", "short");
  clampTest("1000", 1000, "ok", "short");
  clampTest("1000000", 1000000, "ok", "long");
  clampTest("-1000000", 0, "low", "long");
});
