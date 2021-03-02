import React from "react";
import { mount } from "enzyme";
import { SetupWizardSettings } from "../settings";

describe("<SetupWizardSettings />", () => {
  it("renders", () => {
    const wrapper = mount(<SetupWizardSettings />);
    expect(wrapper.text().toLowerCase()).toContain("setup");
  });
});
