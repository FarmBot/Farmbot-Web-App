import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { Actions } from "../../constants";
import { ReduxAction } from "../../redux/interfaces";
import { ResourceReady } from "../interfaces";
import { fakeDevice } from "../../__test_support__/resource_index_builder";

describe("Connectivity Reducer - RESOURCE_READY", () => {
  it("handles `undefined` status", () => {
    const action: ReduxAction<ResourceReady> = {
      type: Actions.RESOURCE_READY,
      payload: {
        name: "devices", data: [{
          ...fakeDevice().body,
          last_saw_mq: "Tue, 03 Oct 2017 09:00:00 -0500"
        }]
      }
    };
    const result = connectivityReducer(DEFAULT_STATE, action);
    expect(result["bot.mqtt"]).not.toBe(undefined);
  });
});
