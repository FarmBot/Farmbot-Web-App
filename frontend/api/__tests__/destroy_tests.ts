interface MockRespone {
  kind: string;
  body: {
    id: number | undefined;
  }
}

const mockResource: MockRespone = { kind: "Regimen", body: { id: 1 } };

let mockDelete: Promise<{} | void> = Promise.resolve({});

jest.mock("../../resources/reducer_support", () => ({
  findByUuid: () => (mockResource),
  afterEach: (s: {}) => s
}));

jest.mock("../../resources/actions", () => ({
  destroyOK: jest.fn(),
  destroyNO: jest.fn()
}));

jest.mock("../maybe_start_tracking", () => ({
  maybeStartTracking: jest.fn()
}));

jest.mock("axios", () => ({
  delete: jest.fn(() => mockDelete)
}));

let mockReadonlyState = false;
jest.mock("../../read_only_mode/app_is_read_only", () => ({
  appIsReadonly: jest.fn(() => mockReadonlyState)
}));

import { destroy, destroyAll } from "../crud";
import { API } from "../api";
import axios from "axios";
import { destroyOK, destroyNO } from "../../resources/actions";

describe("destroy", () => {
  beforeEach(() => {
    mockResource.body.id = 1;
    mockResource.kind = "Regimen";
    mockReadonlyState = false;
  });

  API.setBaseUrl("http://localhost:3000");
  // tslint:disable-next-line:no-any
  const fakeGetState = () => ({ resources: { index: {} } } as any);
  const fakeDestroy = () => destroy("fakeResource")(jest.fn(), fakeGetState);

  const expectDestroyed = () => {
    const kind = mockResource.kind.toLowerCase() + "s";
    expect(axios.delete)
      .toHaveBeenCalledWith(`http://localhost:3000/api/${kind}/1`);
    expect(destroyOK).toHaveBeenCalledWith(mockResource);
  };

  const expectNotDestroyed = () => {
    expect(axios.delete).not.toHaveBeenCalled();
  };

  it("not confirmed", () => {
    window.confirm = () => false;
    expect(fakeDestroy()).rejects.toEqual("User pressed cancel");
    expectNotDestroyed();
  });

  it("id: 0", () => {
    mockResource.body.id = 0;
    window.confirm = () => true;
    expect(fakeDestroy()).resolves.toEqual("");
    expect(destroyOK).toHaveBeenCalledWith(mockResource);
  });

  it("id: undefined", () => {
    mockResource.body.id = undefined;
    window.confirm = () => true;
    expect(fakeDestroy()).resolves.toEqual("");
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
      destroy("fakeResource", true)(jest.fn(), fakeGetState);
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
  it("confirmed", async () => {
    window.confirm = () => true;
    mockDelete = Promise.resolve();
    await expect(destroyAll("FarmwareEnv")).resolves.toEqual(undefined);
    expect(axios.delete)
      .toHaveBeenCalledWith("http://localhost:3000/api/farmware_envs/all");
  });

  it("confirmation overridden", async () => {
    window.confirm = () => false;
    mockDelete = Promise.resolve();
    await expect(destroyAll("FarmwareEnv", true)).resolves.toEqual(undefined);
    expect(axios.delete)
      .toHaveBeenCalledWith("http://localhost:3000/api/farmware_envs/all");
  });

  it("cancelled", async () => {
    window.confirm = () => false;
    mockDelete = Promise.resolve();
    await expect(destroyAll("FarmwareEnv"))
      .rejects.toEqual("User pressed cancel");
    expect(axios.delete).not.toHaveBeenCalled();
  });

  it("rejected", async () => {
    window.confirm = () => true;
    mockDelete = Promise.reject("error");
    await expect(destroyAll("FarmwareEnv")).rejects.toEqual("error");
    expect(axios.delete)
      .toHaveBeenCalledWith("http://localhost:3000/api/farmware_envs/all");
  });
});
