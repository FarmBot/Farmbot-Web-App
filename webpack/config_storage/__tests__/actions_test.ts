import { toggleWebAppBool } from "../actions";
import { BooleanSetting } from "../../session_keys";
import { edit, save } from "../../api/crud";
import { getWebAppConfig } from "../../resources/selectors";
import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";

jest.mock("../../api/crud", () => {
  return { save: jest.fn(), edit: jest.fn() };
});

const mockConfig = fakeWebAppConfig();
jest.mock("../../resources/selectors", () => {
  return {
    getWebAppConfig: () => mockConfig,
    assertUuid: jest.fn()
  };
});

describe("toggleWebAppBool", () => {
  it("toggles things", () => {
    const action = toggleWebAppBool(BooleanSetting.show_first_party_farmware);
    const dispatch = jest.fn();
    const getState = jest.fn(() => ({ resources: { index: {} } }));
    action(dispatch, getState);
    expect(edit).toHaveBeenCalledWith(mockConfig, {
      show_first_party_farmware: true
    });
    expect(save).toHaveBeenCalledWith(mockConfig.uuid);
  });
});
