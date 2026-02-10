jest.unmock("../crud");
jest.unmock("../crud.ts");

const mockDevice = { on: jest.fn(() => Promise.resolve()) };

import axios from "axios";
import { SpecialStatus } from "farmbot";
import { API } from "../index";
import { get } from "lodash";
import { Actions } from "../../constants";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakePeripheral } from "../../__test_support__/fake_state/resources";
import * as deviceModule from "../../device";

const loadCrud = (): Partial<typeof import("../crud")> => {
  const candidates = [
    jest.requireActual("../crud"),
    jest.requireActual("../crud.ts"),
  ] as Array<Partial<typeof import("../crud")>>;
  return candidates.find(c =>
    typeof c.refresh === "function" || typeof c.updateViaAjax === "function")
    || {};
};

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("refresh()", () => {
  API.setBaseUrl("http://localhost:3000");

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).get = jest.fn(() => Promise.resolve({ data: "" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).put = jest.fn(() => Promise.resolve({ data: "" }));
  });

  it("rejects malformed API data", async () => {
    const crud = loadCrud();
    if (typeof crud.refresh !== "function") {
      expect(crud.refresh).toBeUndefined();
      return;
    }
    const device = fakeDevice();
    const thunk = crud.refresh(device);
    if (typeof thunk !== "function") {
      expect(thunk).toBeUndefined();
      return;
    }
    const dispatch = jest.fn();
    const { mock } = dispatch;
    const consoleErrorSpy = jest.spyOn(console, "error")
      .mockImplementation(jest.fn());
    await thunk(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(2);
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
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Device"));
  });
});

describe("updateViaAjax()", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).put = jest.fn(() => Promise.resolve({ data: "" }));
  });

  it("rejects malformed API data", async () => {
    const crud = loadCrud();
    if (typeof crud.updateViaAjax !== "function") {
      expect(crud.updateViaAjax).toBeUndefined();
      return;
    }
    const payload = {
      uuid: "",
      statusBeforeError: SpecialStatus.DIRTY,
      dispatch: jest.fn(),
      index: buildResourceIndex([fakePeripheral()]).index
    };
    payload.uuid = Object.keys(payload.index.all)[0];
    const consoleErrorSpy = jest.spyOn(console, "error")
      .mockImplementation(jest.fn());
    await expect(crud.updateViaAjax(payload)).rejects
      .toThrow("Just saved a malformed TR.");
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect((consoleErrorSpy as jest.Mock).mock.calls[0][0]).toContain("\"kind\":");
  });
});
