import {
  startPinging,
  PING_INTERVAL,
  sendOutboundPing,
} from "../ping_mqtt";
import { Farmbot } from "farmbot";
import { FarmBotInternalConfig } from "farmbot/dist/config";
import * as connectivity from "../index";
import { DeepPartial } from "../../redux/interfaces";
import { store } from "../../redux/store";

const state: Partial<FarmBotInternalConfig> = {
  LAST_PING_IN: 123,
  LAST_PING_OUT: 456
};
let originalGetState: typeof store.getState;
let getStateMock: jest.Mock;

function fakeBot(): Farmbot {
  const fb: Partial<Farmbot> = {
    setConfig: jest.fn(),
    publish: jest.fn(),
    on: jest.fn(),
    ping: jest.fn((_timeout?: number, _now?: number) => Promise.resolve(1)),
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
    originalGetState = store.getState;
    getStateMock = jest.fn(() => ({
      app: {
        popups: { connectivity: false },
        metricPanelState: { realtime: true, network: false, history: false },
      },
    } as never));
    (store as unknown as { getState: typeof store.getState }).getState =
      getStateMock as typeof store.getState;
  });

  afterEach(() => {
    jest.useRealTimers();
    (store as unknown as { getState: typeof store.getState }).getState =
      originalGetState;
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
    originalGetState = store.getState;
    getStateMock = jest.fn(() => ({
      app: {
        popups: { connectivity: false },
        metricPanelState: { realtime: true, network: false, history: false },
      },
    } as never));
    (store as unknown as { getState: typeof store.getState }).getState =
      getStateMock as typeof store.getState;
  });

  afterEach(() => {
    jest.useRealTimers();
    (store as unknown as { getState: typeof store.getState }).getState =
      originalGetState;
  });

  it("handles failure", async () => {
    const fakeBot: DeepPartial<Farmbot> = {
      ping: jest.fn(() => Promise.reject())
    };
    expect(connectivity.pingNO).not.toHaveBeenCalled();
    await expect(sendOutboundPing(fakeBot as Farmbot)).rejects
      .toThrow(/sendOutboundPing failed/);
    expect(connectivity.pingNO).not.toHaveBeenCalled();
    expect(connectivity.dispatchNetworkDown).toHaveBeenCalled();
  });

  it("tracks qos when the connectivity network panel is open", async () => {
    getStateMock.mockReturnValue({
      app: {
        popups: { connectivity: true },
        metricPanelState: { realtime: false, network: true, history: false },
      },
    });
    await sendOutboundPing(fakeBot());
    expect(connectivity.dispatchQosStart).toHaveBeenCalled();
    expect(connectivity.pingOK).toHaveBeenCalled();
  });
});
