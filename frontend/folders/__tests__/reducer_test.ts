import { resourceReducer } from "../../resources/reducer";
import { RestResources } from "../../resources/interfaces";
import {
  fakeSequence,
  fakeFolder,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Actions } from "../../constants";

const f1 = fakeFolder({ name: "@" });
const f2 = fakeFolder({ name: "#", parent_id: f1.body.id });
const f3 = fakeFolder({ name: "$", parent_id: f2.body.id });
const s1 = fakeSequence({ name: "%", folder_id: f1.body.id });
const s2 = fakeSequence({ name: "^", folder_id: f2.body.id });
const s3 = fakeSequence({ name: "&", folder_id: f3.body.id });
const s4 = fakeSequence({ name: "*", folder_id: undefined });
const s5 = fakeSequence({ name: "!", folder_id: undefined });

function initialState(): RestResources {
  return buildResourceIndex([f1, f2, f3, s1, s2, s3, s4, s5]);
}

describe("Actions.FOLDER_TOGGLE", () => {
  it("toggles a folder's open state", () => {
    const state = initialState();
    const id = f1.body.id;
    const action = { type: Actions.FOLDER_TOGGLE, payload: { id } };
    const { index } = resourceReducer(state, action);
    const oldOpen =
      state.index.sequenceFolders.localMetaAttributes[f1.body.id || 0];
    const nextOpen = index.sequenceFolders.localMetaAttributes[f1.body.id || 0];

    expect(oldOpen.open).not.toEqual(nextOpen.open);
  });
});

describe("Actions.FOLDER_TOGGLE_ALL", () => {
  it("toggles a folder's open state", () => {
    const state = initialState();
    [true, false].map(payload => {

      const action = { type: Actions.FOLDER_TOGGLE_ALL, payload };
      const { index } = resourceReducer(state, action);
      [f1, f2, f3].map(f => {
        const nextOpen = index
          .sequenceFolders
          .localMetaAttributes[f.body.id || 0];
        expect(nextOpen.open).toEqual(payload);
      });
    });
  });
});

describe("Actions.FOLDER_TOGGLE_EDIT", () => {
  it("toggles a folder's edit state", () => {
    const state = initialState();
    const id = f1.body.id;
    const action = { type: Actions.FOLDER_TOGGLE_EDIT, payload: { id } };
    const { index } = resourceReducer(state, action);
    const oldedit =
      state.index.sequenceFolders.localMetaAttributes[f1.body.id || 0];
    const nextedit = index.sequenceFolders.localMetaAttributes[f1.body.id || 0];
    expect(oldedit.editing).not.toEqual(nextedit.editing);
  });
});

describe("Actions.FOLDER_SEARCH", () => {
  it("searches folderless sequences", () => {
    const state = initialState();
    const action = { type: Actions.FOLDER_SEARCH, payload: "!" };
    const { index } = resourceReducer(state, action);
    const { sequenceFolders } = index;
    const { filteredFolders } = sequenceFolders;
    expect(sequenceFolders.searchTerm).toBe("!");
    const list = filteredFolders?.noFolder || [];
    expect(list.length).toBe(1);
    expect(list[0]).toBe(s5.uuid);
  });

  it("searches folders", () => {
    const state = initialState();
    const action = { type: Actions.FOLDER_SEARCH, payload: "" };
    const { index } = resourceReducer(state, action);
    expect(index.sequenceFolders.filteredFolders).toBeUndefined();
    expect(index.sequenceFolders.searchTerm).toBe("");

    const action2 = { type: Actions.FOLDER_SEARCH, payload: "" };
    const index2 = resourceReducer(state, action2).index;
    expect(index2.sequenceFolders.searchTerm).toBe("");
    expect(index2.sequenceFolders.filteredFolders).toBeUndefined();

    const action3 = { type: Actions.FOLDER_SEARCH, payload: "&" };
    const index3 = resourceReducer(state, action3).index;
    expect(index3.sequenceFolders.searchTerm).toBe("&");
    expect(index3.sequenceFolders.filteredFolders).not.toBeUndefined();
    const { filteredFolders } = index3.sequenceFolders;
    if (filteredFolders) {
      expect(filteredFolders.noFolder.length).toEqual(0);
      expect(filteredFolders.folders.length).toEqual(1);
      const one = filteredFolders.folders[0];
      const two = one.children[0];
      const three = two.children[0];
      const four = three.content[0];
      expect(one.name).toBe("@");
      expect(two.name).toBe("#");
      expect(three.name).toBe("$");
      expect(four).toBe(s3.uuid);
    }
  });
});
