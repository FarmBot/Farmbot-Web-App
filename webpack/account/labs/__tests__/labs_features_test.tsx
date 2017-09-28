const mocks = {
  "maybeToggleFeature": jest.fn(),
  "fetchLabFeatures": jest.fn(() => ([
    {
      name: "Weed Detection",
      description: "Plots points of weeds in the garden.",
      storageKey: "weedDetector",
      value: false
    }
  ]))
};

jest.mock("../labs_features_list_data", () => mocks);

import * as React from "react";
import { mount } from "enzyme";
import { LabsFeatures } from "../labs_features";

describe("<LabsFeatures/>", () => {
  it("triggers the correct callback on click", () => {
    const el = mount(<LabsFeatures />);
    expect(mocks.fetchLabFeatures.mock.calls.length).toBeGreaterThan(0);
    el.find("button").simulate("click");
    expect(mocks.maybeToggleFeature.mock.calls.length).toBeGreaterThan(0);
  });
});
