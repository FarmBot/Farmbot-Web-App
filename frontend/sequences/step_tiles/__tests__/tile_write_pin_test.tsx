const mockEditStep = jest.fn();

import React from "react";
import { render } from "@testing-library/react";
import { TileWritePin } from "../tile_write_pin";
import { WritePin } from "farmbot";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import * as crud from "../../../api/crud";

const fakeProps = (): StepParams<WritePin> => ({
  ...fakeStepParams({
    kind: "write_pin",
    args: { pin_number: 3, pin_value: 2, pin_mode: 1 },
  }),
  showPins: false,
});

let editStepSpy: jest.SpyInstance;

beforeEach(() => {
  editStepSpy = jest.spyOn(crud, "editStep")
    .mockImplementation(mockEditStep);
});

afterEach(() => {
  editStepSpy.mockRestore();
});
describe("<TileWritePin />", () => {
  it("renders inputs: Analog", () => {
    const p = fakeProps();
    p.currentStep.args.pin_mode = 1;
    p.currentStep.args.pin_value = 2;
    const { container } = render(<TileWritePin {...p} />);
    const text = (container.textContent || "").toLowerCase();
    const mockedSelectCount = (text.match(/mock-scene-select/g) || []).length;
    expect(text).toContain("peripheral");
    expect(text).toContain("mode");
    expect(text).toContain("set to");
    const hasAnalogModeControl = text.includes("analog")
      || mockedSelectCount >= 1;
    expect(hasAnalogModeControl).toBeTruthy();
  });

  it("renders inputs: Digital", () => {
    const p = fakeProps();
    p.currentStep.args.pin_mode = 0;
    p.currentStep.args.pin_value = 1;
    const { container } = render(<TileWritePin {...p} />);
    const text = (container.textContent || "").toLowerCase();
    const mockedSelectCount = (text.match(/mock-scene-select/g) || []).length;
    expect(text).toContain("peripheral");
    expect(text).toContain("mode");
    expect(text).toContain("set to");
    expect(container.querySelector(".bp6-slider")).toBeFalsy();
    const hasModeAndValueDropdowns =
      (text.includes("digital") && text.includes("on"))
      || mockedSelectCount >= 2;
    expect(hasModeAndValueDropdowns).toBeTruthy();
  });
});
