import { stopIE } from "../stop_ie";

describe("stopIE()", () => {
  it("not IE", () => {
    expect(stopIE).not.toThrow();
  });
});
