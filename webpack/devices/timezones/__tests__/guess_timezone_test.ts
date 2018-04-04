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
    expect(inferTimezone(undefined)).toBe("UTC");
    set(window, "Intl", x);
  });
});
