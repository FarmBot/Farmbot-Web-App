import {
  toggleWebAppBool, getWebAppConfigValue, setWebAppConfigValue
} from "../actions";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { edit, save } from "../../api/crud";
import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";

jest.mock("../../api/crud", () => {
  return { save: jest.fn(), edit: jest.fn() };
});

let mockConfig = fakeWebAppConfig();
jest.mock("../../resources/getters", () => {
  return {
    getWebAppConfig: () => mockConfig
  };
});

describe("toggleWebAppBool", () => {
  it("toggles things", () => {
    const action = toggleWebAppBool(BooleanSetting.show_first_party_farmware);
    const dispatch = jest.fn();
    action(dispatch, fakeState);
    expect(edit).toHaveBeenCalledWith(mockConfig, {
      show_first_party_farmware: true
    });
    expect(save).toHaveBeenCalledWith(mockConfig.uuid);
  });
});

describe("getWebAppConfigValue", () => {
  const getValue = getWebAppConfigValue(fakeState);

  it("gets a boolean setting value", () => {
    expect(getValue(BooleanSetting.show_first_party_farmware)).toEqual(false);
  });

  it("gets a numeric setting value", () => {
    expect(getValue(NumericSetting.warn_log)).toEqual(3);
  });
});

describe("setWebAppConfigValue", () => {
  it("sets a numeric setting value", () => {
    setWebAppConfigValue(NumericSetting.fun_log, 2)(jest.fn(), fakeState);
    expect(edit).toHaveBeenCalledWith(mockConfig, { fun_log: 2 });
    expect(save).toHaveBeenCalledWith(mockConfig.uuid);
  });

  it("fails to set a value", () => {
    // tslint:disable-next-line:no-any
    mockConfig = undefined as any;
    const action = () => setWebAppConfigValue(NumericSetting.fun_log, 1)(
      jest.fn(), fakeState);
    expect(action).toThrowError("Changed settings before app was loaded.");
  });
});
