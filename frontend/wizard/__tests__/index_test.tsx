import React from "react";
import { mount } from "enzyme";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { mapStateToProps, RawSetupWizard as SetupWizard } from "../index";
import { SetupWizardProps, WizardResults } from "../interfaces";
import { fakeState } from "../../__test_support__/fake_state";
import {
  WizardData, WizardSectionSlug, WizardStepSlug, WIZARD_STEPS,
} from "../data";
import { BooleanSetting } from "../../session_keys";
import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";

describe("<SetupWizard />", () => {
  const fakeProps = (): SetupWizardProps => ({
    resources: buildResourceIndex([]).index,
    bot: bot,
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    timeSettings: fakeTimeSettings(),
    firmwareHardware: undefined,
  });

  const fakeResults = (): WizardResults => ({
    [WizardStepSlug.intro]: { timestamp: 0, answer: true, outcome: "done" },
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<SetupWizard {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("setup");
  });

  it("renders with results", () => {
    WizardData.update(fakeResults());
    const p = fakeProps();
    const wrapper = mount(<SetupWizard {...p} />);
    expect(wrapper.html()).toContain("fa-check");
  });

  it("renders when complete", () => {
    WizardData.setComplete();
    const p = fakeProps();
    const wrapper = mount(<SetupWizard {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("setup complete");
  });

  it("resets setup", () => {
    WizardData.update(fakeResults());
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    expect(wrapper.state().results).toEqual(fakeResults());
    wrapper.instance().reset();
    expect(wrapper.state().results).toEqual({});
  });

  it("toggles section", () => {
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    expect(wrapper.state().connectivity).toEqual(true);
    wrapper.instance().toggleSection(WizardSectionSlug.connectivity)();
    expect(wrapper.state().connectivity).toEqual(false);
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

  it("updates data", () => {
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    expect(wrapper.state().results).toEqual({});
    wrapper.instance().updateData(fakeResults())();
    expect(wrapper.state().results).toEqual(fakeResults());
  });

  it("updates data and progresses to next step", () => {
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    expect(wrapper.state().stepOpen).toEqual(WizardStepSlug.orderInfo);
    wrapper.instance().updateData(fakeResults(), WizardStepSlug.intro)();
    expect(wrapper.state().stepOpen).toEqual(WizardStepSlug.intro);
  });

  it("updates data and completes setup", () => {
    const wrapper = mount<SetupWizard>(<SetupWizard {...fakeProps()} />);
    expect(WizardData.getComplete()).toEqual(false);
    const doneResults: WizardResults = {};
    WIZARD_STEPS(undefined).map(step =>
      doneResults[step.slug] = { timestamp: 1, answer: true, outcome: undefined });
    wrapper.instance().updateData(doneResults)();
    expect(WizardData.getComplete()).toEqual(true);
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
