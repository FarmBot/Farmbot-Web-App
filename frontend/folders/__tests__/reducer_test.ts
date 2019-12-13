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

const f1 = fakeFolder();
const f2 = fakeFolder({ parent_id: f1.body.id });
const f3 = fakeFolder({ parent_id: f2.body.id });

function initialState(): RestResources {
  return buildResourceIndex([
    f1,
    f2,
    f3,
    fakeSequence({ folder_id: f1.body.id }),
    fakeSequence({ folder_id: f2.body.id }),
    fakeSequence({ folder_id: f3.body.id })
  ]);
}

describe("folder-related reducer functions", () => {
  it("toggled a folder's open state", () => {
    const state = initialState();
    const id = f1.body.id;
    const action = { type: Actions.FOLDER_TOGGLE, payload: { id } };
    const { index } = resourceReducer(state, action);
    const oldOpen =
      state.index.sequenceFolders.localMetaAttributes[f1.body.id || 0];
    const nextOpen = index.sequenceFolders.localMetaAttributes[f1.body.id || 0];

    expect(oldOpen).not.toEqual(nextOpen);
  });
});
