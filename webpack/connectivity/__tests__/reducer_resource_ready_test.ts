import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { resourceReady } from "../../sync/actions";

describe("Connectivity Reducer - RESOURCE_READY", () => {
  it("handles `undefined` status", () => {
    const device = fakeDevice();
    device.body.last_saw_mq = "Tue, 03 Oct 2017 09:00:00 -0500";
    const action = resourceReady("Device", device);
    const result = connectivityReducer(DEFAULT_STATE, action);
    expect(result["bot.mqtt"]).not.toBe(undefined);
  });
});
