jest.mock("../actions", () => ({
  addOrUpdateWizardStepResult: jest.fn(),
  destroyAllWizardStepResults: jest.fn(),
  completeSetup: jest.fn(),
  resetSetup: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { mapStateToProps, RawSetupWizard as SetupWizard } from "../index";
import { SetupWizardProps } from "../interfaces";
import { fakeState } from "../../__test_support__/fake_state";
import { WizardStepSlug, WIZARD_STEPS } from "../data";
import { BooleanSetting } from "../../session_keys";
import {
  fakeUser,
  fakeWebAppConfig, fakeWizardStepResult,
} from "../../__test_support__/fake_state/resources";
import {
  addOrUpdateWizardStepResult,
  completeSetup,
  destroyAllWizardStepResults,
} from "../actions";

describe("<SetupWizard />", () => {
  const fakeProps = (): SetupWizardProps => ({
    resources: buildResourceIndex([fakeDevice(), fakeUser()]).index,
    bot: bot,
    dispatch: jest.fn(() => Promise.resolve()),
    getConfigValue: jest.fn(),
    timeSettings: fakeTimeSettings(),
    firmwareHardware: undefined,
    wizardStepResults: [],
    device: fakeDevice(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.device = undefined;
    render(<SetupWizard {...p} />);
    expect(screen.getByText("Setup")).toBeInTheDocument();
  });

  it("renders with results", () => {
    const p = fakeProps();
    const result = fakeWizardStepResult();
    result.body.slug = WizardStepSlug.intro;
    result.body.answer = true;
    p.wizardStepResults = [result];
    const { container } = render(<SetupWizard {...p} />);
    expect(container).toContainHTML("fa-check");
  });

  it("renders with negative results", () => {
    const p = fakeProps();
    const result = fakeWizardStepResult();
    result.body.slug = WizardStepSlug.intro;
    result.body.answer = false;
    p.wizardStepResults = [result];
    const { container } = render(<SetupWizard {...p} />);
    expect(container).toContainHTML("fa-times");
  });

  it("renders when complete", () => {
    const p = fakeProps();
    p.device && (p.device.body.setup_completed_at = "123");
    render(<SetupWizard {...p} />);
    expect(screen.getByText("Setup Complete!")).toBeInTheDocument();
  });

  it("resets setup", () => {
    const p = fakeProps();
    const result = fakeWizardStepResult();
    result.body.slug = "slug";
    p.wizardStepResults = [result];
    render(<SetupWizard {...p} />);
    const reset = screen.getByText("start over");
    fireEvent.click(reset);
    expect(destroyAllWizardStepResults).toHaveBeenCalledTimes(1);
  });

  it("opens and closes step", () => {
    const text = "What is your preferred language?";
    render(<SetupWizard {...fakeProps()} />);
    expect(screen.queryByText(text)).not.toBeInTheDocument();
    const step = screen.getByText("Language");
    fireEvent.click(step);
    expect(screen.getByText(text)).toBeInTheDocument();
    fireEvent.click(step);
  });

  it("updates data", async () => {
    render(<SetupWizard {...fakeProps()} />);
    expect(screen.getByText("Begin?")).toBeInTheDocument();
    const yes = screen.getByText("yes");
    await fireEvent.click(yes);
    expect(addOrUpdateWizardStepResult).toHaveBeenCalledWith([],
      { answer: true, outcome: undefined, slug: "intro" });
  });

  it("updates data and completes setup", async () => {
    const p = fakeProps();
    p.wizardStepResults = WIZARD_STEPS({
      firmwareHardware: undefined,
    }).map(step => {
      const stepResult = fakeWizardStepResult();
      stepResult.body.answer = true;
      stepResult.body.slug = step.slug;
      return stepResult;
    });
    render(<SetupWizard {...p} />);
    const header = screen.getByText("TOURS");
    fireEvent.click(header);
    const step = screen.getByText("Setting up slots");
    fireEvent.click(step);
    const yes = screen.getByText("yes");
    await fireEvent.click(yes);
    expect(completeSetup).toHaveBeenCalled();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.xy_swap = false;
    state.resources = buildResourceIndex([config]);
    const props = mapStateToProps(state);
    expect(props.bot.stepSize).toEqual(100);
    expect(props.getConfigValue(BooleanSetting.xy_swap)).toEqual(false);
  });
});
