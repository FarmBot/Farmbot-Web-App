import { executableType } from "../util";

describe("executableType", () => {
  it("handles expected values", () => {
    expect(executableType("Sequence")).toEqual("Sequence");
    expect(executableType("Regimen")).toEqual("Regimen");
  });

  it("throws when given bad data", () => {
    expect(() => executableType("Nope")).toThrow();
  });
});
