import { IntegerSize, clampInteger } from "../integer_clamp";

describe("clampInteger()", () => {
  it.each<[IntegerSize, string, string, number | undefined]>([
    ["short", "malformed", "nope", undefined],
    ["short", "high", "100000", 32000],
    ["short", "low", "-100000", 0],
    ["short", "ok", "1000", 1000],
    ["long", "ok", "1000000", 1000000],
    ["long", "low", "-1000000", 0],
  ])("%s: %s", (size, message, input, output) => {
    const result = clampInteger(input, size);
    expect(result.outcome).toEqual(message);
    expect(result.result).toEqual(output);
  });

  it("doesn't restrict to provided min", () => {
    const result = clampInteger("5", "short", { min: -10, max: 10 });
    expect(result.outcome).toEqual("ok");
    expect(result.result).toEqual(5);
  });

  it("restricts to provided min", () => {
    const result = clampInteger("-100", "short", { min: -10, max: 10 });
    expect(result.outcome).toEqual("low");
    expect(result.result).toEqual(-10);
  });

  it("restricts to provided max", () => {
    const result = clampInteger("100", "short", { min: -10, max: 10 });
    expect(result.outcome).toEqual("high");
    expect(result.result).toEqual(10);
  });

  it("restricts to min", () => {
    const result = clampInteger("-40000", "short", { min: -10e100, max: 10e100 });
    expect(result.outcome).toEqual("low");
    expect(result.result).toEqual(-32000);
  });

  it("restricts to max", () => {
    const result = clampInteger("40000", "short", { min: -10e100, max: 10e100 });
    expect(result.outcome).toEqual("high");
    expect(result.result).toEqual(32000);
  });
});
