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
import { destroyOK, destroyNO } from "../../resources/actions";
import * as maybeStartTrackingModule from "../maybe_start_tracking";
import * as reducerSupport from "../../resources/reducer_support";
import * as resourceActions from "../../resources/actions";
import * as readOnlyMode from "../../read_only_mode/app_is_read_only";

let mockAxiosDelete = jest.fn(() => mockDelete);
let maybeStartTrackingSpy: jest.SpyInstance;
let findByUuidSpy: jest.SpyInstance;
let reducerAfterEachSpy: jest.SpyInstance;
let destroyOKSpy: jest.SpyInstance;
let destroyNOSpy: jest.SpyInstance;
let appIsReadonlySpy: jest.SpyInstance;
let mockReadonlyState = false;
const actualCrud = () => jest.requireActual("../crud");

afterEach(() => {
  maybeStartTrackingSpy?.mockRestore();
  findByUuidSpy?.mockRestore();
  reducerAfterEachSpy?.mockRestore();
  destroyOKSpy?.mockRestore();
  destroyNOSpy?.mockRestore();
  appIsReadonlySpy?.mockRestore();
});

describe("destroy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    mockAxiosDelete = jest.fn(() => mockDelete);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).delete = mockAxiosDelete;
  });

  API.setBaseUrl("http://localhost:3000");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fakeGetState = () => ({ resources: { index: {} } } as any);
  const fakeDestroy = () => actualCrud().destroy("fakeResource")(jest.fn(), fakeGetState);

  const expectDestroyed = () => {
    const kind = mockResource.kind.toLowerCase() + "s";
    expect(mockAxiosDelete)
      .toHaveBeenCalledWith(`http://localhost:3000/api/${kind}/1`);
    expect(destroyOK).toHaveBeenCalledWith(mockResource);
  };

  const expectNotDestroyed = () => {
    expect(mockAxiosDelete).not.toHaveBeenCalled();
  };

  it("not confirmed", async () => {
    window.confirm = () => false;
    await expect(fakeDestroy()).rejects.toEqual("User pressed cancel");
    expectNotDestroyed();
  });

  it("id: 0", async () => {
    mockResource.body.id = 0;
    window.confirm = () => true;
    await expect(fakeDestroy()).resolves.toEqual("");
    expect(destroyOK).toHaveBeenCalledWith(mockResource);
  });

  it("id: undefined", async () => {
    mockResource.body.id = undefined;
    window.confirm = () => true;
    await expect(fakeDestroy()).resolves.toEqual("");
    expect(destroyOK).toHaveBeenCalledWith(mockResource);
  });

  it("confirmed", async () => {
    window.confirm = () => true;
    await expect(fakeDestroy()).resolves.toEqual(undefined);
    expectDestroyed();
  });

  it("confirmation overridden", async () => {
    window.confirm = () => false;
    const forceDestroy = () =>
      actualCrud().destroy("fakeResource", true)(jest.fn(), fakeGetState);
    await expect(forceDestroy()).resolves.toEqual(undefined);
    expectDestroyed();
  });

  it("confirmation not required", async () => {
    mockResource.kind = "Sensor";
    window.confirm = () => false;
    await expect(fakeDestroy()).resolves.toEqual(undefined);
    expectDestroyed();
  });

  it("rejected", async () => {
    window.confirm = () => true;
    mockDelete = Promise.reject("error");
    await expect(fakeDestroy()).rejects.toEqual("error");
    expect(destroyNO).toHaveBeenCalledWith({
      err: "error",
      statusBeforeError: undefined,
      uuid: "fakeResource"
    });
  });

  it("rejects all requests when in read only mode", async () => {
    mockReadonlyState = true;
    await expect(fakeDestroy())
      .rejects
      .toEqual("Application is in read-only mode.");
  });
});

describe("destroyAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    mockAxiosDelete = jest.fn(() => mockDelete);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).delete = mockAxiosDelete;
  });

  it("confirmed", async () => {
    window.confirm = jest.fn(() => true);
    mockDelete = Promise.resolve();
    await expect(actualCrud().destroyAll("FarmwareEnv")).resolves.toEqual(undefined);
    expect(mockAxiosDelete)
      .toHaveBeenCalledWith("http://localhost:3000/api/farmware_envs/all");
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete all items?");
  });

  it("confirmation overridden", async () => {
    window.confirm = () => false;
    mockDelete = Promise.resolve();
    await expect(actualCrud().destroyAll("FarmwareEnv", true)).resolves.toEqual(undefined);
    expect(mockAxiosDelete)
      .toHaveBeenCalledWith("http://localhost:3000/api/farmware_envs/all");
  });

  it("cancelled", async () => {
    window.confirm = () => false;
    mockDelete = Promise.resolve();
    await expect(actualCrud().destroyAll("FarmwareEnv"))
      .rejects.toEqual("User pressed cancel");
    expect(mockAxiosDelete).not.toHaveBeenCalled();
  });

  it("uses custom confirmation message", async () => {
    window.confirm = jest.fn(() => false);
    mockDelete = Promise.resolve();
    await expect(actualCrud().destroyAll("FarmwareEnv", false, "custom"))
      .rejects.toEqual("User pressed cancel");
    expect(mockAxiosDelete).not.toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith("custom");
  });

  it("rejected", async () => {
    window.confirm = () => true;
    mockDelete = Promise.reject("error");
    await expect(actualCrud().destroyAll("FarmwareEnv")).rejects.toEqual("error");
    expect(mockAxiosDelete)
      .toHaveBeenCalledWith("http://localhost:3000/api/farmware_envs/all");
  });
});
