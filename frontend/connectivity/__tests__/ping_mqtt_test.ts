jest.mock("../index", () => ({
  dispatchNetworkDown: jest.fn(),
  dispatchNetworkUp: jest.fn(),
  dispatchQosStart: jest.fn(),
  pingOK: jest.fn()
}));

import {
  readPing,
  startPinging,
  PING_INTERVAL
} from "../ping_mqtt";
import { Farmbot, RpcRequest, RpcRequestBodyItem } from "farmbot";
import { FarmBotInternalConfig } from "farmbot/dist/config";

const state: Partial<FarmBotInternalConfig> = {
  LAST_PING_IN: 123,
  LAST_PING_OUT: 456
};

function fakeBot(): Farmbot {
  const fb: Partial<Farmbot> = {
    rpcShim: jest.fn((_: RpcRequestBodyItem[]): RpcRequest => ({
      kind: "rpc_request",
      args: {
        label: "ping",
        priority: 0
      }
    })),
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

  it("binds event handlers with startPinging()", (done) => {
    const bot = fakeBot();
    startPinging(bot);
    setTimeout(() => {
      expect(bot.ping).toHaveBeenCalled();
      done();
    }, PING_INTERVAL + 10);
  });
});
