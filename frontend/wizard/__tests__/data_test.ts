import { uniq } from "lodash";
import {
  WizardData, WizardStepSlug, WIZARD_SECTIONS, WIZARD_STEPS, WIZARD_STEP_SLUGS,
} from "../data";
import { WizardStepResult } from "../interfaces";

describe("WizardData()", () => {
  const fakeStepResult = (): WizardStepResult => ({
    timestamp: 0, answer: true, outcome: "done",
  });

  it("fetches results", () => {
    expect(WizardData.fetch()).toEqual({});
  });

  it("updates results", () => {
    const update = {
      [WizardStepSlug.intro]:
        fakeStepResult()
    };
    expect(WizardData.update(update)).toEqual(update);
  });

  it("gets missing number", () => {
    expect(WizardData.getOrderNumber()).toEqual("");
  });

  it("sets number", () => {
    WizardData.setOrderNumber("123");
    expect(WizardData.getOrderNumber()).toEqual("123");
  });

  it("counts completed steps", () => {
    WizardData.update({ [WizardStepSlug.intro]: fakeStepResult() });
    const result = fakeStepResult();
    result.answer = undefined;
    WizardData.update({ [WizardStepSlug.photo]: result });
    expect(WizardData.doneCount()).toEqual(1);
  });

  it("sets setup complete", () => {
    WizardData.setComplete();
    expect(WizardData.getComplete()).toEqual(true);
  });

  it("resets setup progress", () => {
    WizardData.update({ [WizardStepSlug.intro]: fakeStepResult() });
    WizardData.setComplete();
    WizardData.reset();
    expect(WizardData.getComplete()).toEqual(false);
    expect(WizardData.fetch()).toEqual({});
  });
});

describe("data check", () => {
  it("WIZARD_STEP_SLUGS()", () => {
    const slugs = Object.values(WizardStepSlug);
    const stepSlugs = WIZARD_STEP_SLUGS(undefined);
    expect(uniq(stepSlugs).length).toEqual(stepSlugs.length);
    expect(slugs.length).toEqual(stepSlugs.length);
  });

  it("has fewer steps for express", () => {
    const steps = WIZARD_STEPS(undefined);
    const expressSteps = WIZARD_STEPS("express_k10");
    expect(expressSteps.length).toBeLessThan(steps.length);
  });

  it("has fewer sections for express", () => {
    const sections = WIZARD_SECTIONS(undefined);
    const expressSections = WIZARD_SECTIONS("express_k10");
    expect(expressSections.length).toBeLessThan(sections.length);
  });
});
