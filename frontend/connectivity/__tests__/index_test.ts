jest.mock("../../redux/store", () => {
  return {
    store: {
      dispatch: jest.fn(),
      getState: jest.fn((): DeepPartial<Everything> => ({
        bot: {
          connectivity: {
            pings: {
              "already_complete": {
                kind: "complete",
                start: 1,
                end: 2
              }
            }
          }
        }
      }))
    }
  };
});

jest.mock("../auto_sync_handle_inbound", () => ({ handleInbound: jest.fn() }));

import { dispatchNetworkUp, dispatchNetworkDown, dispatchQosStart, networkUptimeThrottleStats } from "../index";
import { networkUp, networkDown } from "../actions";
import { GetState } from "../../redux/interfaces";
import { autoSync, routeMqttData } from "../auto_sync";
import { handleInbound } from "../auto_sync_handle_inbound";
import { store } from "../../redux/store";
import { DeepPartial } from "redux";
import { Everything } from "../../interfaces";
import { now } from "../../devices/connectivity/qos";

const NOW = new Date();
const SHORT_TIME_LATER = new Date(NOW.getTime() + 500).getTime();
const LONGER_TIME_LATER = new Date(NOW.getTime() + 5000).getTime();
const resetStats = () => {
  networkUptimeThrottleStats["user.api"] = 0;
  networkUptimeThrottleStats["user.mqtt"] = 0;
  networkUptimeThrottleStats["bot.mqtt"] = 0;
};

describe("dispatchNetworkUp", () => {
  const NOW_UP = networkUp("bot.mqtt", NOW.getTime());
  const LATER_UP = networkUp("bot.mqtt", LONGER_TIME_LATER);

  it("calls redux directly", () => {
    dispatchNetworkUp("bot.mqtt", NOW.getTime());
    expect(store.dispatch).toHaveBeenLastCalledWith(NOW_UP);
    dispatchNetworkUp("bot.mqtt", SHORT_TIME_LATER);
    expect(store.dispatch).toHaveBeenLastCalledWith(NOW_UP);
    dispatchNetworkUp("bot.mqtt", LONGER_TIME_LATER);
    expect(store.dispatch).toHaveBeenLastCalledWith(LATER_UP);
  });
});

describe("dispatchNetworkDown", () => {
  const NOW_DOWN = networkDown("user.api", NOW.getTime());
  const LATER_DOWN = networkDown("user.api", LONGER_TIME_LATER);
  beforeEach(resetStats);

  it("calls redux directly", () => {
    dispatchNetworkDown("user.api", NOW.getTime());
    expect(store.dispatch).toHaveBeenLastCalledWith(NOW_DOWN);
    dispatchNetworkDown("user.api", SHORT_TIME_LATER);
    expect(store.dispatch).toHaveBeenLastCalledWith(NOW_DOWN);
    dispatchNetworkDown("user.api", LONGER_TIME_LATER);
    expect(store.dispatch).toHaveBeenLastCalledWith(LATER_DOWN);
  });

  it("does not falsely mark network of being down", () => {
    // This test uses mocked state.
    // Please see `jest.mock` calls above.
    dispatchNetworkDown("bot.mqtt", now(), "already_complete");
    expect(store.dispatch).not.toHaveBeenCalled();
    resetStats();
    dispatchNetworkDown("bot.mqtt", now(), "not_complete");
    expect(store.dispatch).toHaveBeenCalled();
  });
});

describe("autoSync", () => {
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
  it("dispatches when a QoS ping is starting", () => {
    const id = "hello";
    dispatchQosStart(id);
    expect(store.dispatch)
      .toHaveBeenCalledWith({ type: "START_QOS_PING", payload: { id } });
  });
});
