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

import {
  dispatchNetworkUp, dispatchNetworkDown, dispatchQosStart,
  networkUptimeThrottleStats,
} from "../index";
import { networkUp, networkDown } from "../actions";
import { GetState } from "../../redux/interfaces";
import { autoSync, routeMqttData } from "../auto_sync";
import { handleInbound } from "../auto_sync_handle_inbound";
import { store } from "../../redux/store";
import { DeepPartial } from "redux";
import { Everything } from "../../interfaces";
import { Actions } from "../../constants";

const NOW = new Date();
const SHORT_TIME_LATER = new Date(NOW.getTime() + 500).getTime();
const LONGER_TIME_LATER = new Date(NOW.getTime() + 5000).getTime();
const resetStats = () => {
  networkUptimeThrottleStats["user.api"] = 0;
  networkUptimeThrottleStats["user.mqtt"] = 0;
  networkUptimeThrottleStats["bot.mqtt"] = 0;
};

describe("dispatchNetworkUp", () => {
  const NOW_UP = networkUp("user.mqtt", NOW.getTime());
  const LATER_UP = networkUp("user.mqtt", LONGER_TIME_LATER);

  it("calls redux directly", () => {
    dispatchNetworkUp("user.mqtt", NOW.getTime());
    expect(store.dispatch).toHaveBeenLastCalledWith(NOW_UP);
    dispatchNetworkUp("user.mqtt", SHORT_TIME_LATER);
    expect(store.dispatch).toHaveBeenLastCalledWith(NOW_UP);
    dispatchNetworkUp("user.mqtt", LONGER_TIME_LATER);
    expect(store.dispatch).toHaveBeenLastCalledWith(LATER_UP);
  });

  it("ignores `bot.mqtt`, now handled by the QoS Ping system", () => {
    dispatchNetworkUp("bot.mqtt", 123);
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});

describe("dispatchNetworkDown", () => {
  const NOW_DOWN = networkDown("user.api", NOW.getTime());
  const LATER_DOWN = networkDown("user.api", LONGER_TIME_LATER);
  beforeEach(resetStats);
  it("ignores `bot.mqtt`, now handled by the QoS Ping system", () => {
    dispatchNetworkDown("bot.mqtt", 123);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("calls redux directly", () => {
    dispatchNetworkDown("user.api", NOW.getTime());
    expect(store.dispatch).toHaveBeenLastCalledWith(NOW_DOWN);
    dispatchNetworkDown("user.api", SHORT_TIME_LATER);
    expect(store.dispatch).toHaveBeenLastCalledWith(NOW_DOWN);
    dispatchNetworkDown("user.api", LONGER_TIME_LATER);
    expect(store.dispatch).toHaveBeenLastCalledWith(LATER_DOWN);
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
      .toHaveBeenCalledWith({ type: Actions.PING_START, payload: { id } });
  });
});
