import { beforeEach, reindexFolders } from "../reducer_support";
import { ReduxAction } from "../../redux/interfaces";
import { Actions } from "../../constants";
import {
  fakeFolder, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { cloneDeep } from "lodash";

describe("beforeEach()", () => {
  const emptyHandler = <T>(s: T, _a: ReduxAction<{}>): T => s;

  const readonlyState = () => {
    const config = fakeWebAppConfig();
    config.body.user_interface_read_only_mode = true;
    return buildResourceIndex([config]);
  };

  it("can modify WebAppConfigs, even when in read-only mode", () => {
    const state = readonlyState();
    const action = ({
      type: Actions.EDIT_RESOURCE,
      payload: { uuid: "WebAppConfig.99.99" },
    });
    const handler = jest.fn(emptyHandler);
    beforeEach(state, action, handler);
    expect(handler).toHaveBeenCalledWith(state, action);
  });

  it("cannot modify resources in readonly mode", () => {
    // === Don't allow EDIT_RESOURCE
    const state = readonlyState();
    const action = ({
      type: Actions.EDIT_RESOURCE,
      payload: { uuid: "Sequence.99.99" },
    });
    const handler = jest.fn(emptyHandler);
    expect(beforeEach(state, action, handler)).toBe(state);
    expect(handler).not.toHaveBeenCalledWith(state, action);

    // === Allow SAVE_RESOURCE_START, but warn user.
    const entryList: [Actions, boolean][] = [
      [Actions.SAVE_RESOURCE_START, true],
      [Actions.REFRESH_RESOURCE_OK, true],
      [Actions.BATCH_INIT, false],
      [Actions.INIT_RESOURCE, false],
      [Actions.OVERWRITE_RESOURCE, false],
    ];

    entryList.map(([type, shouldCall]) => {
      handler.mockClear();
      const action2 = { ...action, type };
      // Don't use `toEqual` here.
      // I'm testing object identity rather than just equality.
      expect(beforeEach(state, action2, handler)).toEqual(state);
      if (shouldCall) {
        expect(handler).toHaveBeenCalledWith(state, action2);
      } else {
        expect(handler).not.toHaveBeenCalledWith(state, action2);
      }
    });
  });
});

describe("reindexFolders()", () => {
  it("updates folder search results", () => {
    const matchedFolder = fakeFolder();
    matchedFolder.body.name = "matched folder";
    const unmatchedFolder = fakeFolder();
    unmatchedFolder.body.name = "unmatched";
    const ri = buildResourceIndex([
      matchedFolder, unmatchedFolder, fakeFolder(),
    ]).index;
    const deletedFolder = cloneDeep(ri.sequenceFolders.folders.folders[0]);
    deletedFolder.id = 999;
    deletedFolder.name = "deleted";
    ri.sequenceFolders.filteredFolders = {
      folders: [
        ...ri.sequenceFolders.folders.folders.filter(f => f.name == "fake"),
        deletedFolder,
      ],
      noFolder: [],
    };
    ri.sequenceFolders.searchTerm = "folder";
    expect(ri.sequenceFolders.filteredFolders.folders.map(f => f.name))
      .toEqual(["fake", "deleted"]);
    reindexFolders(ri);
    expect(ri.sequenceFolders.filteredFolders.folders.map(f => f.name))
      .toEqual(["fake", "matched folder"]);
  });
});
