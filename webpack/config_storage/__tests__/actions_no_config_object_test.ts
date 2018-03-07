import { toggleWebAppBool } from "../actions";
import { BooleanSetting } from "../../session_keys";

jest.mock("../../api/crud", () => {
  return { save: jest.fn(), edit: jest.fn() };
});

jest.mock("../../resources/config_selectors", () => {
  return { getWebAppConfig: jest.fn(() => (undefined)) };
});

describe("toggleWebAppBool", () => {
  it("toggles things", () => {
    const action = toggleWebAppBool(BooleanSetting.show_first_party_farmware);
    const dispatch = jest.fn();
    const getState = jest.fn(() => ({ resources: { index: {} } }));
    const kaboom = () => action(dispatch, getState);
    expect(kaboom).toThrowError("Toggled settings before app was loaded.");
  });
});
