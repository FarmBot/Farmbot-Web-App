import { mapStateToFolderProps } from "../map_state_to_props";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeFolder, fakeSequence, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { BooleanSetting } from "../../session_keys";

describe("mapStateToFolderProps", () => {
  it("maps state to props", () => {
    const f1 = fakeFolder({ name: "@" });
    const f2 = fakeFolder({ name: "#", parent_id: f1.body.id });
    const f3 = fakeFolder({ name: "$", parent_id: f2.body.id });
    const state = fakeState();
    state.resources = buildResourceIndex([f1,
      f2,
      f3,
      fakeSequence({ name: "%", folder_id: f1.body.id }),
      fakeSequence({ name: "^", folder_id: f2.body.id }),
      fakeSequence({ name: "&", folder_id: f3.body.id }),
      fakeSequence({ name: "*", folder_id: undefined }),
      fakeSequence({ name: "!", folder_id: undefined })]);
    const props = mapStateToFolderProps(state);
    expect(props).toBeDefined();
    expect(props.rootFolder.folders.length).toBe(1);
    expect(props.rootFolder.noFolder.length).toBe(2);
  });

  it("maps state to props with filtered", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.confirm_sequence_deletion = true;
    state.resources = buildResourceIndex([fakeFolder(), config]);
    state.resources.index.sequenceFolders.filteredFolders =
      state.resources.index.sequenceFolders.folders;
    const props = mapStateToFolderProps(state);
    expect(props.rootFolder.folders.length).toEqual(1);
    expect(props.getWebAppConfigValue(BooleanSetting.confirm_sequence_deletion))
      .toEqual(true);
  });
});
