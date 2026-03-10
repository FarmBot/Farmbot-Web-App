import React from "react";
import { render } from "@testing-library/react";
import { SetupWizardSettings } from "../settings";
import { SetupWizardSettingsProps } from "../interfaces";
import * as wizardActions from "../actions";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { clickButton } from "../../__test_support__/helpers";

let destroyAllWizardStepResultsSpy: jest.SpyInstance;
let completeSetupSpy: jest.SpyInstance;
let resetSetupSpy: jest.SpyInstance;

beforeEach(() => {
  destroyAllWizardStepResultsSpy = jest.spyOn(wizardActions, "destroyAllWizardStepResults")
    .mockImplementation(jest.fn());
  completeSetupSpy = jest.spyOn(wizardActions, "completeSetup")
    .mockImplementation(jest.fn());
  resetSetupSpy = jest.spyOn(wizardActions, "resetSetup")
    .mockImplementation(jest.fn());
});

describe("<SetupWizardSettings />", () => {
  const fakeProps = (): SetupWizardSettingsProps => ({
    dispatch: jest.fn(),
    wizardStepResults: [],
    device: fakeDevice(),
  });

  it("resets setup", () => {
    const { container } = render(<SetupWizardSettings {...fakeProps()} />);
    clickButton(container, 0, "restart");
    expect(destroyAllWizardStepResultsSpy).toHaveBeenCalled();
    expect(resetSetupSpy).toHaveBeenCalled();
  });

  it("completes setup", () => {
    const { container } = render(<SetupWizardSettings {...fakeProps()} />);
    clickButton(container, 1, "complete");
    expect(completeSetupSpy).toHaveBeenCalled();
  });
});
