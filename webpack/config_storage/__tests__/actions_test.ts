import { toggleWebAppBool, getWebAppConfigValue, setWebAppConfigValue } from "../actions";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { edit, save } from "../../api/crud";
import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";

jest.mock("../../api/crud", () => {
  return { save: jest.fn(), edit: jest.fn() };
});

let mockConfig = fakeWebAppConfig();
jest.mock("../../resources/selectors", () => {
  return {
    assertUuid: jest.fn()
  };
});

jest.mock("../../resources/config_selectors", () => {
  return {
    getWebAppConfig: () => mockConfig
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

describe("setWebAppConfigValue", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  const getState = jest.fn(() => ({ resources: { index: {} } }));

  it("sets a numeric setting value", () => {
    setWebAppConfigValue(NumericSetting.fun_log, 2)(jest.fn(), getState);
    expect(edit).toHaveBeenCalledWith(mockConfig, { fun_log: 2 });
    expect(save).toHaveBeenCalledWith(mockConfig.uuid);
  });

  it("fails to set a value", () => {
    // tslint:disable-next-line:no-any
    mockConfig = undefined as any;
    const action = () => setWebAppConfigValue(NumericSetting.fun_log, 1)(
      jest.fn(), getState);
    expect(action).toThrowError("Changed settings before app was loaded.");
  });
});
