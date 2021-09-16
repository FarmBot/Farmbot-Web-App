import { arrayUnwrap } from "../util";

describe("arrayUnwrap()", () => {
  it("doesn't unwrap when not an array", () => {
    expect(arrayUnwrap(1)).toEqual(1);
  });
});
