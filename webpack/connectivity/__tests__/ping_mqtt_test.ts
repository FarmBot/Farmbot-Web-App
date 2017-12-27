jest.mock("../index", () => {
  return {
    dispatchNetworkDown: jest.fn(),
    dispatchNetworkUp: jest.fn()
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
  startPinging
} from "../ping_mqtt";
import { Farmbot } from "farmbot";
import { dispatchNetworkDown, dispatchNetworkUp } from "../index";
function fakeBot(): Farmbot {
  const state = { [LAST_IN]: 123, [LAST_OUT]: 456 };
  const fb: Partial<Farmbot> = {
    setState: jest.fn(),
    publish: jest.fn(),
    on: jest.fn(),
    getState() { return state; }
  };

  return fb as Farmbot;
}

describe("ping util", () => {
  it("sets the LAST_PING_(IN|OUT) in bot state", () => {
    const bot = fakeBot();
    writePing(bot, "in");
    expect(bot.setState)
      .toHaveBeenCalledWith(LAST_IN, expect.any(Number));
    jest.clearAllMocks();
    writePing(bot, "out");
    expect(bot.setState)
      .toHaveBeenCalledWith(LAST_OUT, expect.any(Number));
  });

  it("reads LAST_PING_(IN|OUT)", () => {
    const bot = fakeBot();
    expect(readPing(bot, "in")).toEqual(123);
    expect(readPing(bot, "out")).toEqual(456);
  });

  it("marks the bot's connection to MQTT as 'stale'", () => {
    markStale();
    expect(dispatchNetworkDown).toHaveBeenCalledWith("bot.mqtt");
  });

  it("marks the bot's connection to MQTT as 'active'", () => {
    markActive();
    expect(dispatchNetworkUp).toHaveBeenCalledWith("bot.mqtt");
    expect(dispatchNetworkUp).toHaveBeenCalledWith("user.mqtt");
  });

  it("checks if the bot isInactive()", () => {
    expect(isInactive(0, undefined)).toBeFalsy();
    expect(isInactive(1, 6000)).toBeTruthy();
    expect(isInactive(6000, 1)).toBeFalsy();
  });

  it("sends an outbound ping", () => {
    const bot = fakeBot();
    const oldOutbound = readPing(bot, "out");
    sendOutboundPing(bot);
    expect(bot.publish).toHaveBeenCalledWith("ping");
    expect(oldOutbound).toBeLessThan(readPing(bot, "out"));
  });

  it("binds event handlers with startPinging()", () => {
    const bot = fakeBot();
    startPinging(bot);
    expect(bot.on).toHaveBeenCalledWith("ping", expect.any(Function));
  })
});
