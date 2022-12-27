import React from "react";
import { mount } from "enzyme";
import { WizardStepContainer, WizardStepHeader } from "../step";
import {
  WizardStep, WizardStepContainerProps, WizardStepHeaderProps,
} from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { bot } from "../../__test_support__/fake_state/bot";
import { WizardSectionSlug, WizardStepSlug } from "../data";
import { fakeWizardStepResult } from "../../__test_support__/fake_state/resources";

const fakeWizardStep = (): WizardStep => ({
  section: WizardSectionSlug.controls,
  slug: WizardStepSlug.intro,
  title: "Home",
  content: "content",
  outcomes: [{ slug: "nothing", description: "Nothing", tips: "Try again." }],
  component: () => <p>component</p>,
  question: "Did the FarmBot?",
});

describe("<WizardStepContainer />", () => {
  const fakeResult = () => {
    const result = fakeWizardStepResult().body;
    result.slug = WizardStepSlug.intro;
    result.answer = false;
    result.outcome = "nothing";
    result.updated_at = undefined;
    return result;
  };

  const fakeProps = (): WizardStepContainerProps => ({
    step: fakeWizardStep(),
    results: { [WizardStepSlug.intro]: fakeResult() },
    section: {
      slug: WizardSectionSlug.controls,
      title: "Title",
      steps: [fakeWizardStep()]
    },
    stepOpen: WizardStepSlug.intro,
    openStep: jest.fn(() => jest.fn()),
    setStepSuccess: jest.fn(() => jest.fn()),
    timeSettings: fakeTimeSettings(),
    resources: buildResourceIndex([]).index,
    bot: bot,
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.results = {};
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("content");
    expect(wrapper.text().toLowerCase()).not.toContain("try again");
  });

  it("renders done", () => {
    const p = fakeProps();
    const result = fakeResult();
    result.answer = true;
    result.outcome = undefined;
    result.updated_at = "2018-01-11T20:20:38.362Z";
    p.results = { [WizardStepSlug.intro]: result };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.html()).toContain("fa-check");
    expect(wrapper.text().toLowerCase()).toContain("completed");
  });

  it("renders troubleshooting tips", () => {
    const p = fakeProps();
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("try again");
  });

  it("renders additional troubleshooting tips", () => {
    const p = fakeProps();
    p.step.outcomes[0].detectedProblems = [
      { status: () => false, description: "problem" },
    ];
    p.step.outcomes[0].component = () => <p>component</p>;
    p.step.outcomes[0].video = "url";
    p.step.outcomes[0].firmwareNumberSettings =
      [{ key: "encoder_scaling_x", label: "" }];
    p.step.outcomes.push({
      slug: "hidden", description: "Hidden", tips: "Hidden.", hidden: true,
    });
    p.step.outcomes.push({
      slug: "one", description: "Two", tips: "Three.",
    });
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("try again");
    expect(wrapper.text().toLowerCase()).toContain("problem");
    expect(wrapper.text().toLowerCase()).toContain("component");
    expect(wrapper.text().toLowerCase()).not.toContain("hidden");
    expect(wrapper.text().toLowerCase()).not.toContain("three");
  });

  it("goes to step", () => {
    const p = fakeProps();
    p.step.outcomes[0].goToStep = { text: "goto", step: WizardStepSlug.intro };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("goto");
    const e = { stopPropagation: jest.fn() };
    wrapper.find("a").simulate("click", e);
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(p.openStep).toHaveBeenCalledWith(WizardStepSlug.intro);
  });

  it("renders manual entry", () => {
    const p = fakeProps();
    const result = fakeWizardStepResult().body;
    result.outcome = "other";
    p.results = { [WizardStepSlug.intro]: result };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("provide");
  });

  it("indicates when prerequisites not met", () => {
    const p = fakeProps();
    p.step.prerequisites = [{
      status: () => false,
      indicator: () => <p>not met</p>,
    }];
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("not met");
  });

  it("renders component", () => {
    const p = fakeProps();
    p.step.component = () => <p>component</p>;
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("component");
  });

  it("renders component without border", () => {
    const p = fakeProps();
    p.step.component = () => <p>component</p>;
    p.step.componentOptions = { border: false };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.html()).toContain("no-border");
  });

  it("renders component full width", () => {
    const p = fakeProps();
    p.step.component = () => <p>component</p>;
    p.step.componentOptions = { fullWidth: true };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.html()).toContain("full-width");
  });

  it("renders component with no background", () => {
    const p = fakeProps();
    p.step.component = () => <p>component</p>;
    p.step.componentOptions = { background: false };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.html()).toContain("no-background");
  });

  it("renders warning banner", () => {
    const p = fakeProps();
    p.step.warning = "warning";
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.html()).toContain("warning-banner");
    expect(wrapper.text()).toContain("warning");
  });

  it("renders video", () => {
    const p = fakeProps();
    p.step.video = "url";
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.html()).toContain("iframe");
    wrapper.setProps(p);
  });

  it("renders images", () => {
    const p = fakeProps();
    p.step.images = ["url"];
    p.step.outcomes[0].images = ["url"];
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.find("img").length).toEqual(2);
  });

  it("renders controls check", () => {
    const p = fakeProps();
    p.step.controlsCheckOptions = {};
    p.step.outcomes[0].detectedProblems = [
      { status: () => false, description: "problem" },
    ];
    p.step.outcomes[0].controlsCheckOptions = {};
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.find(".controls-check").length).toEqual(2);
  });

  it("renders pin bindings", () => {
    const p = fakeProps();
    p.step.pinBindingOptions = { editing: false };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.find(".box-top-buttons").length).toEqual(1);
  });
});

describe("<WizardStepHeader />", () => {
  const fakeProps = (): WizardStepHeaderProps => ({
    step: fakeWizardStep(),
    stepResult: undefined,
    section: {
      slug: WizardSectionSlug.controls,
      title: "Title",
      steps: [fakeWizardStep()]
    },
    stepOpen: WizardStepSlug.intro,
    openStep: jest.fn(),
    timeSettings: fakeTimeSettings(),
    showProgress: true,
  });

  it("shows progress", () => {
    const wrapper = mount(<WizardStepHeader {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("step 0 of 1");
  });
});
