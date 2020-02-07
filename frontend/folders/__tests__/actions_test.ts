const mockStepGetResult = {
  value: { kind: "execute", args: { sequence_id: 1 } },
  resourceUuid: "",
};
jest.mock("../../draggable/actions", () => ({
  stepGet: jest.fn(() => () => mockStepGetResult),
}));

import { FolderNode } from "../interfaces";
import { ingest } from "../data_transfer";
import {
  collapseAll,
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
import { sample } from "lodash";
import { cloneAndClimb, climb } from "../climb";
import { store } from "../../redux/store";
import { DeepPartial } from "redux";
import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { newTaggedResource } from "../../sync/actions";
import { save, edit, init, initSave, destroy } from "../../api/crud";
import { setActiveSequenceByName } from "../../sequences/set_active_sequence_by_name";
import { push } from "../../history";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { stepGet } from "../../draggable/actions";
import { SpecialStatus } from "farmbot";
import { dragEvent } from "../../__test_support__/fake_html_events";

/** A set of fake Folder resources used exclusively for testing purposes.
 ```
   ├─ One
   ├─ Two
   │  └─ Three
   ├─ Four
   │  └─ Five
   ├─ Six
   │  └─ Seven
   │     ├─ Eight
   │     └─ Nine
   ├─ Ten
   │  ├─ Eleven
   │  └─ Twelve
   │     └─ Thirteen
   └─ Fourteen
      ├─ Fifteen
      └─ Sixteen
         ├─ Seventeen
         └─ Eighteen
  ``` */
const mockFolders: FolderNode[] = [
  { id: 1, parent_id: undefined, color: "blue", name: "One" },
  { id: 2, parent_id: undefined, color: "blue", name: "Two" },
  { id: 3, parent_id: 2, color: "blue", name: "Three" },
  { id: 4, parent_id: undefined, color: "blue", name: "Four" },
  { id: 5, parent_id: 4, color: "blue", name: "Five" },
  { id: 6, parent_id: undefined, color: "blue", name: "Six" },
  { id: 7, parent_id: 6, color: "blue", name: "Seven" },
  { id: 8, parent_id: 7, color: "blue", name: "Eight" },
  { id: 9, parent_id: 7, color: "blue", name: "Nine" },
  { id: 10, parent_id: undefined, color: "blue", name: "Ten" },
  { id: 11, parent_id: 10, color: "blue", name: "Eleven" },
  { id: 12, parent_id: 10, color: "blue", name: "Twelve" },
  { id: 13, parent_id: 12, color: "blue", name: "Thirteen" },
  { id: 14, parent_id: undefined, color: "blue", name: "Fourteen" },
  { id: 15, parent_id: 14, color: "blue", name: "Fifteen" },
  { id: 16, parent_id: 14, color: "blue", name: "Sixteen" },
  { id: 17, parent_id: 16, color: "blue", name: "Seventeen" },
  { id: 18, parent_id: 16, color: "blue", name: "Eighteen" }
];

const mockSequence = fakeSequence();
const i = buildResourceIndex(newTaggedResource("Folder", mockFolders));

const mockState: DeepPartial<Everything> =
  ({ resources: buildResourceIndex([mockSequence], i) });

jest.mock("../../redux/store", () => {
  return {
    store: {
      dispatch: jest.fn(x => typeof x === "function" && x()),
      getState: jest.fn(() => mockState)
    }
  };
});

jest.mock("../../api/crud", () => {
  return {
    destroy: jest.fn(),
    edit: jest.fn(),
    init: jest.fn(),
    initSave: jest.fn(),
    save: jest.fn()
  };
});

jest.mock("../../sequences/set_active_sequence_by_name", () => {
  return { setActiveSequenceByName: jest.fn() };
});

jest.mock("../../history", () => {
  return { push: jest.fn() };
});

/**
  ```
   ├─ One
   ├─ Two
   │  └─ Three
   ├─ Four
   │  └─ Five
   ├─ Six
   │  └─ Seven
   │     ├─ Eight
   │     └─ Nine
   ├─ Ten
   │  ├─ Eleven
   │  └─ Twelve
   │     └─ Thirteen
   └─ Fourteen
      ├─ Fifteen
      └─ Sixteen
         ├─ Seventeen
         └─ Eighteen
  ```
 */
export const TEST_GRAPH = ingest({
  folders: mockFolders,
  localMetaAttributes: {
    [1]: { editing: false, open: true, sequences: ["childOfFolder1"] },
    [2]: { editing: false, open: true, sequences: ["childOfFolder2"] },
    [3]: { editing: false, open: true, sequences: ["childOfFolder3"] },
    [4]: { editing: false, open: true, sequences: ["childOfFolder4"] },
    [5]: { editing: false, open: true, sequences: ["childOfFolder5"] },
    [6]: { editing: false, open: true, sequences: ["childOfFolder6"] },
    [7]: { editing: false, open: true, sequences: ["childOfFolder7"] },
    [8]: { editing: false, open: true, sequences: ["childOfFolder8"] },
    [9]: { editing: false, open: true, sequences: ["childOfFolder9"] },
    [10]: { editing: false, open: true, sequences: ["childOfFolder10"] },
    [11]: { editing: false, open: true, sequences: ["childOfFolder11"] },
    [12]: { editing: false, open: true, sequences: ["childOfFolder12"] },
    [13]: { editing: false, open: true, sequences: ["childOfFolder13"] },
    [14]: { editing: false, open: true, sequences: ["childOfFolder14"] },
    [15]: { editing: false, open: true, sequences: ["childOfFolder15"] },
    [16]: { editing: false, open: true, sequences: ["childOfFolder16"] },
    [17]: { editing: false, open: true, sequences: ["childOfFolder17"] },
    [18]: { editing: false, open: true, sequences: ["childOfFolder18"] },
  }
});

describe("expand/collapse all", () => {
  const halfOpen = cloneAndClimb(TEST_GRAPH, (node) => {
    node.open = !sample([true, false]);
  });

  it("collapses all folders", async () => {
    const closed = await collapseAll(halfOpen);
    climb(closed, (node) => {
      expect(node.open).toBe(false);
    });
  });
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
  it("Adds a new sequence to a folder", () => {
    addNewSequenceToFolder(11);
    expect(setActiveSequenceByName).toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Sequence", expect.objectContaining({
      name: "new sequence 1"
    }));
    expect(push).toHaveBeenCalledWith("/app/sequences/new_sequence_1");
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
