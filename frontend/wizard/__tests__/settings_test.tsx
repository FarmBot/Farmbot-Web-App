jest.mock("../actions", () => ({
  destroyAllWizardStepResults: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { SetupWizardSettings } from "../settings";
import { SetupWizardSettingsProps } from "../interfaces";
import { destroyAllWizardStepResults } from "../actions";

describe("<SetupWizardSettings />", () => {
  const fakeProps = (): SetupWizardSettingsProps => ({
    dispatch: jest.fn(),
    wizardStepResults: [],
  });

  it("resets", () => {
    const wrapper = mount(<SetupWizardSettings {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("setup");
    wrapper.find("button").first().simulate("click");
    expect(destroyAllWizardStepResults).toHaveBeenCalled();
  });
});
