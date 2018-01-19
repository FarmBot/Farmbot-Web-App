import { stopIE } from "../page";

describe("stopIE()", () => {
  it("not IE", () => {
    expect(stopIE).not.toThrow();
  });
});
