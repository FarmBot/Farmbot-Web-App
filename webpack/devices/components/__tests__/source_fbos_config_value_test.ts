import { sourceFbosConfigValue } from "../source_fbos_config_value";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeFbosConfig } from "../../../__test_support__/fake_state/resources";

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
