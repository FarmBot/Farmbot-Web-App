import { toPairs } from "../celery";

describe("toPairs()", () => {
  it("handles undefined", () => {
    expect(toPairs({ a: undefined })).toEqual([
      { kind: "pair", args: { label: "a", value: "null" } },
    ]);
  });
});
