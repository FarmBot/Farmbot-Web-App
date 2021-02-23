import { inferTimezone, maybeSetTimezone } from "../guess_timezone";
import { get, set } from "lodash";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

describe("inferTimezone", () => {
  it("returns the timezone provided, if possible", () => {
    const tz = "America/Chicago";
    expect(inferTimezone(tz)).toBe(tz);
  });

  it("returns UTC when browser support is not there", () => {
    const oldIntl = get(window, "Intl", undefined);
    set(window, "Intl", undefined);
    expect(inferTimezone(undefined)).toBe("UTC");
    set(window, "Intl", oldIntl);
  });
});

describe("maybeSetTimezone()", () => {
  it("doesn't set timezone", () => {
    const device = fakeDevice();
    device.body.timezone = "fake timezone";
    const dispatch = jest.fn();
    maybeSetTimezone(dispatch, device);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
