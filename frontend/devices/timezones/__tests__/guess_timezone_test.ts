import { inferTimezone, maybeSetTimezone } from "../guess_timezone";
import { get, set } from "lodash";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import * as crud from "../../../api/crud";
import { Actions } from "../../../constants";
import * as mustBeOnline from "../../must_be_online";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let forceOnlineSpy: jest.SpyInstance;
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
  beforeEach(() => {
    localStorage.removeItem("myBotIs");
    jest.clearAllMocks();
    editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
    saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
    forceOnlineSpy = jest.spyOn(mustBeOnline, "forceOnline")
      .mockImplementation(() => false);
  });

  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("doesn't set timezone", () => {
    const device = fakeDevice();
    device.body.timezone = "fake timezone";
    const dispatch = jest.fn();
    maybeSetTimezone(dispatch, device);
    expect(dispatch).not.toHaveBeenCalled();
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("doesn't set timezone, but sets 3D time", () => {
    localStorage.setItem("myBotIs", "online");
    forceOnlineSpy.mockReturnValueOnce(true);
    const device = fakeDevice();
    device.body.timezone = "fake timezone";
    const dispatch = jest.fn();
    maybeSetTimezone(dispatch, device);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_TIME,
      payload: "16:00",
    });
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("sets timezone", () => {
    const device = fakeDevice();
    device.body.timezone = undefined;
    const dispatch = jest.fn();
    maybeSetTimezone(dispatch, device);
    expect(editSpy).toHaveBeenCalledWith(device, { timezone: "UTC" });
    expect(saveSpy).toHaveBeenCalledWith(device.uuid);
  });

  it("sets timezone and lng", () => {
    localStorage.setItem("myBotIs", "online");
    forceOnlineSpy.mockReturnValueOnce(true).mockReturnValueOnce(true);
    const spy = jest.spyOn(Date.prototype, "getTimezoneOffset")
      .mockReturnValue(360);
    const device = fakeDevice();
    device.body.timezone = undefined;
    const dispatch = jest.fn();
    maybeSetTimezone(dispatch, device);
    expect(editSpy).toHaveBeenCalledWith(device, {
      timezone: "UTC", lat: 0, lng: -90,
    });
    expect(saveSpy).toHaveBeenCalledWith(device.uuid);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_TIME,
      payload: "16:00",
    });
    spy.mockRestore();
  });
});
