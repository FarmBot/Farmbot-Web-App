import { uniq } from "lodash";
import { fakeWizardStepResult } from "../../__test_support__/fake_state/resources";
import {
  WizardData, WizardStepSlug, WIZARD_SECTIONS, WIZARD_STEPS, WIZARD_STEP_SLUGS,
} from "../data";

describe("WizardData()", () => {
  it("counts completed steps", () => {
    const result0 = fakeWizardStepResult();
    result0.body.answer = undefined;
    const result1 = fakeWizardStepResult();
    result1.body.answer = true;
    const results = [result0, result1];
    expect(WizardData.doneCount(results)).toEqual(1);
  });

  it("sets setup complete", () => {
    WizardData.setComplete();
    expect(WizardData.getComplete()).toEqual(true);
  });

  it("resets setup progress", () => {
    WizardData.setComplete();
    WizardData.reset();
    expect(WizardData.getComplete()).toEqual(false);
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
