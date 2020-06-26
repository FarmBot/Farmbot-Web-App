jest.mock("../labs_features_list_data", () => ({
  fetchLabFeatures: () => [{
    name: "feature",
    description: "description",
    storageKey: "key",
    value: false,
    displayInvert: true,
  }],
}));

import * as React from "react";
import {
  LabsFeaturesList, LabsFeaturesListProps,
} from "../labs_features_list_ui";
import { shallow } from "enzyme";
import { ToggleButton } from "../../../controls/toggle_button";

describe("<LabsFeaturesList />", () => {
  const fakeProps = (): LabsFeaturesListProps => ({
    onToggle: jest.fn(),
    getConfigValue: jest.fn(),
  });

  it("inverts value", () => {
    const wrapper = shallow(<LabsFeaturesList {...fakeProps()} />);
    expect(wrapper.find(ToggleButton).props().toggleValue).toEqual(1);
  });
});
