let mockPost = Promise.resolve({ data: { id: 1 } });
jest.mock("axios", () => ({
  default: {
    get: () => Promise.resolve({
      data: {
        "id": 6,
        "name": "New Device From Server",
        "timezone": "America/Chicago",
        "last_saw_api": "2017-08-30T20:42:35.854Z"
      }
    }),
    post: () => mockPost,
  }
}));

import { refresh, initSaveGetId } from "../crud";
import { TaggedDevice, SpecialStatus } from "farmbot";
import { API } from "../index";
import { Actions } from "../../constants";
import { get } from "lodash";

describe("successful refresh()", () => {
  API.setBaseUrl("http://localhost:3000");

  // 1. Correct URL
  // 2. call to refreshOK
  // 3. Actually replaces resource.
  it("re-downloads an existing resource", (done) => {
    const device1: TaggedDevice = {
      "uuid": "Device.6.1",
      "kind": "Device",
      "specialStatus": SpecialStatus.SAVED,
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
    thunk(dispatch);

    setImmediate(() => {
      const { calls } = dispatch.mock;
      expect(calls.length).toBe(2);

      const first = calls[0][0];
      expect(first).toBeInstanceOf(Object);
      expect(get(first, "type", "TYPE WAS UNDEFINED"))
        .toEqual(Actions.REFRESH_RESOURCE_START);
      expect(get(first, "payload", "NO PAYLOAD!"))
        .toEqual(device1.uuid);

      const second = calls[1][0];
      expect(second).toBeInstanceOf(Object);
      expect(get(second, "type", "TYPE WAS UNDEFINED"))
        .toEqual(Actions.REFRESH_RESOURCE_OK);
      expect(get(second, "payload.body.name", "DID NOT FIND ANYTHING"))
        .toEqual("New Device From Server");
      done();
    });
  });
});

describe("initSaveGetId()", () => {
  it("returns id", async () => {
    const dispatch = jest.fn();
    const result = await initSaveGetId("SavedGarden", {})(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SAVE_RESOURCE_START,
      payload: expect.objectContaining({ kind: "SavedGarden" })
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.INIT_RESOURCE,
      payload: expect.objectContaining({ kind: "SavedGarden" })
    });
    await expect(result).toEqual(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SAVE_RESOURCE_OK,
      payload: expect.objectContaining({ kind: "SavedGarden" })
    });
  });

  it("catches errors", async () => {
    mockPost = Promise.reject("error");
    const dispatch = jest.fn();
    await initSaveGetId("SavedGarden", {})(dispatch).catch(() => { });
    await expect(dispatch).toHaveBeenLastCalledWith({
      type: Actions._RESOURCE_NO,
      payload: expect.objectContaining({ err: "error" })
    });
  });
});
