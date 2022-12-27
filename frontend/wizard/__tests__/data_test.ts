import { uniq } from "lodash";
import { fakeWizardStepResult } from "../../__test_support__/fake_state/resources";
import {
  setupProgressString,
  WizardStepSlug, WIZARD_SECTIONS, WIZARD_STEPS, WIZARD_STEP_SLUGS,
} from "../data";

describe("setupProgressString()", () => {
  it("returns correct progress", () => {
    const result0 = fakeWizardStepResult();
    result0.body.answer = undefined;
    const result1 = fakeWizardStepResult();
    result1.body.answer = true;
    const results = [result0, result1];
    const progressSting = setupProgressString(results, {
      firmwareHardware: "arduino",
    });
    expect(progressSting).toContain("% complete");
    expect(progressSting).not.toEqual("100% complete");
  });
});

describe("data check", () => {
  it("WIZARD_STEP_SLUGS()", () => {
    const slugs = Object.values(WizardStepSlug);
    const stepSlugs = WIZARD_STEP_SLUGS({
      firmwareHardware: "farmduino_k16",
      getConfigValue: () => true,
    });
    expect(uniq(stepSlugs).length).toEqual(stepSlugs.length);
    expect(slugs.length).toEqual(stepSlugs.length);
  });

  it("has fewer steps for express v1.0", () => {
    const steps = WIZARD_STEPS({
      firmwareHardware: undefined,
    });
    const expressSteps = WIZARD_STEPS({
      firmwareHardware: "express_k10",
    });
    expect(expressSteps.length).toBeLessThan(steps.length);
  });

  it("has fewer steps for express v1.1", () => {
    const steps = WIZARD_STEPS({
      firmwareHardware: undefined,
    });
    const expressSteps = WIZARD_STEPS({
      firmwareHardware: "express_k11",
    });
    expect(expressSteps.length).toBeLessThan(steps.length);
  });

  it("has the same number of sections for express", () => {
    const sections = WIZARD_SECTIONS({
      firmwareHardware: undefined,
    });
    const expressSections = WIZARD_SECTIONS({
      firmwareHardware: "express_k10",
    });
    expect(expressSections.length).toEqual(sections.length);
  });
});
