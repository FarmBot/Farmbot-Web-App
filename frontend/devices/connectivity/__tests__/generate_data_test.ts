import { connectivityData, ConnectivityDataProps } from "../generate_data";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("connectivityData()", () => {
  const fakeProps = (): ConnectivityDataProps => {
    bot.connectivity.uptime["user.mqtt"] = { state: "up", at: 100 };
    bot.connectivity.uptime["user.api"] = { state: "up", at: 100 };
    bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 100 };
    bot.hardware.informational_settings.firmware_version = "1.0.0.R";
    const device = fakeDevice();
    device.body.last_saw_api = "2222-02-07T22:22:22.222Z";
    return {
      bot,
      device,
      apiFirmwareValue: undefined,
    };
  };

  it("returns unconnected", () => {
    const p = fakeProps();
    p.bot.connectivity.uptime["user.mqtt"] = undefined;
    p.bot.connectivity.uptime["user.api"] = undefined;
    p.bot.connectivity.uptime["bot.mqtt"] = undefined;
    p.bot.hardware.informational_settings.firmware_version = undefined;
    const result = connectivityData(p);
    expect(result.flags).toEqual({
      userMQTT: false,
      userAPI: false,
      botMQTT: false,
      botAPI: false,
      botFirmware: false,
    });
  });

  it("returns connected", () => {
    const result = connectivityData(fakeProps());
    expect(result.flags).toEqual({
      userMQTT: true,
      userAPI: true,
      botMQTT: true,
      botAPI: true,
      botFirmware: true,
    });
  });

  it("returns connected for demo accounts", () => {
    localStorage.setItem("myBotIs", "online");
    const result = connectivityData(fakeProps());
    expect(result.flags).toEqual({
      userMQTT: true,
      userAPI: true,
      botMQTT: true,
      botAPI: true,
      botFirmware: true,
    });
    localStorage.setItem("myBotIs", "");
  });

  const UNKNOWN = "Unknown.";

  it("returns unknown for states with prerequisites: user.mqtt down", () => {
    const p = fakeProps();
    p.bot.connectivity.uptime["user.mqtt"] = undefined;
    const result = connectivityData(p);
    expect(result.flags).toEqual({
      userMQTT: false,
      userAPI: true,
      botMQTT: false,
      botAPI: true,
      botFirmware: false,
    });
    expect(result.data.botMQTT.connectionMsg).toEqual(UNKNOWN);
    expect(result.data.botFirmware.connectionMsg).toEqual(UNKNOWN);
  });

  it("returns unknown for states with prerequisites: user.api down", () => {
    const p = fakeProps();
    p.bot.connectivity.uptime["user.api"] = undefined;
    const result = connectivityData(p);
    expect(result.flags).toEqual({
      userMQTT: true,
      userAPI: false,
      botMQTT: true,
      botAPI: false,
      botFirmware: true,
    });
    expect(result.data.botAPI.connectionMsg).toEqual(UNKNOWN);
  });

  it("returns unknown for states with prerequisites: bot.mqtt down", () => {
    const p = fakeProps();
    p.bot.connectivity.uptime["bot.mqtt"] = undefined;
    const result = connectivityData(p);
    expect(result.flags).toEqual({
      userMQTT: true,
      userAPI: true,
      botMQTT: false,
      botAPI: true,
      botFirmware: false,
    });
    expect(result.data.botFirmware.connectionMsg).toEqual(UNKNOWN);
  });
});
