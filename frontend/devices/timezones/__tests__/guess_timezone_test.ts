jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import { inferTimezone, maybeSetTimezone } from "../guess_timezone";
import { get, set } from "lodash";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../api/crud";
import { Actions } from "../../../constants";

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
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("doesn't set timezone", () => {
    const device = fakeDevice();
    device.body.timezone = "fake timezone";
    const dispatch = jest.fn();
    maybeSetTimezone(dispatch, device);
    expect(dispatch).not.toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("doesn't set timezone, but sets 3D time", () => {
    localStorage.setItem("myBotIs", "online");
    const device = fakeDevice();
    device.body.timezone = "fake timezone";
    const dispatch = jest.fn();
    maybeSetTimezone(dispatch, device);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_TIME,
      payload: "12:00",
    });
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("sets timezone", () => {
    const device = fakeDevice();
    device.body.timezone = undefined;
    const dispatch = jest.fn();
    maybeSetTimezone(dispatch, device);
    expect(edit).toHaveBeenCalledWith(device, { timezone: "UTC" });
    expect(save).toHaveBeenCalledWith(device.uuid);
  });

  it("sets timezone and lng", () => {
    localStorage.setItem("myBotIs", "online");
    const spy = jest.spyOn(Date.prototype, "getTimezoneOffset")
      .mockReturnValue(360);
    const device = fakeDevice();
    device.body.timezone = undefined;
    const dispatch = jest.fn();
    maybeSetTimezone(dispatch, device);
    expect(edit).toHaveBeenCalledWith(device, {
      timezone: "UTC", lat: 0, lng: -90,
    });
    expect(save).toHaveBeenCalledWith(device.uuid);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_TIME,
      payload: "12:00",
    });
    spy.mockRestore();
  });
});
