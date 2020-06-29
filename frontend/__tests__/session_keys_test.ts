import { BooleanSetting, NumericSetting } from "../session_keys";

describe("BooleanSetting", () => {
  it("verifies key integrity", () => {
    Object.entries(BooleanSetting).map(([k, v]) => expect(k).toEqual(v));
  });
});

describe("NumericSetting", () => {
  it("verifies key integrity", () => {
    Object.entries(NumericSetting).map(([k, v]) => expect(k).toEqual(v));
  });
});
