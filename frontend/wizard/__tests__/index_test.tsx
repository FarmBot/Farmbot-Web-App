jest.mock("../actions", () => ({
  addOrUpdateWizardStepResult: jest.fn(),
  destroyAllWizardStepResults: jest.fn(),
  completeSetup: jest.fn(),
  resetSetup: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { mapStateToProps, RawSetupWizard as SetupWizard } from "../index";
import { SetupWizardProps } from "../interfaces";
import { fakeState } from "../../__test_support__/fake_state";
import { WizardSectionSlug, WizardStepSlug, WIZARD_STEPS } from "../data";
import { BooleanSetting } from "../../session_keys";
import {
  fakeWebAppConfig, fakeWizardStepResult,
} from "../../__test_support__/fake_state/resources";
import {
  addOrUpdateWizardStepResult,
  completeSetup,
  destroyAllWizardStepResults,
} from "../actions";

describe("<SetupWizard />", () => {
  const fakeProps = (): SetupWizardProps => ({
    resources: buildResourceIndex([fakeDevice()]).index,
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
    const wrapper = mount(<SetupWizard {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("setup");
  });

  it("renders with results", () => {
    const p = fakeProps();
    const result = fakeWizardStepResult();
    result.body.slug = WizardStepSlug.intro;
    result.body.answer = true;
    p.wizardStepResults = [result];
    const wrapper = mount(<SetupWizard {...p} />);
    expect(wrapper.html()).toContain("fa-check");
  });

  it("renders with negative results", () => {
    const p = fakeProps();
    const result = fakeWizardStepResult();
    result.body.slug = WizardStepSlug.intro;
    result.body.answer = false;
    p.wizardStepResults = [result];
    const wrapper = mount(<SetupWizard {...p} />);
    expect(wrapper.html()).toContain("fa-times");
  });

  it("renders when complete", () => {
    const p = fakeProps();
    p.device && (p.device.body.setup_completed_at = "123");
    const wrapper = mount(<SetupWizard {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("setup complete");
  });

  it("resets setup", () => {
    const p = fakeProps();
    const result = fakeWizardStepResult();
    result.body.slug = "slug";
    p.wizardStepResults = [result];
    const wrapper = mount<SetupWizard>(<SetupWizard {...p} />);
    expect(wrapper.instance().results).toEqual({ slug: result.body });
    wrapper.instance().reset();
    expect(destroyAllWizardStepResults).toHaveBeenCalledTimes(1);
  });

  it("toggles section", () => {
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    expect(wrapper.state().intro).toEqual(true);
    wrapper.instance().toggleSection(WizardSectionSlug.intro)();
    expect(wrapper.state().intro).toEqual(false);
  });

  it("opens step", () => {
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    wrapper.setState({ stepOpen: undefined });
    wrapper.instance().openStep(WizardStepSlug.intro)();
    expect(wrapper.state().stepOpen).toEqual(WizardStepSlug.intro);
  });

  it("closes step", () => {
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    expect(wrapper.state().stepOpen).toEqual(WizardStepSlug.intro);
    wrapper.instance().openStep(WizardStepSlug.intro)();
    expect(wrapper.state().stepOpen).toEqual(undefined);
  });

  it("updates data", async () => {
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    expect(wrapper.instance().results).toEqual({});
    await wrapper.instance().updateData(fakeWizardStepResult().body)();
    expect(addOrUpdateWizardStepResult).toHaveBeenCalled();
  });

  it("updates data and progresses to next step", async () => {
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    expect(wrapper.state().stepOpen).toEqual(WizardStepSlug.intro);
    await wrapper.instance().updateData(
      fakeWizardStepResult().body, WizardStepSlug.orderInfo)();
    expect(wrapper.state().stepOpen).toEqual(WizardStepSlug.orderInfo);
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
    const wrapper = mount<SetupWizard>(<SetupWizard {...p} />);
    const result = fakeWizardStepResult().body;
    result.slug = WizardStepSlug.intro;
    result.answer = true;
    result.outcome = undefined;
    await wrapper.instance().updateData(result, undefined, true)();
    await expect(completeSetup).toHaveBeenCalled();
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
