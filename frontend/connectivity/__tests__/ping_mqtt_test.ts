jest.mock("../index", () => ({
  dispatchNetworkDown: jest.fn(),
  dispatchNetworkUp: jest.fn(),
  dispatchQosStart: jest.fn(),
  pingOK: jest.fn()
}));

import {
  readPing,
  startPinging,
  PING_INTERVAL,
} from "../ping_mqtt";
import { Farmbot } from "farmbot";
import { FarmBotInternalConfig } from "farmbot/dist/config";

let state: Partial<FarmBotInternalConfig> = {
  LAST_PING_IN: 123,
  LAST_PING_OUT: 456
};

function fakeBot(): Farmbot {
  const fb: Partial<Farmbot> = {
    setConfig: jest.fn(),
    publish: jest.fn(),
    on: jest.fn(),
    ping: jest.fn((_timeout: number, _now: number) => Promise.resolve(1)),
    // TODO: Fix this typing (should be `FarmBotInternalConfig[typeof key]`).
    getConfig: jest.fn((key: keyof FarmBotInternalConfig) => state[key] as never),
  };

  return fb as Farmbot;
}

describe("ping util", () => {
  it("reads LAST_PING_(IN|OUT)", () => {
    const bot = fakeBot();
    expect(readPing(bot, "in")).toEqual(123);
    expect(readPing(bot, "out")).toEqual(456);
  });

  it("handles missing LAST_PING_(IN|OUT)", () => {
    state = {};
    const bot = fakeBot();
    expect(readPing(bot, "in")).toEqual(undefined);
    expect(readPing(bot, "out")).toEqual(undefined);
  });

  it("binds event handlers with startPinging()", async () => {
    jest.useFakeTimers();
    const bot = fakeBot();
    await startPinging(bot);
    expect(bot.ping).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(PING_INTERVAL + 10);
    expect(bot.ping).toHaveBeenCalledTimes(2);
  });
});
