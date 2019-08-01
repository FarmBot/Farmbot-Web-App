import { beforeEach } from "../reducer_support";
import { ReduxAction } from "../../redux/interfaces";
import { Actions } from "../../constants";
import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";

describe("beforeEach", () => {
  const emptyHandler = <T>(s: T): T => s;

  const readonlyState = () => {
    const config = fakeWebAppConfig();
    config.body.user_interface_read_only_mode = true;
    return buildResourceIndex([config]);
  };

  it("Can modify WebAppConfigs, even when in read-only mode", () => {
    const state = readonlyState();
    const action: ReduxAction<{}> =
      ({ type: Actions.EDIT_RESOURCE, payload: { uuid: "WebAppConfig.99.99" } });
    const handler = jest.fn(emptyHandler);
    beforeEach(state, action, handler);
    expect(handler).toHaveBeenCalledWith(state, action);
  });

  it("Cannot modify resources in readonly mode", () => {
    // === Don't allow EDIT_RESOURCE
    const state = readonlyState();
    const action: ReduxAction<{}> =
      ({ type: Actions.EDIT_RESOURCE, payload: { uuid: "Sequence.99.99" } });
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
