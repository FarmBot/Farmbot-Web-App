import React from "react";
import { render } from "@testing-library/react";
import { WizardStepContainer, WizardStepHeader } from "../step";
import {
  WizardStep, WizardStepContainerProps, WizardStepHeaderProps,
} from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { bot } from "../../__test_support__/fake_state/bot";
import { WizardSectionSlug, WizardStepSlug } from "../data";
import {
  fakeTool,
  fakeToolSlot, fakeWizardStepResult,
} from "../../__test_support__/fake_state/resources";
import {
  actRenderer,
  createRenderer,
} from "../../__test_support__/test_renderer";

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
    const { container } = render(<WizardStepContainer {...p} />);
    const text = container.textContent?.toLowerCase() || "";
    expect(text).toContain("content");
    expect(text).not.toContain("try again");
  });

  it("renders done", () => {
    const p = fakeProps();
    const result = fakeResult();
    result.answer = true;
    result.outcome = undefined;
    result.updated_at = "2018-01-11T20:20:38.362Z";
    p.results = { [WizardStepSlug.intro]: result };
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.innerHTML).toContain("fa-check");
    expect(container.textContent?.toLowerCase()).toContain("completed");
  });

  it("renders troubleshooting tips", () => {
    const p = fakeProps();
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("try again");
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
    const { container } = render(<WizardStepContainer {...p} />);
    const text = container.textContent?.toLowerCase() || "";
    expect(text).toContain("try again");
    expect(text).toContain("problem");
    expect(text).toContain("component");
    expect(text).not.toContain("hidden");
    expect(text).not.toContain("three");
  });

  it("goes to step", () => {
    const p = fakeProps();
    p.step.outcomes[0].goToStep = { text: "goto", step: WizardStepSlug.intro };
    const wrapper = createRenderer(<WizardStepContainer {...p} />);
    const button = wrapper.root.findByProps({ className: "fb-button" });
    expect(button.children.join("").toLowerCase()).toContain("goto");
    const e = { stopPropagation: jest.fn() };
    actRenderer(() => {
      button.props.onClick(e);
    });
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(p.openStep).toHaveBeenCalledWith(WizardStepSlug.intro);
  });

  it("renders manual entry", () => {
    const p = fakeProps();
    const result = fakeWizardStepResult().body;
    result.outcome = "other";
    p.results = { [WizardStepSlug.intro]: result };
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("provide");
  });

  it("indicates when prerequisites not met", () => {
    const p = fakeProps();
    p.step.prerequisites = [{
      status: () => false,
      indicator: () => <p>not met</p>,
    }];
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("not met");
  });

  it("renders component", () => {
    const p = fakeProps();
    p.step.component = () => <p>component</p>;
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("component");
  });

  it("renders component without border", () => {
    const p = fakeProps();
    p.step.component = () => <p>component</p>;
    p.step.componentOptions = { border: false };
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.innerHTML).toContain("no-border");
  });

  it("renders component full width", () => {
    const p = fakeProps();
    p.step.component = () => <p>component</p>;
    p.step.componentOptions = { fullWidth: true };
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.innerHTML).toContain("full-width");
  });

  it("renders component with no background", () => {
    const p = fakeProps();
    p.step.component = () => <p>component</p>;
    p.step.componentOptions = { background: false };
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.innerHTML).toContain("no-background");
  });

  it("renders warning banner", () => {
    const p = fakeProps();
    p.step.warning = "warning";
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.innerHTML).toContain("warning-banner");
    expect(container.textContent).toContain("warning");
  });

  it("renders video", () => {
    const p = fakeProps();
    p.step.video = "url";
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.innerHTML).toContain("iframe");
  });

  it("renders images", () => {
    const p = fakeProps();
    p.step.images = ["url"];
    p.step.outcomes[0].images = ["url"];
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.querySelectorAll("img").length).toEqual(2);
  });

  it("renders controls check", () => {
    const p = fakeProps();
    p.step.controlsCheckOptions = {};
    p.step.outcomes[0].detectedProblems = [
      { status: () => false, description: "problem" },
    ];
    p.step.outcomes[0].controlsCheckOptions = {};
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.querySelectorAll(".controls-check").length).toEqual(2);
  });

  it("renders slot rows", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([fakeToolSlot()]).index;
    p.step.slotInputRows = [0];
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.querySelectorAll(".slot-coordinates").length).toEqual(1);
  });

  it("renders slot tool dropdown rows", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([fakeToolSlot(), fakeTool()]).index;
    p.step.slotDropdownRows = [0];
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.querySelectorAll(".slot-coordinates").length).toEqual(1);
  });

  it("renders pin bindings", () => {
    const p = fakeProps();
    p.step.pinBindingOptions = { editing: false };
    const { container } = render(<WizardStepContainer {...p} />);
    expect(container.querySelectorAll(".electronics-box-top").length)
      .toEqual(1);
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
    const { container } = render(<WizardStepHeader {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("step 0 of 1");
  });
});
