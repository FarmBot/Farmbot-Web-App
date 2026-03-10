import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";
let mockConfig = fakeWebAppConfig();

import {
  toggleWebAppBool, getWebAppConfigValue, setWebAppConfigValue,
} from "../actions";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import * as crud from "../../api/crud";
import * as getters from "../../resources/getters";
import { fakeState } from "../../__test_support__/fake_state";
import { TaggedWebAppConfig } from "farmbot";

let getWebAppConfigSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;

beforeEach(() => {
  mockConfig = fakeWebAppConfig();
  getWebAppConfigSpy = jest.spyOn(getters, "getWebAppConfig")
    .mockImplementation(() => mockConfig);
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

afterEach(() => {
  getWebAppConfigSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
});

describe("toggleWebAppBool()", () => {
  it("toggles things", () => {
    const action = toggleWebAppBool(BooleanSetting.show_first_party_farmware);
    const dispatch = jest.fn();
    action(dispatch, fakeState);
    expect(crud.edit).toHaveBeenCalledWith(mockConfig, {
      show_first_party_farmware: true
    });
    expect(crud.save).toHaveBeenCalledWith(mockConfig.uuid);
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
    expect(getValue(BooleanSetting.show_first_party_farmware)).toEqual(false);
  });

  it("gets a numeric setting value", () => {
    expect(getValue(NumericSetting.warn_log)).toEqual(3);
  });
});

describe("setWebAppConfigValue()", () => {
  it("sets a numeric setting value", () => {
    setWebAppConfigValue(NumericSetting.fun_log, 2)(jest.fn(), fakeState);
    expect(crud.edit).toHaveBeenCalledWith(mockConfig, { fun_log: 2 });
    expect(crud.save).toHaveBeenCalledWith(mockConfig.uuid);
  });

  it("fails to set a value", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockConfig = undefined as any;
    const action = () => setWebAppConfigValue(NumericSetting.fun_log, 1)(
      jest.fn(), fakeState);
    expect(action).toThrow("Changed settings before app was loaded.");
  });
});
