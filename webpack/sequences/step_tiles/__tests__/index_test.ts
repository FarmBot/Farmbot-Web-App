const mockStorj: Dictionary<boolean> = {};

jest.mock("../../../session", () => {
  return {
    Session: {
      deprecatedGetBool: (k: string) => {
        mockStorj[k] = !!mockStorj[k];
        return mockStorj[k];
      }
    }
  };
});

import { Dictionary } from "farmbot";
import { remove } from "../index";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { BooleanSetting } from "../../../session_keys";

describe("remove()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("deletes step without confirmation", () => {
    const dispatch = jest.fn();
    mockStorj[BooleanSetting.confirm_step_deletion] = false;
    remove({ index: 0, dispatch, sequence: fakeSequence() });
    expect(dispatch).toHaveBeenCalled();
  });

  it("deletes step with confirmation", () => {
    const dispatch = jest.fn();
    mockStorj[BooleanSetting.confirm_step_deletion] = true;
    window.confirm = jest.fn();
    remove({ index: 0, dispatch, sequence: fakeSequence() });
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("delete this step?"));
    expect(dispatch).not.toHaveBeenCalled();
    window.confirm = jest.fn(() => true);
    remove({ index: 0, dispatch, sequence: fakeSequence() });
    expect(dispatch).toHaveBeenCalled();
  });
});
