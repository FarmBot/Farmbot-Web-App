const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({
  editStep: mockEditStep
}));

import {
  PIN_MODES,
  PIN_VALUES,
  currentModeSelection,
  currentValueSelection,
  setPinMode,
  setPinValue
} from "../tile_pin_support";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { WritePin } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("Pin tile support functions", () => {
  function fakeProps() {
    const currentStep: WritePin = {
      kind: "write_pin",
      args: {
        pin_number: 3,
        pin_value: 2,
        pin_mode: 1
      }
    };
    const currentSequence = fakeSequence();
    const dispatch = jest.fn();
    const index = 0;
    const resources = emptyState().index;
    return {
      currentSequence,
      currentStep,
      dispatch,
      index,
      resources
    };
  }

  it("PIN_MODES", () => {
    expect(PIN_MODES[0].value).toEqual(1);
    expect(PIN_MODES[0].label).toEqual("Analog");
  });

  it("PIN_VALUES", () => {
    expect(PIN_VALUES[0].value).toEqual(1);
    expect(PIN_VALUES[0].label).toEqual("ON");
  });

  it("currentModeSelection()", () => {
    const results = currentModeSelection(fakeProps().currentStep);
    expect(results.label).toEqual("Analog");
    expect(results.value).toEqual(1);
  });

  it("currentValueSelection()", () => {
    const step = fakeProps().currentStep;
    step.args.pin_value = 0;
    const results = currentValueSelection(step);
    expect(results.label).toEqual("OFF");
    expect(results.value).toEqual(0);
  });

  it("setPinMode()", () => {
    const p = fakeProps();
    p.currentStep.args.pin_mode = 0;
    p.currentStep.args.pin_value = 0;
    setPinMode(PIN_MODES[0], p);
    const step = p.currentStep;
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_mode).toEqual(1);
    expect(step.args.pin_value).toEqual(0);
  });

  it("setPinValue()", () => {
    const p = fakeProps();
    p.currentStep.args.pin_value = 5;
    setPinValue(PIN_VALUES[0], p);
    const step = p.currentStep;
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_value).toEqual(1);
  });
});
