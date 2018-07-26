
const mockRedux = {
  store: {
    dispatch: jest.fn()
  }
};

jest.mock("../../redux/store", () => mockRedux);
jest.mock("lodash", () => {
  return {
    set(target: any, key: string, val: any) { target[key] = val; },
    times: (n: number, iter: Function) => {
      let n2 = n;
      while (n2 > 0) {
        iter(n2);
        n2--;
      }
    },
    throttle: (x: Function) => x
  };
});

jest.mock("../auto_sync_handle_inbound", () => {
  return { handleInbound: jest.fn() };
});

import { dispatchNetworkUp, dispatchNetworkDown } from "../index";
import { networkUp, networkDown } from "../actions";
import { GetState } from "../../redux/interfaces";
import { autoSync, routeMqttData } from "../auto_sync";
import { handleInbound } from "../auto_sync_handle_inbound";
const NOW = (new Date());
describe("dispatchNetworkUp", () => {
  it("calls redux directly", () => {
    jest.resetAllMocks();
    dispatchNetworkUp("bot.mqtt", NOW, "tests");
    expect(mockRedux.store.dispatch)
      .toHaveBeenLastCalledWith(networkUp("bot.mqtt", NOW.toJSON(), "tests"));
  });
});

describe("dispatchNetworkDown", () => {
  it("calls redux directly", () => {
    jest.resetAllMocks();
    dispatchNetworkDown("user.api", NOW, "tests");
    expect(mockRedux.store.dispatch)
      .toHaveBeenLastCalledWith(networkDown("user.api", NOW.toJSON(), "tests"));
  });
});

describe("autoSync", () => {
  it("calls the appropriate handler, applying arguments as needed", () => {
    const dispatch = jest.fn();
    const getState: GetState = jest.fn();
    const chan = "chanName";
    const payload = new Buffer([]);
    const rmd = routeMqttData(chan, payload);
    autoSync(dispatch, getState)(chan, payload);
    expect(handleInbound).toHaveBeenCalledWith(dispatch, getState, rmd);
  });
});
