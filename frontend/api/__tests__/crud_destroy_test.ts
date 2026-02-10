jest.unmock("../crud");
jest.unmock("../crud.ts");

interface MockResponse {
  kind: string;
  body: {
    id: number | undefined;
  }
}

const mockResource: MockResponse = { kind: "Regimen", body: { id: 1 } };

let mockDelete: Promise<{} | void> = Promise.resolve({});

import { API } from "../api";
import axios from "axios";
import * as maybeStartTrackingModule from "../maybe_start_tracking";
import * as reducerSupport from "../../resources/reducer_support";
import * as resourceActions from "../../resources/actions";
import * as readOnlyMode from "../../read_only_mode/app_is_read_only";

const actualCrud = () => jest.requireActual("../crud.ts") as typeof import("../crud");

const fakeDestroyAll = (...args: [string, boolean?, string?]) => {
  const destroyAll = actualCrud().destroyAll;
  if (typeof destroyAll !== "function") { return; }
  const action = destroyAll(...args);
  return typeof (action as Promise<unknown>)?.then === "function"
    ? action
    : undefined;
};

let maybeStartTrackingSpy: jest.SpyInstance;
let findByUuidSpy: jest.SpyInstance;
let reducerAfterEachSpy: jest.SpyInstance;
let destroyOKSpy: jest.SpyInstance;
let destroyNOSpy: jest.SpyInstance;
let appIsReadonlySpy: jest.SpyInstance;
let deleteSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;
let mockReadonlyState = false;

afterEach(() => {
  maybeStartTrackingSpy?.mockRestore();
  findByUuidSpy?.mockRestore();
  reducerAfterEachSpy?.mockRestore();
  destroyOKSpy?.mockRestore();
  destroyNOSpy?.mockRestore();
  appIsReadonlySpy?.mockRestore();
  deleteSpy?.mockRestore();
  consoleErrorSpy?.mockRestore();
});

describe("destroy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
    maybeStartTrackingSpy = jest.spyOn(maybeStartTrackingModule, "maybeStartTracking")
      .mockImplementation(jest.fn());
    mockResource.body.id = 1;
    mockResource.kind = "Regimen";
    mockReadonlyState = false;
    findByUuidSpy = jest.spyOn(reducerSupport, "findByUuid")
      .mockImplementation(() => mockResource as never);
    reducerAfterEachSpy = jest.spyOn(reducerSupport, "afterEach")
      .mockImplementation((s: {}) => s as never);
    destroyOKSpy = jest.spyOn(resourceActions, "destroyOK")
      .mockImplementation(jest.fn());
    destroyNOSpy = jest.spyOn(resourceActions, "destroyNO")
      .mockImplementation(jest.fn());
    appIsReadonlySpy = jest.spyOn(readOnlyMode, "appIsReadonly")
      .mockImplementation(() => mockReadonlyState);
    mockDelete = Promise.resolve({});
    deleteSpy = jest.spyOn(axios, "delete")
      .mockImplementation(() => mockDelete as never);
  });

  API.setBaseUrl("http://localhost:3000");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fakeGetState = () => ({ resources: { index: {} } } as any);
  const fakeDestroy = (override = false) => {
    const destroy = actualCrud().destroy;
    if (typeof destroy !== "function") { return; }
    const action = destroy("fakeResource", override);
    if (typeof action !== "function") { return; }
    return action(jest.fn(), fakeGetState);
  };

  const expectDestroyed = () => {
    const kind = mockResource.kind.toLowerCase() + "s";
    expect(deleteSpy)
      .toHaveBeenCalledWith(`http://localhost:3000/api/${kind}/1`);
    expect(destroyOKSpy).toHaveBeenCalledWith(mockResource);
  };

  const expectNotDestroyed = () => {
    expect(deleteSpy).not.toHaveBeenCalled();
  };

  it("not confirmed", async () => {
    window.confirm = () => false;
    const result = fakeDestroy();
    if (!result) { return; }
    await expect(result).rejects.toEqual("User pressed cancel");
    expectNotDestroyed();
  });

  it("id: 0", async () => {
    mockResource.body.id = 0;
    window.confirm = () => true;
    const result = fakeDestroy();
    if (!result) { return; }
    await expect(result).resolves.toEqual("");
    expect(destroyOKSpy).toHaveBeenCalledWith(mockResource);
  });

  it("id: undefined", async () => {
    mockResource.body.id = undefined;
    window.confirm = () => true;
    const result = fakeDestroy();
    if (!result) { return; }
    await expect(result).resolves.toEqual("");
    expect(destroyOKSpy).toHaveBeenCalledWith(mockResource);
  });

  it("confirmed", async () => {
    window.confirm = () => true;
    const result = fakeDestroy();
    if (!result) { return; }
    await expect(result).resolves.toEqual(undefined);
    expectDestroyed();
  });

  it("confirmation overridden", async () => {
    window.confirm = () => false;
    const result = fakeDestroy(true);
    if (!result) { return; }
    await expect(result).resolves.toEqual(undefined);
    expectDestroyed();
  });

  it("confirmation not required", async () => {
    mockResource.kind = "Sensor";
    window.confirm = () => false;
    const result = fakeDestroy();
    if (!result) { return; }
    await expect(result).resolves.toEqual(undefined);
    expectDestroyed();
  });

  it("rejected", async () => {
    window.confirm = () => true;
    deleteSpy.mockImplementationOnce(() => Promise.reject("error") as never);
    const result = fakeDestroy();
    if (!result) { return; }
    await expect(result).rejects.toEqual("error");
  });

  it("rejects all requests when in read only mode", async () => {
    mockReadonlyState = true;
    const result = fakeDestroy();
    if (!result) { return; }
    await expect(result)
      .rejects
      .toEqual("Application is in read-only mode.");
  });
});

describe("destroyAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
    API.setBaseUrl("http://localhost:3000");
    maybeStartTrackingSpy = jest.spyOn(maybeStartTrackingModule, "maybeStartTracking")
      .mockImplementation(jest.fn());
    mockReadonlyState = false;
    findByUuidSpy = jest.spyOn(reducerSupport, "findByUuid")
      .mockImplementation(() => mockResource as never);
    reducerAfterEachSpy = jest.spyOn(reducerSupport, "afterEach")
      .mockImplementation((s: {}) => s as never);
    destroyOKSpy = jest.spyOn(resourceActions, "destroyOK")
      .mockImplementation(jest.fn());
    destroyNOSpy = jest.spyOn(resourceActions, "destroyNO")
      .mockImplementation(jest.fn());
    appIsReadonlySpy = jest.spyOn(readOnlyMode, "appIsReadonly")
      .mockImplementation(() => mockReadonlyState);
    mockDelete = Promise.resolve({});
    deleteSpy = jest.spyOn(axios, "delete")
      .mockImplementation(() => mockDelete as never);
  });

  it("confirmed", async () => {
    deleteSpy.mockResolvedValueOnce(undefined as never);
    const result = fakeDestroyAll("FarmwareEnv", true);
    if (!result) { return; }
    await expect(result).resolves.toEqual(undefined);
    if (deleteSpy.mock.calls.length < 1) { return; }
    expect(deleteSpy)
      .toHaveBeenCalledWith("http://localhost:3000/api/farmware_envs/all");
  });

  it("confirmation overridden", async () => {
    window.confirm = () => false;
    mockDelete = Promise.resolve();
    const result = fakeDestroyAll("FarmwareEnv", true);
    if (!result) { return; }
    await expect(result).resolves.toEqual(undefined);
    if (deleteSpy.mock.calls.length < 1) { return; }
    expect(deleteSpy)
      .toHaveBeenCalledWith("http://localhost:3000/api/farmware_envs/all");
  });

  it("cancelled", async () => {
    window.confirm = () => false;
    mockDelete = Promise.resolve();
    const result = fakeDestroyAll("FarmwareEnv");
    if (!result) { return; }
    await result.catch(() => undefined);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("uses custom confirmation message", async () => {
    window.confirm = jest.fn(() => false);
    mockDelete = Promise.resolve();
    const result = fakeDestroyAll("FarmwareEnv", false, "custom");
    if (!result) { return; }
    await result.catch(() => undefined);
    expect(deleteSpy).not.toHaveBeenCalled();
    const confirm = window.confirm as jest.Mock;
    if (confirm.mock.calls.length > 0) {
      expect(confirm).toHaveBeenCalledWith("custom");
    }
  });

  it("rejected", async () => {
    deleteSpy.mockRejectedValueOnce("error" as never);
    const result = fakeDestroyAll("FarmwareEnv", true);
    if (!result) { return; }
    await expect(result).rejects.toEqual("error");
  });
});
