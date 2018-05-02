jest.mock("../index", () => {
  return {
    dispatchNetworkDown: jest.fn(),
    dispatchNetworkUp: jest.fn()
  };
});

let mockTimestamp = 0;
jest.mock("../../util", () => {
  return {
    timestamp: () => mockTimestamp
  };
});

import {
  writePing,
  LAST_IN,
  LAST_OUT,
  readPing,
  markStale,
  markActive,
  isInactive,
  sendOutboundPing,
  startPinging,
  PING,
  ACTIVE_THRESHOLD
} from "../ping_mqtt";
import { Farmbot } from "farmbot";
import { dispatchNetworkDown, dispatchNetworkUp } from "../index";
import { FarmBotInternalConfig } from "farmbot/dist/config";

const TOO_LATE_TIME_DIFF = ACTIVE_THRESHOLD + 1;
const ACCEPTABLE_TIME_DIFF = ACTIVE_THRESHOLD - 1;

let state: Partial<FarmBotInternalConfig> = {
  [LAST_IN]: 123, [LAST_OUT]: 456
};

function fakeBot(): Farmbot {
  const fb: Partial<Farmbot> = {
    setConfig: jest.fn(),
    publish: jest.fn(),
    on: jest.fn(),
    getConfig(key: keyof FarmBotInternalConfig) {
      return (state as FarmBotInternalConfig)[key];
    }
  };

  return fb as Farmbot;
}

function expectStale() {
  expect(dispatchNetworkDown).toHaveBeenCalledWith("bot.mqtt");
}

function expectActive() {
  expect(dispatchNetworkUp).toHaveBeenCalledWith("bot.mqtt");
  expect(dispatchNetworkUp).toHaveBeenCalledWith("user.mqtt");
}

describe("ping util", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("sets the LAST_PING_(IN|OUT) in bot state", () => {
    const bot = fakeBot();
    writePing(bot, "in");
    expect(bot.getConfig)
      .toHaveBeenCalledWith(LAST_IN);
    jest.clearAllMocks();
    writePing(bot, "out");
    expect(bot.getConfig)
      .toHaveBeenCalledWith(LAST_OUT);
  });

  it("reads LAST_PING_(IN|OUT)", () => {
    const bot = fakeBot();
    expect(readPing(bot, "in")).toEqual(123);
    expect(readPing(bot, "out")).toEqual(456);
  });

  it("marks the bot's connection to MQTT as 'stale'", () => {
    markStale();
    expectStale();
  });

  it("marks the bot's connection to MQTT as 'active'", () => {
    markActive();
    expectActive();
  });

  it("checks if the bot isInactive()", () => {
    expect(isInactive(1, 1 + TOO_LATE_TIME_DIFF)).toBeTruthy();
    expect(isInactive(1, 1)).toBeFalsy();
  });

  it("sends an outbound ping", () => {
    const bot = fakeBot();
    const oldOutbound = readPing(bot, "out");
    sendOutboundPing(bot);
    expect(bot.publish).toHaveBeenCalledWith(PING);
    expect(oldOutbound).toBeLessThanOrEqual(readPing(bot, "out") || NaN);
  });

  it("sends an outbound ping: mark active", () => {
    mockTimestamp = 1 + ACCEPTABLE_TIME_DIFF;
    state = { [LAST_IN]: 1 };
    sendOutboundPing(fakeBot());
    expectActive();
  });

  it("sends an outbound ping: mark stale", () => {
    mockTimestamp = 1 + TOO_LATE_TIME_DIFF;
    state = { [LAST_IN]: 1 };
    sendOutboundPing(fakeBot());
    expectStale();
  });

  it("binds event handlers with startPinging()", () => {
    const bot = fakeBot();
    startPinging(bot);
    expect(bot.on).toHaveBeenCalledWith("ping", expect.any(Function));
  });
});
