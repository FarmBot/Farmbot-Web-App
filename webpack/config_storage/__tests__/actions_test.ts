import { toggleWebAppBool, getWebAppConfigValue } from "../actions";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { edit, save } from "../../api/crud";
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

describe("getWebAppConfigValue", () => {
  const getState = jest.fn(() => ({ resources: { index: {} } }));
  const getValue = getWebAppConfigValue(getState);

  it("gets a boolean setting value", () => {
    expect(getValue(BooleanSetting.show_first_party_farmware)).toEqual(false);
  });

  it("gets a numeric setting value", () => {
    expect(getValue(NumericSetting.warn_log)).toEqual(3);
  });
});
