jest.mock("../../api/crud", () => ({
  save: jest.fn(),
  edit: jest.fn(),
}));

import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";
let mockConfig = fakeWebAppConfig();
jest.mock("../../resources/getters", () => ({
  getWebAppConfig: () => mockConfig,
}));

import {
  toggleWebAppBool, getWebAppConfigValue, setWebAppConfigValue,
} from "../actions";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { edit, save } from "../../api/crud";
import { fakeState } from "../../__test_support__/fake_state";
import { TaggedWebAppConfig } from "farmbot";

describe("toggleWebAppBool()", () => {
  it("toggles things", () => {
    mockConfig = fakeWebAppConfig();
    const action = toggleWebAppBool(BooleanSetting.show_first_party_farmware);
    const dispatch = jest.fn();
    action(dispatch, fakeState);
    expect(edit).toHaveBeenCalledWith(mockConfig, {
      show_first_party_farmware: true
    });
    expect(save).toHaveBeenCalledWith(mockConfig.uuid);
  });

  it("errors when not loaded", () => {
    mockConfig = undefined as unknown as TaggedWebAppConfig;
    const action = toggleWebAppBool(BooleanSetting.show_first_party_farmware);
    const dispatch = jest.fn();
    const kaboom = () => action(dispatch, fakeState);
    expect(kaboom).toThrow("Toggled settings before app was loaded.");
  });
});

describe("getWebAppConfigValue()", () => {
  const getValue = getWebAppConfigValue(fakeState);

  it("gets a boolean setting value", () => {
    mockConfig = fakeWebAppConfig();
    expect(getValue(BooleanSetting.show_first_party_farmware)).toEqual(false);
  });

  it("gets a numeric setting value", () => {
    mockConfig = fakeWebAppConfig();
    expect(getValue(NumericSetting.warn_log)).toEqual(3);
  });
});

describe("setWebAppConfigValue()", () => {
  it("sets a numeric setting value", () => {
    mockConfig = fakeWebAppConfig();
    setWebAppConfigValue(NumericSetting.fun_log, 2)(jest.fn(), fakeState);
    expect(edit).toHaveBeenCalledWith(mockConfig, { fun_log: 2 });
    expect(save).toHaveBeenCalledWith(mockConfig.uuid);
  });

  it("fails to set a value", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockConfig = undefined as any;
    const action = () => setWebAppConfigValue(NumericSetting.fun_log, 1)(
      jest.fn(), fakeState);
    expect(action).toThrow("Changed settings before app was loaded.");
  });
});
