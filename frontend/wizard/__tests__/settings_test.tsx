jest.mock("../actions", () => ({
  destroyAllWizardStepResults: jest.fn(),
  completeSetup: jest.fn(),
  resetSetup: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { SetupWizardSettings } from "../settings";
import { SetupWizardSettingsProps } from "../interfaces";
import {
  completeSetup, destroyAllWizardStepResults, resetSetup,
} from "../actions";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { clickButton } from "../../__test_support__/helpers";

describe("<SetupWizardSettings />", () => {
  const fakeProps = (): SetupWizardSettingsProps => ({
    dispatch: jest.fn(),
    wizardStepResults: [],
    device: fakeDevice(),
  });

  it("resets setup", () => {
    const wrapper = mount(<SetupWizardSettings {...fakeProps()} />);
    clickButton(wrapper, 0, "restart");
    expect(destroyAllWizardStepResults).toHaveBeenCalled();
    expect(resetSetup).toHaveBeenCalled();
  });

  it("completes setup", () => {
    const wrapper = mount(<SetupWizardSettings {...fakeProps()} />);
    clickButton(wrapper, 1, "complete");
    expect(completeSetup).toHaveBeenCalled();
  });
});
