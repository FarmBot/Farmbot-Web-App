const mockDevice = { on: jest.fn(() => Promise.resolve()) };
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

import { refresh, updateViaAjax } from "../crud";
import axios from "axios";
import { SpecialStatus } from "farmbot";
import { API } from "../index";
import { get } from "lodash";
import { Actions } from "../../constants";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakePeripheral } from "../../__test_support__/fake_state/resources";

afterAll(() => {
  jest.unmock("../../device");
});
describe("refresh()", () => {
  API.setBaseUrl("http://localhost:3000");

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).get = jest.fn(() => Promise.resolve({ data: "" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).put = jest.fn(() => Promise.resolve({ data: "" }));
  });

  // 1. Enters the `catch` block.
  it("rejects malformed API data", async () => {
    const device = fakeDevice();
    const thunk = refresh(device);
    const dispatch = jest.fn();
    const { mock } = dispatch;
    console.error = jest.fn();
    await thunk(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(2);
    // Test call to refresh();
    const firstCall = mock.calls[0][0];
    const dispatchAction1 = get(firstCall, "type", "NO TYPE FOUND");
    expect(dispatchAction1).toBe(Actions.REFRESH_RESOURCE_START);
    const dispatchPayload1 = get(firstCall, "payload", "NO TYPE FOUND");
    expect(dispatchPayload1).toBe(device.uuid);
    const secondCall = mock.calls[1][0];
    const dispatchAction2 = get(secondCall, "type", "NO TYPE FOUND");
    expect(dispatchAction2).toEqual(Actions.REFRESH_RESOURCE_NO);
    const dispatchPayl = get(secondCall,
      "payload.err.message",
      "NO ERR MSG FOUND");
    expect(dispatchPayl).toEqual("Unable to refresh");
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Device"));
  });
});

describe("updateViaAjax()", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).put = jest.fn(() => Promise.resolve({ data: "" }));
  });

  it("rejects malformed API data", async () => {
    const payload = {
      uuid: "",
      statusBeforeError: SpecialStatus.DIRTY,
      dispatch: jest.fn(),
      index: buildResourceIndex([fakePeripheral()]).index
    };
    payload.uuid = Object.keys(payload.index.all)[0];
    console.error = jest.fn();
    await expect(updateViaAjax(payload)).rejects
      .toThrow("Just saved a malformed TR.");
    expect(console.error).toHaveBeenCalledTimes(1);
    expect((console.error as jest.Mock).mock.calls[0][0]).toContain("\"kind\":");
  });
});
