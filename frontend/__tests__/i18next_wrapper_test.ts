import { interpolate } from "../__test_support__/mock_i18next";

describe("interpolate()", () => {
  it("interpolates translation values", () => {
    expect(interpolate("Plant {{ crop }} on {{axis}}", {
      crop: "Carrot",
      axis: "X",
    })).toEqual("Plant Carrot on X");
  });

  it("throws when an interpolation value is missing", () => {
    expect(() => interpolate("Move along the {{ axis }} axis"))
      .toThrow("Missing interpolation value: axis");
  });

  it("returns an empty string for undefined text", () => {
    expect(interpolate(undefined)).toEqual("");
  });
});
