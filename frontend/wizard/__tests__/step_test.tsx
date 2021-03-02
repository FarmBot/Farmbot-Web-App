import React from "react";
import { mount } from "enzyme";
import { WizardStepContainer } from "../step";
import { WizardStep, WizardStepContainerProps } from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { bot } from "../../__test_support__/fake_state/bot";
import { WizardSectionSlug, WizardStepSlug } from "../data";

describe("<WizardStepContainer />", () => {
  const fakeProps = (): WizardStepContainerProps => {
    const fakeWizardStep = (): WizardStep => ({
      section: WizardSectionSlug.axes,
      slug: WizardStepSlug.intro,
      title: "Home",
      content: "content",
      outcomes: [{ slug: "nothing", description: "Nothing", tips: "Try again." }],
      component: () => <p>component</p>,
      question: "Did the FarmBot?",
    });
    return {
      step: fakeWizardStep(),
      results: {},
      section: {
        slug: WizardSectionSlug.axes,
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
    };
  };

  it("renders", () => {
    const wrapper = mount(<WizardStepContainer {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("content");
    expect(wrapper.text().toLowerCase()).not.toContain("try again");
  });

  it("renders done", () => {
    const p = fakeProps();
    p.results = {
      [WizardStepSlug.intro]: {
        timestamp: 1, answer: true, outcome: undefined,
      }
    };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.html()).toContain("fa-check");
  });

  it("renders troubleshooting tips", () => {
    const p = fakeProps();
    p.results = {
      [WizardStepSlug.intro]: {
        timestamp: 1, answer: false, outcome: "nothing",
      }
    };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("try again");
  });

  it("renders additional troubleshooting tips", () => {
    const p = fakeProps();
    p.step.outcomes[0].detectedProblems = [
      { status: () => false, description: "problem" },
    ];
    p.step.outcomes[0].component = () => <p>component</p>;
    p.step.outcomes.push({
      slug: "hidden", description: "Hidden", tips: "Hidden.", hidden: true,
    });
    p.step.outcomes.push({
      slug: "one", description: "Two", tips: "Three.",
    });
    p.results = {
      [WizardStepSlug.intro]: {
        timestamp: 1, answer: false, outcome: "nothing",
      }
    };
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
    p.results = {
      [WizardStepSlug.intro]: {
        timestamp: 1, answer: false, outcome: "nothing",
      }
    };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("goto");
    const e = { stopPropagation: jest.fn() };
    wrapper.find("a").simulate("click", e);
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(p.openStep).toHaveBeenCalledWith(WizardStepSlug.intro);
  });

  it("renders manual entry", () => {
    const p = fakeProps();
    p.results = {
      [WizardStepSlug.intro]: {
        timestamp: 1, answer: false, outcome: "other",
      }
    };
    const wrapper = mount(<WizardStepContainer {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("provide");
  });
});
