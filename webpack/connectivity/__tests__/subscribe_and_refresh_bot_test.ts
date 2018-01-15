const mockDevice: Partial<Farmbot> = {
  readStatus: jest.fn(() => Promise.resolve({}))
};
jest.mock("../../device", () => {
  return {
    maybeGetDevice: jest.fn(() => mockDevice)
  };
});
import { Store } from "redux";
import { maybeGetDevice } from "../../device";
import { subscribeAndRefreshBot, PartialState } from "../subscribe_and_refresh_bot";
import { NetworkState } from "../interfaces";
import { Farmbot } from "farmbot";

describe("startRefetcher", () => {
  class StubStore implements Store<PartialState> {
    /** Not relevant: */
    dispatch() { }
    replaceReducer() { }

    /** Stubs */
    subscribe = (cb: () => void) => {
      this.subscribers.push(cb);
      return () => { };
    }
    getState = () => { return this.state; };

    /** Helpers */
    private state: PartialState =
      { bot: { connectivity: { ["user.mqtt"]: undefined } } };
    private subscribers: (() => void)[] = [];

    simulateNetworkChange(status?: NetworkState) {
      this.state.bot.connectivity["user.mqtt"] = status ?
        { state: status, at: "---" } : undefined;
      this.subscribers.map(x => x());
    }
  }
  it("detects network edge changes", () => {
    const fakeStore = new StubStore();
    subscribeAndRefreshBot(fakeStore);
    fakeStore.simulateNetworkChange(undefined);
    expect(maybeGetDevice).toHaveBeenCalled();
    expect(mockDevice.readStatus).not.toHaveBeenCalled();
    fakeStore.simulateNetworkChange("up");
    expect(mockDevice.readStatus).toHaveBeenCalled();
    jest.clearAllMocks();
    fakeStore.simulateNetworkChange("up");
    expect(mockDevice.readStatus).not.toHaveBeenCalled();
    fakeStore.simulateNetworkChange("down");
    expect(mockDevice.readStatus).toHaveBeenCalled();
  });
});
