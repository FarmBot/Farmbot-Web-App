import * as crud from "../../api/crud";
import { fakeWizardStepResult } from "../../__test_support__/fake_state/resources";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import {
  addOrUpdateWizardStepResult,
  completeSetup,
  destroyAllWizardStepResults,
  resetSetup,
  setOrderNumber,
} from "../actions";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
});

afterEach(() => {
  editSpy.mockRestore();
  saveSpy.mockRestore();
  initSaveSpy.mockRestore();
  destroySpy.mockRestore();
});
describe("addOrUpdateWizardStepResult()", () => {
  it("adds result", () => {
    const result = fakeWizardStepResult();
    addOrUpdateWizardStepResult([], result.body)(jest.fn());
    expect(crud.initSave).toHaveBeenCalledWith("WizardStepResult", result.body);
  });

  it("edits result", () => {
    const result = fakeWizardStepResult();
    addOrUpdateWizardStepResult([result], result.body)(jest.fn());
    expect(crud.edit).toHaveBeenCalledWith(result, result.body);
    expect(crud.save).toHaveBeenCalledWith(result.uuid);
  });
});

describe("destroyAllWizardStepResults()", () => {
  it("destroys results", () => {
    window.confirm = () => true;
    destroyAllWizardStepResults([
      fakeWizardStepResult(),
      fakeWizardStepResult(),
    ])(jest.fn());
    expect(crud.destroy).toHaveBeenCalledTimes(2);
  });

  it("doesn't destroy results", () => {
    window.confirm = () => false;
    destroyAllWizardStepResults([
      fakeWizardStepResult(),
      fakeWizardStepResult(),
    ])(jest.fn()).catch(() => { });
    expect(crud.destroy).toHaveBeenCalledTimes(0);
  });
});

describe("completeSetup()", () => {
  it("sets setup as completed", () => {
    const device = fakeDevice();
    completeSetup(device)?.(jest.fn());
    expect(crud.edit).toHaveBeenCalledWith(device, {
      setup_completed_at: expect.stringContaining("Z"),
    });
    expect(crud.save).toHaveBeenCalledWith(device.uuid);
  });
});

describe("resetSetup()", () => {
  it("sets setup as not completed", () => {
    const device = fakeDevice();
    resetSetup(device)?.(jest.fn());
    expect(crud.edit).toHaveBeenCalledWith(device, {
      // eslint-disable-next-line no-null/no-null
      setup_completed_at: null,
    });
    expect(crud.save).toHaveBeenCalledWith(device.uuid);
  });
});

describe("setOrderNumber()", () => {
  it("sets order number", () => {
    const device = fakeDevice();
    setOrderNumber(device, "123")?.(jest.fn());
    expect(crud.edit).toHaveBeenCalledWith(device, {
      fb_order_number: "123",
    });
    expect(crud.save).toHaveBeenCalledWith(device.uuid);
  });

  it("clears order number", () => {
    const device = fakeDevice();
    setOrderNumber(device, "")?.(jest.fn());
    expect(crud.edit).toHaveBeenCalledWith(device, {
      // eslint-disable-next-line no-null/no-null
      fb_order_number: null,
    });
    expect(crud.save).toHaveBeenCalledWith(device.uuid);
  });
});
