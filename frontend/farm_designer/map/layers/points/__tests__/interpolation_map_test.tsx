import { InterpolationKey, getInterpolationData } from "../interpolation_map";

describe("getInterpolationData()", () => {
  it("handles missing data", () => {
    localStorage.removeItem(InterpolationKey.data);
    expect(getInterpolationData()).toEqual([]);
  });
});
