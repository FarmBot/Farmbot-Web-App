import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeFbosConfig, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { getModifiedClassName } from "../default_values";
import { FirmwareHardware } from "farmbot";
import {
  BooleanConfigKey as BooleanWebAppConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { BooleanSetting } from "../../session_keys";
import { store } from "../../redux/store";

describe("getModifiedClassName()", () => {
  let mockState = fakeState();
  let originalGetState: typeof store.getState;

  beforeEach(() => {
    mockState = fakeState();
    mockState.auth.token.unencoded.aud = "staff";
    originalGetState = store.getState;
    (store as unknown as { getState: () => typeof mockState }).getState = () => mockState;
  });

  afterEach(() => {
    (store as unknown as { getState: typeof store.getState }).getState = originalGetState;
  });

  it.each<[BooleanWebAppConfigKey, FirmwareHardware, string]>([
    [BooleanSetting.hide_sensors, "arduino", ""],
    [BooleanSetting.hide_sensors, "farmduino", ""],
    [BooleanSetting.hide_sensors, "farmduino_k14", ""],
    [BooleanSetting.hide_sensors, "farmduino_k15", ""],
    [BooleanSetting.hide_sensors, "farmduino_k16", ""],
    [BooleanSetting.hide_sensors, "farmduino_k17", ""],
    [BooleanSetting.hide_sensors, "farmduino_k18", ""],
    [BooleanSetting.hide_sensors, "express_k10", "modified"],
    [BooleanSetting.hide_sensors, "express_k11", "modified"],
    [BooleanSetting.hide_sensors, "express_k12", "modified"],
  ])("returns class name: %s %s", (key, firmwareHardware, className) => {
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.highlight_modified_settings = true;
    webAppConfig.body.hide_sensors = false;
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.firmware_hardware = firmwareHardware;
    mockState.resources = buildResourceIndex([webAppConfig, fbosConfig]);
    expect(getModifiedClassName(key)).toEqual(className);
  });
});
