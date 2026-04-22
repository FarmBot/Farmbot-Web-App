let mockPost = Promise.resolve();

import { fakeState } from "../../__test_support__/fake_state";
let mockState = fakeState();

import { fakeSequence } from "../../__test_support__/fake_state/resources";
import * as crud from "../../api/crud";
import { Actions } from "../../constants";
import * as activeSequenceByName from "../set_active_sequence_by_name";
import { TakePhoto, Wait } from "farmbot";
import axios from "axios";
import { API } from "../../api";
import { error, success } from "../../toast/toast";
import { Path } from "../../internal_urls";
import { urlFriendly } from "../../util";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { store } from "../../redux/store";

let initSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let overwriteSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;
let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;
let setActiveSequenceByNameSpy: jest.SpyInstance;
const sequenceActions = () =>
  jest.requireActual("../actions");

beforeEach(() => {
  jest.clearAllMocks();
  mockPost = Promise.resolve();
  mockState = fakeState();
  mockState.resources = buildResourceIndex([fakeDevice()], mockState.resources);
  API.setBaseUrl("http://localhost");
  originalGetState = store.getState;
  originalDispatch = store.dispatch;
  (store as unknown as { getState: () => typeof mockState }).getState =
    () => mockState;
  (store as unknown as { dispatch: jest.Mock }).dispatch = jest.fn();
  initSpy = jest.spyOn(crud, "init")
    .mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit")
    .mockImplementation(jest.fn());
  overwriteSpy = jest.spyOn(crud, "overwrite")
    .mockImplementation(jest.fn());
  axiosPostSpy = jest.spyOn(axios, "post")
    .mockImplementation(() => mockPost);
  setActiveSequenceByNameSpy = jest.spyOn(
    activeSequenceByName, "setActiveSequenceByName")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
    originalDispatch;
  initSpy.mockRestore();
  editSpy.mockRestore();
  overwriteSpy.mockRestore();
  axiosPostSpy.mockRestore();
  setActiveSequenceByNameSpy.mockRestore();
});

describe("sequenceActions().copySequence()", () => {
  it("copies sequence", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "wait", args: { milliseconds: 100 } }];
    const { body } = sequence.body;
    const navigate = jest.fn();
    sequenceActions().copySequence(navigate, sequence)(jest.fn(), fakeState);
    expect(crud.init).toHaveBeenCalledWith("Sequence",
      expect.objectContaining({ body }));
    const copiedName = (crud.init as jest.Mock).mock.calls[0]?.[1]?.name;
    expect(copiedName).toMatch(/^fake copy \d+$/);
  });

  it("updates current path", () => {
    const navigate = jest.fn();
    sequenceActions().copySequence(navigate, fakeSequence())(jest.fn(), fakeState);
    const copiedSequence =
      (crud.init as jest.Mock).mock.calls[0]?.[1] as { name?: unknown } | undefined;
    if (typeof copiedSequence?.name !== "string") {
      throw new Error("Expected copied sequence name to be a string.");
    }
    const copiedName = copiedSequence.name;
    expect(navigate).toHaveBeenCalledWith(Path.sequences(urlFriendly(copiedName)));
  });

  it("selects sequence", () => {
    const navigate = jest.fn();
    sequenceActions().copySequence(navigate, fakeSequence())(jest.fn(), fakeState);
    expect(activeSequenceByName.setActiveSequenceByName).toHaveBeenCalled();
  });

  it("exceeds limit", () => {
    const state = fakeState();
    const sequence = fakeSequence();
    const device = fakeDevice();
    device.body.max_sequence_count = 1;
    state.resources = buildResourceIndex([sequence, device]);
    const navigate = jest.fn();
    sequenceActions().copySequence(navigate, fakeSequence())(jest.fn(), () => state);
    expect(navigate).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "The maximum number of sequences allowed is 1."));
  });
});

describe("sequenceActions().editCurrentSequence()", () => {
  it("prepares update payload", () => {
    const fake = fakeSequence();
    sequenceActions().editCurrentSequence(jest.fn, fake, { color: "red" });
    expect(crud.edit).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: fake.uuid }),
      { color: "red" });
  });
});

describe("sequenceActions().selectSequence()", () => {
  it("prepares payload", () => {
    expect(sequenceActions().selectSequence("Sequence.fake.uuid")).toEqual({
      type: Actions.SELECT_SEQUENCE,
      payload: "Sequence.fake.uuid"
    });
  });
});

describe("sequenceActions().pushStep()", () => {
  const step = (n: number): Wait => ({ kind: "wait", args: { milliseconds: n } });
  const NEW_STEP: TakePhoto = { kind: "take_photo", args: {} };

  it("adds step at 2", () => {
    const sequence = fakeSequence();
    sequence.body.body = [
      step(1),
      step(2),
      step(3),
    ];
    sequenceActions().pushStep(NEW_STEP, jest.fn(), sequence, 2);
    expect(crud.overwrite).toHaveBeenCalledWith(sequence, expect.objectContaining({
      body: [
        step(1),
        step(2),
        NEW_STEP,
        step(3),
      ]
    }));
  });

  it("adds step at end", () => {
    const sequence = fakeSequence();
    sequence.body.body = [
      step(1),
      step(2),
      step(3),
    ];
    sequenceActions().pushStep(NEW_STEP, jest.fn(), sequence);
    expect(crud.overwrite).toHaveBeenCalledWith(sequence, expect.objectContaining({
      body: [
        step(1),
        step(2),
        step(3),
        NEW_STEP,
      ]
    }));
  });

  it("handles missing body", () => {
    const sequence = fakeSequence();
    sequence.body.body = undefined;
    sequenceActions().pushStep(NEW_STEP, jest.fn(), sequence);
    expect(crud.overwrite).toHaveBeenCalledWith(sequence,
      expect.objectContaining({ body: [NEW_STEP] }));
  });

  it("exceeds limit", () => {
    const sequence = fakeSequence({ body: [{ kind: "sync", args: {} }] });
    const device = fakeDevice();
    device.body.max_sequence_length = 1;
    mockState.resources = buildResourceIndex([sequence, device]);
    sequenceActions().pushStep(NEW_STEP, jest.fn(), sequence);
    expect(crud.overwrite).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "The maximum number of steps allowed in one sequence is 1."));
  });
});

describe("sequenceActions().pinSequenceToggle()", () => {
  it("pins sequence", () => {
    const sequence = fakeSequence();
    sequence.body.pinned = false;
    sequenceActions().pinSequenceToggle(sequence)(jest.fn());
    expect(crud.edit).toHaveBeenCalledWith(sequence, { pinned: true });
  });
});

describe("sequenceActions().publishSequence()", () => {
  API.setBaseUrl("http://localhost");

  it("publishes sequence", async () => {
    mockPost = Promise.resolve();
    await sequenceActions().publishSequence(123, "")();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost/api/sequences/123/publish", { copyright: "" });
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("errors while publishing sequence", async () => {
    mockPost = Promise.reject({ response: { data: "error" } });
    await sequenceActions().publishSequence(123, "")();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost/api/sequences/123/publish", { copyright: "" });
    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Error: error", { title: "Publish error" });
  });
});

describe("sequenceActions().unpublishSequence()", () => {
  API.setBaseUrl("http://localhost");

  it("unpublishes sequence", async () => {
    mockPost = Promise.resolve();
    await sequenceActions().unpublishSequence(123)();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost/api/sequences/123/unpublish");
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("errors while unpublishing sequence", async () => {
    mockPost = Promise.reject({ response: { data: "error" } });
    await sequenceActions().unpublishSequence(123)();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost/api/sequences/123/unpublish");
    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Error: error", { title: "Unpublish error" });
  });
});

describe("sequenceActions().installSequence()", () => {
  it("installs sequence", async () => {
    mockPost = Promise.resolve();
    await sequenceActions().installSequence(123)();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost/api/sequences/123/install");
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("errors while installing sequence", async () => {
    mockPost = Promise.reject({ response: { data: "error" } });
    await sequenceActions().installSequence(123)();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost/api/sequences/123/install");
    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Error: error", { title: "Install error" });
  });
});

describe("sequenceActions().upgradeSequence()", () => {
  API.setBaseUrl("http://localhost");

  it("upgrades sequence", async () => {
    mockPost = Promise.resolve();
    await sequenceActions().upgradeSequence(123, 1)();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost/api/sequences/123/upgrade/1");
    expect(success).toHaveBeenCalledWith("Sequence upgraded.");
    expect(error).not.toHaveBeenCalled();
  });

  it("errors while upgrading sequence", async () => {
    mockPost = Promise.reject({ response: { data: "error" } });
    await sequenceActions().upgradeSequence(123, 1)();
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost/api/sequences/123/upgrade/1");
    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Error: error", { title: "Upgrade error" });
  });
});
