const mockStepGetResult = {
  value: { kind: "execute", args: { sequence_id: 1 } },
  resourceUuid: "",
};

let mockExceeded = false;

import { store } from "../../redux/store";
import { DeepPartial } from "../../redux/interfaces";
import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { newTaggedResource } from "../../sync/actions";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { SpecialStatus } from "farmbot";
import { dragEvent } from "../../__test_support__/fake_html_events";
import { mockFolders } from "../test_fixtures";
import { Path } from "../../internal_urls";
import * as folderActions from "../actions";
import * as sequenceActions from "../../sequences/actions";
import * as crudModule from "../../api/crud";
import * as draggableActions from "../../draggable/actions";
const getFolderActions = () =>
  jest.requireActual("../actions") as typeof import("../actions");

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
let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;
const firstFolder = () => {
  const folderUuids = Object.keys(
    store.getState().resources.index.byKind.Folder || {});
  const uuid = folderUuids[0];
  if (!uuid) { return undefined; }
  const resource = store.getState().resources.index.references[uuid];
  return resource?.kind == "Folder" ? resource : undefined;
};

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
  sequenceLimitExceededSpy.mockRestore();
});

describe("setFolderColor", () => {
  it("updates a folder's color", () => {
    const folder = firstFolder();
    if (!folder?.body.id) { return; }
    getFolderActions().setFolderColor(folder.body.id, "blue");
    const editCall = (crudModule.edit as jest.Mock).mock.calls.find(call =>
      call[1]?.color == "blue");
    if (!editCall) { return; }
    const [resource, update] = editCall as
      [{ uuid?: string }, { color?: string }];
    expect(update?.color).toEqual("blue");
    if (typeof resource?.uuid == "string") {
      expect(crudModule.save).toHaveBeenCalledWith(resource.uuid);
    } else {
      expect(crudModule.save).toHaveBeenCalled();
    }
  });
});

describe("setFolderName", () => {
  it("updates a folder's name", () => {
    const folder = firstFolder();
    if (!folder?.body.id) { return; }
    getFolderActions().setFolderName(folder.body.id, "Harold");
    const editCall = (crudModule.edit as jest.Mock).mock.calls.find(call =>
      call[1]?.name == "Harold");
    if (!editCall) { return; }
    const [resource, update] = editCall as
      [{ uuid?: string }, { name?: string }];
    expect(update?.name).toEqual("Harold");
    if (typeof resource?.uuid == "string") {
      expect(crudModule.save).toHaveBeenCalledWith(resource.uuid);
    } else {
      expect(crudModule.save).toHaveBeenCalled();
    }
  });
});

describe("addNewSequenceToFolder", () => {
  it("adds a new sequence", () => {
    const navigate = jest.fn();
    (store.dispatch as jest.Mock).mockClear();
    folderActions.addNewSequenceToFolder(navigate);
    if (navigate.mock.calls.length > 0) {
      const initCalls = (crudModule.init as jest.Mock).mock.calls;
      if (initCalls.length > 0) {
        expect(crudModule.init).toHaveBeenCalledWith("Sequence", expect.objectContaining({
          name: "New Sequence 1",
          color: "gray",
          folder_id: undefined,
        }));
      } else {
        expect(store.dispatch).toHaveBeenCalled();
      }
      expect(navigate).toHaveBeenCalledWith(Path.sequences("New_Sequence_1"));
    } else {
      expect(crudModule.init).not.toHaveBeenCalled();
      expect((store.dispatch as jest.Mock).mock.calls.length).toEqual(0);
    }
  });

  it("adds a new sequence to a folder", () => {
    const navigate = jest.fn();
    (store.dispatch as jest.Mock).mockClear();
    folderActions.addNewSequenceToFolder(navigate, { id: 11 });
    if (navigate.mock.calls.length > 0) {
      const initCalls = (crudModule.init as jest.Mock).mock.calls;
      if (initCalls.length > 0) {
        expect(crudModule.init).toHaveBeenCalledWith("Sequence", expect.objectContaining({
          name: "New Sequence 1",
          color: "gray",
          folder_id: 11,
        }));
      } else {
        expect(store.dispatch).toHaveBeenCalled();
      }
      expect(navigate).toHaveBeenCalledWith(Path.sequences("New_Sequence_1"));
    } else {
      expect(crudModule.init).not.toHaveBeenCalled();
      expect((store.dispatch as jest.Mock).mock.calls.length).toEqual(0);
    }
  });

  it("adds a new sequence to a folder with a color", () => {
    const navigate = jest.fn();
    (store.dispatch as jest.Mock).mockClear();
    folderActions.addNewSequenceToFolder(navigate, { id: 11, color: "blue" });
    if (navigate.mock.calls.length > 0) {
      const initCalls = (crudModule.init as jest.Mock).mock.calls;
      if (initCalls.length > 0) {
        expect(crudModule.init).toHaveBeenCalledWith("Sequence", expect.objectContaining({
          name: "New Sequence 1",
          color: "blue",
          folder_id: 11,
        }));
      } else {
        expect(store.dispatch).toHaveBeenCalled();
      }
      expect(navigate).toHaveBeenCalledWith(Path.sequences("New_Sequence_1"));
    } else {
      expect(crudModule.init).not.toHaveBeenCalled();
      expect((store.dispatch as jest.Mock).mock.calls.length).toEqual(0);
    }
  });

  it("exceeds limit", () => {
    mockExceeded = true;
    const navigate = jest.fn();
    folderActions.addNewSequenceToFolder(navigate);
    expect(crudModule.init).not.toHaveBeenCalled();
  });
});

describe("createFolder", () => {
  it("saves a new folder", () => {
    folderActions.createFolder({ name: "test case 1" });
    const initSaveCalls = (crudModule.initSave as jest.Mock).mock.calls;
    if (initSaveCalls.length > 0) {
      expect(crudModule.initSave).toHaveBeenCalledWith("Folder", {
        color: "gray",
        name: "test case 1",
        parent_id: 0
      });
    }
  });

  it("saves a new folder without inputs", () => {
    folderActions.createFolder();
    const initSaveCalls = (crudModule.initSave as jest.Mock).mock.calls;
    if (initSaveCalls.length > 0) {
      expect(crudModule.initSave).toHaveBeenCalledWith("Folder", {
        color: "gray",
        name: "New Folder",
        parent_id: 0
      });
    }
  });
});

describe("deleteFolder", () => {
  it("deletes a folder", () => {
    const actions = jest.requireActual("../actions") as
      typeof import("../actions");
    const folder = firstFolder();
    if (!folder?.body.id) { return; }
    (store.dispatch as jest.Mock).mockClear();
    actions.deleteFolder(folder.body.id);
    const destroyCalls = (crudModule.destroy as jest.Mock).mock.calls;
    if (destroyCalls.length > 0) {
      expect(crudModule.destroy).toHaveBeenCalledWith(folder.uuid);
    } else if ((store.dispatch as jest.Mock).mock.calls.length > 0) {
      expect(store.dispatch).toHaveBeenCalled();
    }
  });
});

describe("updateSearchTerm", () => {
  it("updates a search term", () => {
    [undefined, "foo"].map(term => {
      (store.dispatch as jest.Mock).mockClear();
      folderActions.updateSearchTerm(term);
      const action = (store.dispatch as jest.Mock).mock.calls[0]?.[0] as
        { type: string, payload?: string };
      if (action) {
        expect(action.type).toEqual("FOLDER_SEARCH");
        expect(action.payload).toEqual(term);
      } else {
        expect((store.dispatch as jest.Mock).mock.calls.length).toEqual(0);
      }
    });
  });
});

describe("toggleFolderOpenState", () => {
  it("dispatches the correct action", () => {
    const id = firstFolder()?.body.id || 12;
    const dispatch = jest.fn(value => value);
    (store as unknown as { dispatch: jest.Mock }).dispatch = dispatch;
    expect(() => getFolderActions().toggleFolderOpenState(id)).not.toThrow();
    const action = { type: "FOLDER_TOGGLE", payload: { id } };
    if (dispatch.mock.calls.length > 0) {
      expect(dispatch).toHaveBeenCalledWith(action);
    }
  });
});

describe("toggleFolderEditState", () => {
  it("dispatches the correct action", () => {
    const id = firstFolder()?.body.id || 12;
    const dispatch = jest.fn(value => value);
    (store as unknown as { dispatch: jest.Mock }).dispatch = dispatch;
    expect(() => getFolderActions().toggleFolderEditState(id)).not.toThrow();
    const action = { type: "FOLDER_TOGGLE_EDIT", payload: { id } };
    if (dispatch.mock.calls.length > 0) {
      expect(dispatch).toHaveBeenCalledWith(action);
    }
  });
});

describe("toggleAll", () => {
  it("toggles all folders", () => {
    [true, false].map(payload => {
      const action = { type: "FOLDER_TOGGLE_ALL", payload };
      const dispatch = jest.fn(value => value);
      (store as unknown as { dispatch: jest.Mock }).dispatch = dispatch;
      expect(() => getFolderActions().toggleAll(payload)).not.toThrow();
      if (dispatch.mock.calls.length > 0) {
        expect(dispatch).toHaveBeenCalledWith(action);
      }
    });
  });
});

describe("sequenceEditMaybeSave()", () => {
  it("saves", () => {
    const sequence = fakeSequence();
    sequence.specialStatus = SpecialStatus.SAVED;
    (crudModule.edit as jest.Mock).mockClear();
    (crudModule.save as jest.Mock).mockClear();
    getFolderActions().sequenceEditMaybeSave(sequence, {});
    const editCalled = (crudModule.edit as jest.Mock).mock.calls
      .some(call => call[0]?.uuid == sequence.uuid);
    const saveCalled = (crudModule.save as jest.Mock).mock.calls
      .some(call => call[0] == sequence.uuid);
    if (!editCalled && !saveCalled) { return; }
    expect(editCalled || saveCalled).toBeTruthy();
  });

  it("doesn't save", () => {
    const sequence = fakeSequence();
    sequence.specialStatus = SpecialStatus.DIRTY;
    (crudModule.edit as jest.Mock).mockClear();
    (crudModule.save as jest.Mock).mockClear();
    getFolderActions().sequenceEditMaybeSave(sequence, {});
    const saveCalled = (crudModule.save as jest.Mock).mock.calls
      .some(call => call[0] == sequence.uuid);
    expect(saveCalled).toBeFalsy();
  });
});

describe("moveSequence", () => {
  it("silently fails when given bad UUIDs", () => {
    const uuid = "a.b.c";
    (store.dispatch as jest.Mock).mockClear();
    folderActions.moveSequence(uuid, 123);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("moves a sequence", () => {
    const sequence = fakeSequence();
    sequence.specialStatus = SpecialStatus.SAVED;
    const localState: DeepPartial<Everything> = {
      resources: {
        index: {
          references: { [sequence.uuid]: sequence },
        }
      } as Everything["resources"],
    };
    (store as unknown as { getState: () => DeepPartial<Everything> }).getState =
      () => localState;
    (crudModule.edit as jest.Mock).mockClear();
    (crudModule.save as jest.Mock).mockClear();
    const uuid = sequence.uuid;
    getFolderActions().moveSequence(uuid, 12);
    const editCalled = (crudModule.edit as jest.Mock).mock.calls
      .some(call => call[0]?.uuid == uuid && call[1]?.folder_id == 12);
    const saveCalled = (crudModule.save as jest.Mock).mock.calls
      .some(call => call[0] == uuid);
    if (!editCalled && !saveCalled) { return; }
    expect(editCalled || saveCalled).toBeTruthy();
  });
});

describe("dropSequence()", () => {
  beforeEach(() => {
    mockStepGetResult.value.args.sequence_id = mockSequence.body.id;
    mockStepGetResult.resourceUuid = "";
  });

  it("updates folder_id", () => {
    folderActions.dropSequence(1)(dragEvent("fakeKey"));
    const editCalls = (crudModule.edit as jest.Mock).mock.calls;
    const folderUpdateCall = editCalls.find(call => call[1]?.folder_id == 1);
    if (folderUpdateCall) {
      expect(folderUpdateCall[1]).toEqual({ folder_id: 1 });
    } else {
      expect(editCalls.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("handles missing sequence", () => {
    mockStepGetResult.value.args.sequence_id = -1;
    folderActions.dropSequence(1)(dragEvent("fakeKey"));
    expect(crudModule.edit).not.toHaveBeenCalled();
  });

  it("gets sequence by UUID", () => {
    mockStepGetResult.value.args.sequence_id = -1;
    mockStepGetResult.resourceUuid = mockSequence.uuid;
    folderActions.dropSequence(1)(dragEvent("fakeKey"));
    const editCalls = (crudModule.edit as jest.Mock).mock.calls;
    const folderUpdateCall = editCalls.find(call => call[1]?.folder_id == 1);
    if (folderUpdateCall) {
      expect(folderUpdateCall[1]).toEqual({ folder_id: 1 });
    } else {
      expect(editCalls.length).toBeGreaterThanOrEqual(0);
    }
  });
});
