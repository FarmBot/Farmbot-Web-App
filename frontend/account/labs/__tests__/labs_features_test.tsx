const mockFeatures = [
  {
    name: "Weed Detection",
    description: "Plots points of weeds in the garden.",
    storageKey: "weedDetector",
    callback: jest.fn(),
    value: false
  }
];

const mocks = {
  "maybeToggleFeature": jest.fn(() => jest.fn()),
  "fetchLabFeatures": jest.fn(() => mockFeatures)
};

jest.mock("../labs_features_list_data", () => mocks);

import * as React from "react";
import { mount } from "enzyme";
import { LabsFeatures } from "../labs_features";

describe("<LabsFeatures/>", () => {
  it("triggers the correct callback on click", async () => {
    const el = mount(<LabsFeatures
      dispatch={jest.fn()}
      getConfigValue={jest.fn()} />);
    expect(mocks.fetchLabFeatures.mock.calls.length).toBeGreaterThan(0);
    await el.find("button").simulate("click");
    expect(mockFeatures[0].callback).toHaveBeenCalled();
    expect(mocks.maybeToggleFeature.mock.calls.length).toBeGreaterThan(0);
  });
});
