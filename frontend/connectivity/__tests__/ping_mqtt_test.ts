import {
  startPinging,
  PING_INTERVAL,
  sendOutboundPing,
} from "../ping_mqtt";
import { Farmbot } from "farmbot";
import { FarmBotInternalConfig } from "farmbot/dist/config";
import * as connectivity from "../index";
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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(connectivity, "dispatchNetworkDown").mockImplementation(jest.fn());
    jest.spyOn(connectivity, "dispatchNetworkUp").mockImplementation(jest.fn());
    jest.spyOn(connectivity, "dispatchQosStart").mockImplementation(jest.fn());
    jest.spyOn(connectivity, "pingOK").mockImplementation(jest.fn());
    jest.spyOn(connectivity, "pingNO").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.useRealTimers();
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

describe("sendOutboundPing()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(connectivity, "dispatchNetworkDown").mockImplementation(jest.fn());
    jest.spyOn(connectivity, "dispatchNetworkUp").mockImplementation(jest.fn());
    jest.spyOn(connectivity, "dispatchQosStart").mockImplementation(jest.fn());
    jest.spyOn(connectivity, "pingOK").mockImplementation(jest.fn());
    jest.spyOn(connectivity, "pingNO").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("handles failure", async () => {
    const fakeBot: DeepPartial<Farmbot> = {
      ping: jest.fn(() => Promise.reject())
    };
    expect(connectivity.pingNO).not.toHaveBeenCalled();
    await expect(sendOutboundPing(fakeBot as Farmbot)).rejects
      .toThrow(/sendOutboundPing failed/);
    expect(connectivity.pingNO).toHaveBeenCalled();
  });
});
