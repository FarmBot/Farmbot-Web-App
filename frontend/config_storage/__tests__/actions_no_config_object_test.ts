import { toggleWebAppBool } from "../actions";
import { BooleanSetting } from "../../session_keys";
import { fakeState } from "../../__test_support__/fake_state";

jest.mock("../../api/crud", () => {
  return { save: jest.fn(), edit: jest.fn() };
});

jest.mock("../../resources/getters", () => {
  return { getWebAppConfig: jest.fn(() => (undefined)) };
});

describe("toggleWebAppBool", () => {
  it("toggles things", () => {
    const action = toggleWebAppBool(BooleanSetting.show_first_party_farmware);
    const dispatch = jest.fn();
    const kaboom = () => action(dispatch, fakeState);
    expect(kaboom).toThrowError("Toggled settings before app was loaded.");
  });
});
