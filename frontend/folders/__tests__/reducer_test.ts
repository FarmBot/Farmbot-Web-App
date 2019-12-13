import { resourceReducer } from "../../resources/reducer";
import { RestResources } from "../../resources/interfaces";
import {
  fakeSequence,
  fakeFolder
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { Actions } from "../../constants";

const f1 = fakeFolder({ name: "@" });
const f2 = fakeFolder({ name: "#", parent_id: f1.body.id });
const f3 = fakeFolder({ name: "$", parent_id: f2.body.id });

function initialState(): RestResources {
  return buildResourceIndex([
    f1,
    f2,
    f3,
    fakeSequence({ name: "%", folder_id: f1.body.id }),
    fakeSequence({ name: "^", folder_id: f2.body.id }),
    fakeSequence({ name: "&", folder_id: f3.body.id })
  ]);
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
