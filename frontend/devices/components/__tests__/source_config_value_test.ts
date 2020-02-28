import { sourceFbosConfigValue, sourceFwConfigValue } from "../source_config_value";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  fakeFbosConfig,
  fakeFirmwareConfig,
} from "../../../__test_support__/fake_state/resources";

describe("sourceFbosConfigValue()", () => {
  it("returns api value", () => {
    const fakeConfig = fakeFbosConfig().body;
    fakeConfig.auto_sync = false;
    bot.hardware.configuration.auto_sync = true;
    const source = sourceFbosConfigValue(fakeConfig, bot.hardware.configuration);
    expect(source("auto_sync")).toEqual({ value: false, consistent: false });
  });

  it("returns bot value", () => {
    bot.hardware.configuration.auto_sync = true;
    const source = sourceFbosConfigValue(undefined, bot.hardware.configuration);
    expect(source("auto_sync")).toEqual({ value: true, consistent: true });
  });

  it("returns api value: consistent with bot", () => {
    const fakeConfig = fakeFbosConfig().body;
    fakeConfig.auto_sync = true;
    bot.hardware.configuration.auto_sync = true;
    const source = sourceFbosConfigValue(fakeConfig, bot.hardware.configuration);
    expect(source("auto_sync")).toEqual({ value: true, consistent: true });
  });
});

describe("sourceFwConfigValue()", () => {
  it("returns api value", () => {
    const fakeConfig = fakeFirmwareConfig().body;
    fakeConfig.param_mov_nr_retry = 0;
    bot.hardware.mcu_params.param_mov_nr_retry = 1;
    const source = sourceFwConfigValue(fakeConfig, bot.hardware.mcu_params);
    expect(source("param_mov_nr_retry")).toEqual({ value: 0, consistent: false });
  });

  it("returns bot value", () => {
    bot.hardware.mcu_params.param_mov_nr_retry = 1;
    const source = sourceFwConfigValue(undefined, bot.hardware.mcu_params);
    expect(source("param_mov_nr_retry")).toEqual({ value: 1, consistent: true });
  });

  it("returns api value: consistent with bot", () => {
    const fakeConfig = fakeFirmwareConfig().body;
    fakeConfig.param_mov_nr_retry = 1;
    bot.hardware.mcu_params.param_mov_nr_retry = 1;
    const source = sourceFwConfigValue(fakeConfig, bot.hardware.mcu_params);
    expect(source("param_mov_nr_retry")).toEqual({ value: 1, consistent: true });
  });
});
