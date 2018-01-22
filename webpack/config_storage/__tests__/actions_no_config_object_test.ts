import { toggleWebAppBool } from "../actions";
import { BooleanSetting } from "../../session_keys";
import { fakeResource } from "../../__test_support__/fake_resource";
import { edit, save } from "../../api/crud";
import { getWebAppConfig } from "../../resources/selectors";

jest.mock("../../api/crud", () => {
  return { save: jest.fn(), edit: jest.fn() };
});

const mockFakeResource = fakeResource;
jest.mock("../../resources/selectors", () => {
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
