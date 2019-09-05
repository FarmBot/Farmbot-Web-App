const mockRedux = { store: { dispatch: jest.fn() } };
jest.mock("../../redux/store", () => mockRedux);

jest.mock("../auto_sync_handle_inbound", () => ({ handleInbound: jest.fn() }));

import { dispatchNetworkUp, dispatchNetworkDown } from "../index";
import { networkUp, networkDown } from "../actions";
import { GetState } from "../../redux/interfaces";
import { autoSync, routeMqttData } from "../auto_sync";
import { handleInbound } from "../auto_sync_handle_inbound";

const NOW = new Date();
const SHORT_TIME_LATER = new Date(NOW.getTime() + 500).getTime();
const LONGER_TIME_LATER = new Date(NOW.getTime() + 5000).getTime();

describe("dispatchNetworkUp", () => {
  const NOW_UP = networkUp("bot.mqtt", NOW.getTime(), "tests");
  const LATER_UP = networkUp("bot.mqtt", LONGER_TIME_LATER, "tests");

  it("calls redux directly", () => {
    dispatchNetworkUp("bot.mqtt", NOW.getTime(), "tests");
    expect(mockRedux.store.dispatch).toHaveBeenLastCalledWith(NOW_UP);
    dispatchNetworkUp("bot.mqtt", SHORT_TIME_LATER, "tests");
    expect(mockRedux.store.dispatch).toHaveBeenLastCalledWith(NOW_UP);
    dispatchNetworkUp("bot.mqtt", LONGER_TIME_LATER, "tests");
    expect(mockRedux.store.dispatch).toHaveBeenLastCalledWith(LATER_UP);
  });
});

describe("dispatchNetworkDown", () => {
  const NOW_DOWN = networkDown("user.api", NOW.getTime(), "tests");
  const LATER_DOWN = networkDown("user.api", LONGER_TIME_LATER, "tests");

  it("calls redux directly", () => {
    dispatchNetworkDown("user.api", NOW.getTime(), "tests");
    expect(mockRedux.store.dispatch).toHaveBeenLastCalledWith(NOW_DOWN);
    dispatchNetworkDown("user.api", SHORT_TIME_LATER, "tests");
    expect(mockRedux.store.dispatch).toHaveBeenLastCalledWith(NOW_DOWN);
    dispatchNetworkDown("user.api", LONGER_TIME_LATER, "tests");
    expect(mockRedux.store.dispatch).toHaveBeenLastCalledWith(LATER_DOWN);
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
