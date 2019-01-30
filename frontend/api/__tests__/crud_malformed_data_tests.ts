const mockDevice = {
  on: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../device", () => ({
  getDevice: () => mockDevice
}));

jest.mock("axios", () => ({
  default: {
    get: () => { return Promise.resolve({ data: "" }); },
    put: () => { return Promise.resolve({ data: "" }); },
  }
}));

import { refresh, updateViaAjax } from "../crud";
import { TaggedDevice, SpecialStatus } from "farmbot";
import { API } from "../index";
import { get } from "lodash";
import { Actions } from "../../constants";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakePeripheral } from "../../__test_support__/fake_state/resources";

describe("refresh()", () => {
  API.setBaseUrl("http://localhost:3000");

  // 1. Enters the `catch` block.
  it("rejects malformed API data", (done) => {
    const device1: TaggedDevice = {
      "uuid": "Device.6.1",
      "kind": "Device",
      "specialStatus": "" as SpecialStatus,
      "body": {
        "id": 6,
        "name": "summer-pond-726",
        "timezone": "America/Chicago",
        "last_saw_api": "2017-08-30T20:42:35.854Z",
        "tz_offset_hrs": 0
      },
    };

    const thunk = refresh(device1);
    const dispatch = jest.fn();
    const { mock } = dispatch;
    thunk(dispatch);
    setImmediate(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      // Test call to refresh();
      const firstCall = mock.calls[0][0];
      const dispatchAction1 = get(firstCall, "type", "NO TYPE FOUND");
      expect(dispatchAction1).toBe(Actions.REFRESH_RESOURCE_START);
      const dispatchPayload1 = get(firstCall, "payload", "NO TYPE FOUND");
      expect(dispatchPayload1).toBe(device1.uuid);
      const secondCall = mock.calls[1][0];
      const dispatchAction2 = get(secondCall, "type", "NO TYPE FOUND");
      expect(dispatchAction2).toEqual(Actions.REFRESH_RESOURCE_NO);
      const dispatchPayl = get(secondCall,
        "payload.err.message",
        "NO ERR MSG FOUND");
      expect(dispatchPayl).toEqual("Unable to refresh");
      done();
    });
  });
});

describe("updateViaAjax()", () => {
  it("rejects malformed API data", () => {
    const payload = {
      uuid: "",
      statusBeforeError: SpecialStatus.DIRTY,
      dispatch: jest.fn(),
      index: buildResourceIndex([fakePeripheral()]).index
    };
    payload.uuid = Object.keys(payload.index.all)[0];
    updateViaAjax(payload).catch(e => {
      expect("" + e).toEqual("Error: Just saved a malformed TR.");
    });
  });
});
