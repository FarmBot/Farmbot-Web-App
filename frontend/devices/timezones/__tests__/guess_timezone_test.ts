import { inferTimezone } from "../guess_timezone";
import { get, set } from "lodash";

describe("inferTimezone", () => {
  it("returns the timezone provided, if possible", () => {
    const tz = "America/Chicago";
    expect(inferTimezone(tz)).toBe(tz);
  });

  it("returns UTC when browser support is not there", () => {
    const x = get(window, "Intl", undefined);
    set(window, "Intl", undefined);
    window.alert = jest.fn();
    expect(inferTimezone(undefined)).toBe("UTC");
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("UTC"));
    set(window, "Intl", x);
  });
});
