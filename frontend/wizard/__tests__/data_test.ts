import { uniq } from "lodash";
import { fakeWizardStepResult } from "../../__test_support__/fake_state/resources";
import { BooleanSetting } from "../../session_keys";
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

  it("has fewer steps for genesis v1.8", () => {
    const genesisV16 = WIZARD_STEPS({
      firmwareHardware: "farmduino_k16",
    });
    const genesisV18 = WIZARD_STEPS({
      firmwareHardware: "farmduino_k18",
    });
    expect(genesisV18.length).toBeLessThan(genesisV16.length);
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

  it("has the correct number of sections for express", () => {
    const sections = WIZARD_SECTIONS({
      firmwareHardware: undefined,
    });
    const expressSections = WIZARD_SECTIONS({
      firmwareHardware: "express_k10",
    });
    expect(expressSections.length).toEqual(sections.length - 1);
  });

  it("uses camera selection outcome for 3D map orientation", () => {
    const steps = WIZARD_STEPS({
      firmwareHardware: "farmduino_k18",
      getConfigValue: key => key == BooleanSetting.three_d_garden,
    });
    const mapOrientation = steps.find(step =>
      step.slug == WizardStepSlug.mapOrientation);
    expect(mapOrientation?.outcomes.map(outcome => outcome.slug))
      .toEqual(["cameraSelection"]);
  });

  it("keeps 2D map orientation outcomes when 3D is disabled", () => {
    const steps = WIZARD_STEPS({
      firmwareHardware: "farmduino_k18",
      getConfigValue: () => false,
    });
    const mapOrientation = steps.find(step =>
      step.slug == WizardStepSlug.mapOrientation);
    expect(mapOrientation?.outcomes.map(outcome => outcome.slug))
      .toEqual(["rotated", "incorrectOrigin"]);
  });
});
