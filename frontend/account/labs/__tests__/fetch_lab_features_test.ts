import { fetchLabFeatures } from "../labs_features_list_data";

describe("fetchLabFeatures", () => {
  Object.defineProperty(window.location, "reload", { value: jest.fn() });
  it("basically just initializes stuff", () => {
    const val = fetchLabFeatures(jest.fn());
    expect(val.length).toBe(8);
    expect(val[0].value).toBeFalsy();
    const { callback } = val[0];
    if (callback) {
      expect(callback).not.toThrowError();
    } else {
      expect(callback).toBeDefined();
    }
  });
});
