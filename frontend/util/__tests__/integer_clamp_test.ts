import { IntegerSize, clampUnsignedInteger } from "../integer_clamp";

describe("clampUnsignedInteger()", () => {
  it.each<[IntegerSize, string, string, number | undefined]>([
    ["short", "malformed", "nope", undefined],
    ["short", "high", "100000", 32000],
    ["short", "low", "-100000", 0],
    ["short", "ok", "1000", 1000],
    ["long", "ok", "1000000", 1000000],
    ["long", "low", "-1000000", 0],
  ])("%s: %s", (size, message, input, output) => {
    const result = clampUnsignedInteger(input, size);
    expect(result.outcome).toEqual(message);
    expect(result.result).toEqual(output);
  });
});
