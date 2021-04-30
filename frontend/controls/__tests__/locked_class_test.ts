import { lockedClass } from "../locked_class";

describe("lockedClass()", () => {
  it("returns locked class", () => {
    expect(lockedClass(true)).toEqual("pseudo-disabled");
    expect(lockedClass(undefined)).toEqual("");
  });
});
