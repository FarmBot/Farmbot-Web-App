jest.mock("../auto_sync_handle_inbound", () => ({ handleInbound: jest.fn() }));

import {
  dispatchNetworkUp, dispatchNetworkDown, dispatchQosStart,
  networkUptimeThrottleStats,
} from "../index";
import { GetState } from "../../redux/interfaces";
import { autoSync, routeMqttData } from "../auto_sync";
import { handleInbound } from "../auto_sync_handle_inbound";
import { store } from "../../redux/store";
import { Actions } from "../../constants";

const NOW = new Date();
const SHORT_TIME_LATER = new Date(NOW.getTime() + 500).getTime();
const LONGER_TIME_LATER = new Date(NOW.getTime() + 5000).getTime();
const resetStats = () => {
  networkUptimeThrottleStats["user.api"] = 0;
  networkUptimeThrottleStats["user.mqtt"] = 0;
  networkUptimeThrottleStats["bot.mqtt"] = 0;
};

afterAll(() => {
  jest.unmock("../auto_sync_handle_inbound");
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

  it("ignores `bot.mqtt`, now handled by the QoS Ping system", () => {
    const dispatch = store.dispatch as unknown as jest.Mock;
    dispatchNetworkUp("bot.mqtt", 123);
    expect(dispatch).not.toHaveBeenCalled();
    expect(networkUptimeThrottleStats["bot.mqtt"]).toEqual(0);
  });
});

describe("dispatchNetworkDown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (store as unknown as { dispatch: Function }).dispatch = jest.fn();
    resetStats();
  });

  it("ignores `bot.mqtt`, now handled by the QoS Ping system", () => {
    const dispatch = store.dispatch as unknown as jest.Mock;
    dispatchNetworkDown("bot.mqtt", 123);
    expect(dispatch).not.toHaveBeenCalled();
    expect(networkUptimeThrottleStats["bot.mqtt"]).toEqual(0);
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
