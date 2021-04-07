jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  initSave: jest.fn(),
  destroy: jest.fn(),
}));

import { destroy, edit, initSave, save } from "../../api/crud";
import { fakeWizardStepResult } from "../../__test_support__/fake_state/resources";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import {
  addOrUpdateWizardStepResult,
  completeSetup,
  destroyAllWizardStepResults,
  resetSetup,
  setOrderNumber,
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
    ])(jest.fn()).catch(() => { });
    expect(destroy).toHaveBeenCalledTimes(0);
  });
});

describe("completeSetup()", () => {
  it("sets setup as completed", () => {
    const device = fakeDevice();
    completeSetup(device)?.(jest.fn());
    expect(edit).toHaveBeenCalledWith(device, {
      setup_completed_at: expect.stringContaining("Z"),
    });
    expect(save).toHaveBeenCalledWith(device.uuid);
  });
});

describe("resetSetup()", () => {
  it("sets setup as not completed", () => {
    const device = fakeDevice();
    resetSetup(device)?.(jest.fn());
    expect(edit).toHaveBeenCalledWith(device, {
      // eslint-disable-next-line no-null/no-null
      setup_completed_at: null,
    });
    expect(save).toHaveBeenCalledWith(device.uuid);
  });
});

describe("setOrderNumber()", () => {
  it("sets order number", () => {
    const device = fakeDevice();
    setOrderNumber(device, "123")?.(jest.fn());
    expect(edit).toHaveBeenCalledWith(device, {
      fb_order_number: "123",
    });
    expect(save).toHaveBeenCalledWith(device.uuid);
  });

  it("clears order number", () => {
    const device = fakeDevice();
    setOrderNumber(device, "")?.(jest.fn());
    expect(edit).toHaveBeenCalledWith(device, {
      // eslint-disable-next-line no-null/no-null
      fb_order_number: null,
    });
    expect(save).toHaveBeenCalledWith(device.uuid);
  });
});
