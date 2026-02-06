const mockStepGetResult = {
  value: { kind: "execute", args: { sequence_id: 1 } },
  resourceUuid: "",
};

let mockExceeded = false;

import {
  setFolderColor,
  setFolderName,
  addNewSequenceToFolder,
  createFolder,
  deleteFolder,
  updateSearchTerm,
  toggleFolderOpenState,
  toggleFolderEditState,
  toggleAll,
  moveSequence,
  dropSequence,
  sequenceEditMaybeSave,
} from "../actions";
import { store } from "../../redux/store";
import { DeepPartial } from "../../redux/interfaces";
import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { newTaggedResource } from "../../sync/actions";
import { save, edit, init, initSave, destroy } from "../../api/crud";
import {
  setActiveSequenceByName,
} from "../../sequences/set_active_sequence_by_name";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { stepGet } from "../../draggable/actions";
import { SpecialStatus } from "farmbot";
import { dragEvent } from "../../__test_support__/fake_html_events";
import { mockFolders } from "../test_fixtures";
import { Path } from "../../internal_urls";
import * as sequenceActions from "../../sequences/actions";
import * as crudModule from "../../api/crud";
import * as setActiveSequenceModule from "../../sequences/set_active_sequence_by_name";
import * as draggableActions from "../../draggable/actions";

const mockSequence = fakeSequence();
const i = buildResourceIndex(newTaggedResource("Folder", mockFolders));

const mockState: DeepPartial<Everything> = ({
  resources: buildResourceIndex([mockSequence], i),
});

let sequenceLimitExceededSpy: jest.SpyInstance;
let stepGetSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let initSpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let setActiveSequenceByNameSpy: jest.SpyInstance;
let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;

beforeEach(() => {
  mockExceeded = false;
  originalGetState = store.getState;
  originalDispatch = store.dispatch;
  (store as unknown as { getState: () => DeepPartial<Everything> }).getState =
    () => mockState;
  (store as unknown as { dispatch: jest.Mock }).dispatch =
    jest.fn(value => typeof value === "function"
      ? value(store.dispatch, store.getState)
      : value);
  stepGetSpy = jest.spyOn(draggableActions, "stepGet")
    .mockImplementation(() => () => mockStepGetResult);
  destroySpy = jest.spyOn(crudModule, "destroy").mockImplementation(jest.fn());
  editSpy = jest.spyOn(crudModule, "edit").mockImplementation(jest.fn());
  initSpy = jest.spyOn(crudModule, "init").mockImplementation(jest.fn());
  initSaveSpy = jest.spyOn(crudModule, "initSave")
    .mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crudModule, "save").mockImplementation(jest.fn());
  setActiveSequenceByNameSpy =
    jest.spyOn(setActiveSequenceModule, "setActiveSequenceByName")
      .mockImplementation(jest.fn());
  sequenceLimitExceededSpy = jest.spyOn(sequenceActions, "sequenceLimitExceeded")
    .mockImplementation(() => mockExceeded);
});

afterEach(() => {
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
    originalDispatch;
  stepGetSpy.mockRestore();
  destroySpy.mockRestore();
  editSpy.mockRestore();
  initSpy.mockRestore();
  initSaveSpy.mockRestore();
  saveSpy.mockRestore();
  setActiveSequenceByNameSpy.mockRestore();
  sequenceLimitExceededSpy.mockRestore();
});

describe("setFolderColor", () => {
  it("updates a folder's color", () => {
    setFolderColor(11, "blue");
    const uuid = expect.stringContaining("Folder.11.");
    const body = expect.objectContaining({ color: "blue" });
    const resource = expect.objectContaining({ uuid, body });
    expect(store.dispatch).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(uuid);
    expect(edit).toHaveBeenCalledWith(resource, body);
  });
});

describe("setFolderName", () => {
  it("updates a folder's name", () => {
    setFolderName(11, "Harold");
    const uuid = expect.stringContaining("Folder.11.");
    const body = expect.objectContaining({ name: "Harold" });
    const resource = expect.objectContaining({ uuid });

    expect(store.dispatch).toHaveBeenCalled();
    expect(edit).toHaveBeenCalledWith(resource, body);
    expect(save).toHaveBeenCalledWith(uuid);
  });
});

describe("addNewSequenceToFolder", () => {
  it("adds a new sequence", () => {
    const navigate = jest.fn();
    addNewSequenceToFolder(navigate);
    expect(setActiveSequenceByName).toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Sequence", expect.objectContaining({
      name: "New Sequence 1",
      color: "gray",
      folder_id: undefined,
    }));
    expect(navigate).toHaveBeenCalledWith(Path.sequences("New_Sequence_1"));
  });

  it("adds a new sequence to a folder", () => {
    const navigate = jest.fn();
    addNewSequenceToFolder(navigate, { id: 11 });
    expect(setActiveSequenceByName).toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Sequence", expect.objectContaining({
      name: "New Sequence 1",
      color: "gray",
      folder_id: 11,
    }));
    expect(navigate).toHaveBeenCalledWith(Path.sequences("New_Sequence_1"));
  });

  it("adds a new sequence to a folder with a color", () => {
    const navigate = jest.fn();
    addNewSequenceToFolder(navigate, { id: 11, color: "blue" });
    expect(setActiveSequenceByName).toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Sequence", expect.objectContaining({
      name: "New Sequence 1",
      color: "blue",
      folder_id: 11,
    }));
    expect(navigate).toHaveBeenCalledWith(Path.sequences("New_Sequence_1"));
  });

  it("exceeds limit", () => {
    mockExceeded = true;
    const navigate = jest.fn();
    addNewSequenceToFolder(navigate);
    expect(init).not.toHaveBeenCalled();
  });
});

describe("createFolder", () => {
  it("saves a new folder", () => {
    createFolder({ name: "test case 1" });
    expect(store.dispatch).toHaveReturnedTimes(1);
    expect(initSave).toHaveBeenCalledWith("Folder", {
      color: "gray",
      name: "test case 1",
      parent_id: 0
    });
  });

  it("saves a new folder without inputs", () => {
    createFolder();
    expect(store.dispatch).toHaveReturnedTimes(1);
    expect(initSave).toHaveBeenCalledWith("Folder", {
      color: "gray",
      name: "New Folder",
      parent_id: 0
    });
  });
});

describe("deleteFolder", () => {
  it("deletes a folder", () => {
    const uuid = expect.stringContaining("Folder.12.");
    deleteFolder(12);
    expect(store.dispatch).toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledWith(uuid);
  });
});

describe("updateSearchTerm", () => {
  it("updates a search term", () => {
    const args =
      (payload: string | undefined) => ({ type: "FOLDER_SEARCH", payload });
    [undefined, "foo"].map(term => {
      updateSearchTerm(term);
      expect(store.dispatch).toHaveBeenCalledWith(args(term));
    });
  });
});

describe("toggleFolderOpenState", () => {
  it("dispatches the correct action", () => {
    const id = 12;
    toggleFolderOpenState(id);
    expect(store.dispatch)
      .toHaveBeenCalledWith({ type: "FOLDER_TOGGLE", payload: { id } });
  });
});

describe("toggleFolderEditState", () => {
  it("dispatches the correct action", () => {
    const id = 12;
    toggleFolderEditState(id);
    expect(store.dispatch)
      .toHaveBeenCalledWith({ type: "FOLDER_TOGGLE_EDIT", payload: { id } });
  });
});

describe("toggleAll", () => {
  it("toggles all folders", () => {
    [true, false].map(payload => {
      toggleAll(payload);
      expect(store.dispatch)
        .toHaveBeenCalledWith({ type: "FOLDER_TOGGLE_ALL", payload });
    });
  });
});

describe("sequenceEditMaybeSave()", () => {
  it("saves", () => {
    const sequence = fakeSequence();
    sequence.specialStatus = SpecialStatus.SAVED;
    sequenceEditMaybeSave(sequence, {});
    expect(edit).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(sequence.uuid);
  });

  it("doesn't save", () => {
    const sequence = fakeSequence();
    sequence.specialStatus = SpecialStatus.DIRTY;
    sequenceEditMaybeSave(sequence, {});
    expect(edit).toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});

describe("moveSequence", () => {
  it("silently fails when given bad UUIDs", () => {
    const uuid = "a.b.c";
    moveSequence(uuid, 123);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("moves a sequence", () => {
    const uuid = mockSequence.uuid;
    moveSequence(uuid, 12);
    expect(store.dispatch).toHaveBeenCalled();
    const update1 = expect.objectContaining({ uuid });
    const update2 = expect.objectContaining({ folder_id: 12 });
    expect(edit).toHaveBeenCalledWith(update1, update2);
    expect(save).toHaveBeenCalledWith(uuid);
  });
});

describe("dropSequence()", () => {
  beforeEach(() => {
    mockStepGetResult.value.args.sequence_id = mockSequence.body.id;
    mockStepGetResult.resourceUuid = "";
  });

  it("updates folder_id", () => {
    dropSequence(1)(dragEvent("fakeKey"));
    expect(stepGet).toHaveBeenCalledWith("fakeKey");
    expect(edit).toHaveBeenCalledWith(mockSequence, { folder_id: 1 });
  });

  it("handles missing sequence", () => {
    mockStepGetResult.value.args.sequence_id = -1;
    dropSequence(1)(dragEvent("fakeKey"));
    expect(stepGet).toHaveBeenCalledWith("fakeKey");
    expect(edit).not.toHaveBeenCalled();
  });

  it("gets sequence by UUID", () => {
    mockStepGetResult.value.args.sequence_id = -1;
    mockStepGetResult.resourceUuid = mockSequence.uuid;
    dropSequence(1)(dragEvent("fakeKey"));
    expect(stepGet).toHaveBeenCalledWith("fakeKey");
    expect(edit).toHaveBeenCalledWith(mockSequence, { folder_id: 1 });
  });
});
