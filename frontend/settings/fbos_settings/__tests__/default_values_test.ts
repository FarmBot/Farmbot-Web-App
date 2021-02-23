import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { fakeWebAppConfig } from "../../../__test_support__/fake_state/resources";
const mockState = fakeState();
const config = fakeWebAppConfig();
config.body.highlight_modified_settings = true;
mockState.resources = buildResourceIndex([config]);
jest.mock("../../../redux/store", () => ({
  store: {
    getState: () => mockState,
    dispatch: jest.fn(),
  },
}));

import { getModifiedClassName } from "../default_values";

describe("getModifiedClassName()", () => {
  it("returns class name", () => {
    expect(getModifiedClassName("soil_height", 0)).toEqual("");
    expect(getModifiedClassName("soil_height", 1)).toEqual("modified");
    expect(getModifiedClassName("network_not_found_timer", undefined)).toEqual("");
    expect(getModifiedClassName("network_not_found_timer", 20)).toEqual("");
    expect(getModifiedClassName("network_not_found_timer", 0)).toEqual("modified");
  });
});
