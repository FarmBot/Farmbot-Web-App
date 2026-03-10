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
  getGardenSize,
  getSafeZ,
} from "../stubs";
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
