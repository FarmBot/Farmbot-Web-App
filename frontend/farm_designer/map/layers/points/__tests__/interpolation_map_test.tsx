import { fakePoint } from "../../../../../__test_support__/fake_state/resources";
import {
  InterpolationKey, getInterpolationData, interpolatedZ,
  DEFAULT_INTERPOLATION_OPTIONS,
  fetchInterpolationOptions,
} from "../interpolation_map";

describe("getInterpolationData()", () => {
  it("handles missing data", () => {
    localStorage.removeItem(InterpolationKey.data);
    expect(getInterpolationData()).toEqual([]);
  });
});

describe("interpolatedZ()", () => {
  it("returns undefined", () => {
    expect(interpolatedZ({ x: 0, y: 0 }, [], DEFAULT_INTERPOLATION_OPTIONS))
      .toEqual(undefined);
  });

  it("returns interpolated value", () => {
    const point0 = fakePoint();
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = 0;
    const point1 = fakePoint();
    point1.body.x = 100;
    point1.body.y = 100;
    point1.body.z = 100;
    expect(interpolatedZ({ x: 50, y: 50 }, [point0, point1],
      DEFAULT_INTERPOLATION_OPTIONS)).toEqual(50);
  });
});

describe("fetchInterpolationOptions()", () => {
  it("fetches options", () => {
    const savedOptions = { stepSize: 123 };
    localStorage.setItem(InterpolationKey.opts, JSON.stringify(savedOptions));
    expect(fetchInterpolationOptions().stepSize).toEqual(123);
  });
});
