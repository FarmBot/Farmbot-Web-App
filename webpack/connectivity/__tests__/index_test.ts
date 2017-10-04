
const mockRedux = {
  store: {
    dispatch: jest.fn()
  }
};

jest.mock("../../redux/store", () => mockRedux);

import { dispatchNetworkUp, dispatchNetworkDown } from "../index";
import { networkUp, networkDown } from "../actions";
const NOW = (new Date()).toJSON();
describe("dispatchNetworkUp", () => {
  it("calls redux directly", () => {
    jest.resetAllMocks();
    dispatchNetworkUp("bot.mqtt", NOW);
    expect(mockRedux.store.dispatch)
      .toHaveBeenLastCalledWith(networkUp("bot.mqtt", NOW));
  });
});

describe("dispatchNetworkDown", () => {
  it("calls redux directly", () => {
    jest.resetAllMocks();
    dispatchNetworkDown("user.api", NOW);
    expect(mockRedux.store.dispatch)
      .toHaveBeenLastCalledWith(networkDown("user.api", NOW));
  });
});
