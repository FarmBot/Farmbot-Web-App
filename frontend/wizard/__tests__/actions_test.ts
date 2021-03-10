jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  initSave: jest.fn(),
  destroy: jest.fn(),
}));

import { destroy, edit, initSave, save } from "../../api/crud";
import { fakeWizardStepResult } from "../../__test_support__/fake_state/resources";
import {
  addOrUpdateWizardStepResult,
  destroyAllWizardStepResults,
} from "../actions";

describe("addOrUpdateWizardStepResult()", () => {
  it("adds result", () => {
    const result = fakeWizardStepResult();
    addOrUpdateWizardStepResult([], result.body)(jest.fn());
    expect(initSave).toHaveBeenCalledWith("WizardStepResult", result.body);
  });

  it("edits result", () => {
    const result = fakeWizardStepResult();
    addOrUpdateWizardStepResult([result], result.body)(jest.fn());
    expect(edit).toHaveBeenCalledWith(result, result.body);
    expect(save).toHaveBeenCalledWith(result.uuid);
  });
});

describe("destroyAllWizardStepResults()", () => {
  it("destroys results", () => {
    window.confirm = () => true;
    destroyAllWizardStepResults([
      fakeWizardStepResult(),
      fakeWizardStepResult(),
    ])(jest.fn());
    expect(destroy).toHaveBeenCalledTimes(2);
  });

  it("doesn't destroy results", () => {
    window.confirm = () => false;
    destroyAllWizardStepResults([
      fakeWizardStepResult(),
      fakeWizardStepResult(),
    ])(jest.fn());
    expect(destroy).toHaveBeenCalledTimes(0);
  });
});
