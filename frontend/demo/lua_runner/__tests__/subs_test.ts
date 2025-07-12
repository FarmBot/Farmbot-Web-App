import {
  fakeFbosConfig,
  fakeFirmwareConfig,
  fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";

let mockFirmwareConfig = fakeFirmwareConfig();
let mockWebAppConfig = fakeWebAppConfig();
let mockFbosConfig = fakeFbosConfig();
jest.mock("../../../resources/getters", () => ({
  getFirmwareConfig: () => mockFirmwareConfig,
  getWebAppConfig: () => mockWebAppConfig,
  getFbosConfig: () => mockFbosConfig,
}));

import { getGardenSize, getSafeZ } from "../stubs";

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
