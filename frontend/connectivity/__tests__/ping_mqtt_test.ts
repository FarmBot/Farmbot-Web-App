jest.mock("../index", () => ({
  dispatchNetworkDown: jest.fn(),
  dispatchNetworkUp: jest.fn(),
  dispatchQosStart: jest.fn(),
  pingOK: jest.fn(),
  pingNO: jest.fn(),
}));

import {
  startPinging,
  PING_INTERVAL,
  sendOutboundPing,
} from "../ping_mqtt";
import { Farmbot } from "farmbot";
import { FarmBotInternalConfig } from "farmbot/dist/config";
import { pingNO } from "../index";
import { DeepPartial } from "../../redux/interfaces";

const state: Partial<FarmBotInternalConfig> = {
  LAST_PING_IN: 123,
  LAST_PING_OUT: 456
};

function fakeBot(): Farmbot {
  const fb: Partial<Farmbot> = {
    setConfig: jest.fn(),
    publish: jest.fn(),
    on: jest.fn(),
    ping: jest.fn((_timeout: number, _now: number) => Promise.resolve(1)),
    getConfig: jest.fn(key => state[key] as never),
  };

  return fb as Farmbot;
}

describe("ping util", () => {
  it("binds event handlers with startPinging()", async () => {
    jest.useFakeTimers();
    const bot = fakeBot();
    await startPinging(bot);
    expect(bot.ping).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(PING_INTERVAL + 10);
    expect(bot.ping).toHaveBeenCalledTimes(2);
  });
});

describe("sendOutboundPing()", () => {
  it("handles failure", async () => {
    const fakeBot: DeepPartial<Farmbot> = {
      ping: jest.fn(() => Promise.reject())
    };
    expect(pingNO).not.toHaveBeenCalled();
    await expect(sendOutboundPing(fakeBot as Farmbot)).rejects
      .toThrow(/sendOutboundPing failed/);
    expect(pingNO).toHaveBeenCalled();
  });
});
