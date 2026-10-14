import { TaggedFbosConfig } from "farmbot";
import {
  fakeFbosConfig,
  fakeFirmwareConfig,
  fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";

let mockFirmwareConfig = fakeFirmwareConfig();
let mockWebAppConfig = fakeWebAppConfig();
let mockFbosConfig: TaggedFbosConfig | undefined = fakeFbosConfig();

import {
  getDefaultAxisOrder,
  getDeviceStatus,
  getGardenSize,
  getLocalTime,
  getSafeZ,
} from "../stubs";
import { store } from "../../../redux/store";
import * as getters from "../../../resources/getters";

let getFirmwareConfigSpy: jest.SpyInstance;
let getWebAppConfigSpy: jest.SpyInstance;
let getFbosConfigSpy: jest.SpyInstance;

beforeEach(() => {
  getFirmwareConfigSpy = jest.spyOn(getters, "getFirmwareConfig")
    .mockImplementation(() => mockFirmwareConfig);
  getWebAppConfigSpy = jest.spyOn(getters, "getWebAppConfig")
    .mockImplementation(() => mockWebAppConfig);
  getFbosConfigSpy = jest.spyOn(getters, "getFbosConfig")
    .mockImplementation(() => mockFbosConfig);
});

afterEach(() => {
  getFirmwareConfigSpy.mockRestore();
  getWebAppConfigSpy.mockRestore();
  getFbosConfigSpy.mockRestore();
});

describe("getGardenSize()", () => {
  it("gets garden size: axis lengths", () => {
    mockFirmwareConfig = fakeFirmwareConfig();
    mockFirmwareConfig.body.movement_axis_nr_steps_x = 5000;
    mockFirmwareConfig.body.movement_axis_nr_steps_y = 5000;
    mockFirmwareConfig.body.movement_axis_nr_steps_z = 25000;
    mockWebAppConfig = fakeWebAppConfig();
    mockWebAppConfig.body.map_size_x = 100;
    mockWebAppConfig.body.map_size_y = 100;
    expect(getGardenSize()).toEqual({ x: 1000, y: 1000, z: 1000 });
  });

  it("gets garden size: map size", () => {
    mockFirmwareConfig = fakeFirmwareConfig();
    mockFirmwareConfig.body.movement_axis_nr_steps_x = 0;
    mockFirmwareConfig.body.movement_axis_nr_steps_y = 0;
    mockFirmwareConfig.body.movement_axis_nr_steps_z = 0;
    mockWebAppConfig = fakeWebAppConfig();
    mockWebAppConfig.body.map_size_x = 100;
    mockWebAppConfig.body.map_size_y = 100;
    expect(getGardenSize()).toEqual({ x: 100, y: 100, z: 500 });
  });
});

describe("getSafeZ()", () => {
  it("gets zero", () => {
    mockFbosConfig = fakeFbosConfig();
    mockFbosConfig.body.safe_height = undefined;
    expect(getSafeZ()).toEqual(0);
  });

  it("gets height", () => {
    mockFbosConfig = fakeFbosConfig();
    mockFbosConfig.body.safe_height = -200;
    expect(getSafeZ()).toEqual(-200);
  });
});

describe("getDefaultAxisOrder()", () => {
  it("handles undefined", () => {
    mockFbosConfig = undefined;
    expect(getDefaultAxisOrder()).toEqual([]);
  });

  it("returns safe_z", () => {
    mockFbosConfig = fakeFbosConfig();
    mockFbosConfig.body.default_axis_order = "safe_z";
    expect(getDefaultAxisOrder()).toEqual([{ kind: "safe_z", args: {} }]);
  });

  it("returns axis_order", () => {
    mockFbosConfig = fakeFbosConfig();
    mockFbosConfig.body.default_axis_order = "xyz;high";
    expect(getDefaultAxisOrder()).toEqual([
      { kind: "axis_order", args: { grouping: "xyz", route: "high" } },
    ]);
  });
});

describe("getDeviceStatus()", () => {
  it("gets device status", () => {
    const originalGetState = store.getState;
    const hardware = {
      informational_settings: { locked: true },
      jobs: { "Test job": { percent: 50, status: "Working" } },
    };
    (store as unknown as { getState: Function }).getState = () => ({
      bot: { hardware },
    });

    expect(getDeviceStatus()).toEqual(hardware);

    (store as unknown as { getState: Function }).getState = originalGetState;
  });
});

describe("getLocalTime()", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ["Etc/UTC", "2026-01-01T02:03:04.005Z", {
      year: 2026, month: 1, day: 1, hour: 2, minute: 3, second: 4,
      iso8601: "2026-01-01T02:03:04.005+00:00",
    }],
    ["America/Los_Angeles", "2026-01-01T02:03:04.005Z", {
      year: 2025, month: 12, day: 31, hour: 18, minute: 3, second: 4,
      iso8601: "2025-12-31T18:03:04.005-08:00",
    }],
    ["America/Los_Angeles", "2026-07-01T02:03:04.005Z", {
      year: 2026, month: 6, day: 30, hour: 19, minute: 3, second: 4,
      iso8601: "2026-06-30T19:03:04.005-07:00",
    }],
    ["Asia/Kathmandu", "2026-01-01T02:03:04.005Z", {
      year: 2026, month: 1, day: 1, hour: 7, minute: 48, second: 4,
      iso8601: "2026-01-01T07:48:04.005+05:45",
    }],
    ["Etc/UTC", "2026-01-01T00:00:00.000Z", {
      year: 2026, month: 1, day: 1, hour: 0, minute: 0, second: 0,
      iso8601: "2026-01-01T00:00:00.000+00:00",
    }],
  ])("formats %s at %s", (timezone, timestamp, expected) => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(timestamp));
    expect(getLocalTime(timezone)).toEqual(expected);
  });
});
