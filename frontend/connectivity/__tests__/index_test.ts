import {
  dispatchNetworkUp, dispatchNetworkDown, dispatchQosStart,
  networkUptimeThrottleStats,
} from "../index";
import { GetState } from "../../redux/interfaces";
import { autoSync, routeMqttData } from "../auto_sync";
import { handleInbound } from "../auto_sync_handle_inbound";
import * as autoSyncHandleInboundModule from "../auto_sync_handle_inbound";
import { store } from "../../redux/store";
import { Actions } from "../../constants";

const NOW = new Date();
const SHORT_TIME_LATER = new Date(NOW.getTime() + 500).getTime();
const LONGER_TIME_LATER = new Date(NOW.getTime() + 5000).getTime();
let handleInboundSpy: jest.SpyInstance;
const resetStats = () => {
  networkUptimeThrottleStats["user.api"] = 0;
  networkUptimeThrottleStats["user.mqtt"] = 0;
  networkUptimeThrottleStats["bot.mqtt"] = 0;
};

beforeEach(() => {
  handleInboundSpy = jest.spyOn(autoSyncHandleInboundModule, "handleInbound")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  handleInboundSpy.mockRestore();
});
describe("dispatchNetworkUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (store as unknown as { dispatch: Function }).dispatch = jest.fn();
    resetStats();
  });

  it("calls redux directly", () => {
    const dispatch = store.dispatch as unknown as jest.Mock;
    dispatchNetworkUp("user.mqtt", NOW.getTime());
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: Actions.NETWORK_EDGE_CHANGE,
      payload: {
        name: "user.mqtt",
        status: { state: "up", at: NOW.getTime() }
      }
    });
    expect(networkUptimeThrottleStats["user.mqtt"]).toEqual(NOW.getTime());
    dispatchNetworkUp("user.mqtt", SHORT_TIME_LATER);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(networkUptimeThrottleStats["user.mqtt"]).toEqual(NOW.getTime());
    dispatchNetworkUp("user.mqtt", LONGER_TIME_LATER);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: Actions.NETWORK_EDGE_CHANGE,
      payload: {
        name: "user.mqtt",
        status: { state: "up", at: LONGER_TIME_LATER }
      }
    });
    expect(networkUptimeThrottleStats["user.mqtt"]).toEqual(LONGER_TIME_LATER);
  });

  it("updates `bot.mqtt` status", () => {
    const dispatch = store.dispatch as unknown as jest.Mock;
    dispatchNetworkUp("bot.mqtt", NOW.getTime());
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.NETWORK_EDGE_CHANGE,
      payload: {
        name: "bot.mqtt",
        status: { state: "up", at: NOW.getTime() }
      }
    });
    expect(networkUptimeThrottleStats["bot.mqtt"]).toEqual(NOW.getTime());
  });
});

describe("dispatchNetworkDown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (store as unknown as { dispatch: Function }).dispatch = jest.fn();
    resetStats();
  });

  it("updates `bot.mqtt` status", () => {
    const dispatch = store.dispatch as unknown as jest.Mock;
    dispatchNetworkDown("bot.mqtt", NOW.getTime());
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.NETWORK_EDGE_CHANGE,
      payload: {
        name: "bot.mqtt",
        status: { state: "down", at: NOW.getTime() }
      }
    });
    expect(networkUptimeThrottleStats["bot.mqtt"]).toEqual(NOW.getTime());
  });

  it("calls redux directly", () => {
    const dispatch = store.dispatch as unknown as jest.Mock;
    dispatchNetworkDown("user.api", NOW.getTime());
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: Actions.NETWORK_EDGE_CHANGE,
      payload: {
        name: "user.api",
        status: { state: "down", at: NOW.getTime() }
      }
    });
    expect(networkUptimeThrottleStats["user.api"]).toEqual(NOW.getTime());
    dispatchNetworkDown("user.api", SHORT_TIME_LATER);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(networkUptimeThrottleStats["user.api"]).toEqual(NOW.getTime());
    dispatchNetworkDown("user.api", LONGER_TIME_LATER);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: Actions.NETWORK_EDGE_CHANGE,
      payload: {
        name: "user.api",
        status: { state: "down", at: LONGER_TIME_LATER }
      }
    });
    expect(networkUptimeThrottleStats["user.api"]).toEqual(LONGER_TIME_LATER);
  });
});

describe("autoSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the appropriate handler, applying arguments as needed", () => {
    const dispatch = jest.fn();
    const getState: GetState = jest.fn();
    const chan = "chanName";
    const payload = Buffer.from([]);
    const rmd = routeMqttData(chan, payload);
    autoSync(dispatch, getState)(chan, payload);
    expect(handleInbound).toHaveBeenCalledWith(dispatch, getState, rmd);
  });
});

describe("dispatchQosStart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (store as unknown as { dispatch: Function }).dispatch = jest.fn();
    resetStats();
  });

  it("dispatches when a QoS ping is starting", () => {
    const dispatch = store.dispatch as unknown as jest.Mock;
    const id = "hello";
    expect(() => dispatchQosStart(id)).not.toThrow();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.PING_START, payload: { id }
    });
    expect(networkUptimeThrottleStats).toEqual({
      "user.api": 0,
      "user.mqtt": 0,
      "bot.mqtt": 0,
    });
  });
});
