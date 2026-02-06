import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";
import { store } from "../../redux/store";
const mockState = fakeState();
const config = fakeWebAppConfig();
config.body.highlight_modified_settings = true;
mockState.resources = buildResourceIndex([config]);

import { getModifiedClassName } from "../default_values";

let originalGetState: typeof store.getState;

describe("getModifiedClassName()", () => {
  beforeEach(() => {
    originalGetState = store.getState;
    (store as unknown as { getState: () => typeof mockState }).getState =
      () => mockState;
  });

  afterEach(() => {
    (store as unknown as { getState: typeof store.getState }).getState =
      originalGetState;
  });

  it("returns class name", () => {
    expect(getModifiedClassName("WEED_DETECTOR_V_LO", 50)).toEqual("");
    expect(getModifiedClassName("WEED_DETECTOR_V_LO", 51)).toEqual("modified");
  });
});
