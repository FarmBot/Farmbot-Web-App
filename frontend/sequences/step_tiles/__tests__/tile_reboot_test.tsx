let mockDev = false;
import * as devSupport from "../../../settings/dev/dev_support";

import React from "react";
import { render } from "@testing-library/react";
import { TileReboot, editTheRebootStep, rebootExecutor } from "../tile_reboot";
import { StepParams } from "../../interfaces";
import { editStep } from "../../../api/crud";
import * as crud from "../../../api/crud";
import { Reboot } from "farmbot";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileReboot />", () => {
  let futureFeaturesEnabledSpy: jest.SpyInstance;
  let editStepSpy: jest.SpyInstance;

  beforeEach(() => {
    mockDev = false;
    futureFeaturesEnabledSpy =
      jest.spyOn(devSupport.DevSettings, "futureFeaturesEnabled")
        .mockImplementation(() => mockDev);
    editStepSpy = jest.spyOn(crud, "editStep")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    futureFeaturesEnabledSpy.mockRestore();
    editStepSpy.mockRestore();
  });

  const fakeProps = (): StepParams<Reboot> => ({
    ...fakeStepParams({
      kind: "reboot",
      args: {
        package: "farmbot_os"
      }
    }),
  });

  it("renders", () => {
    const { container } = render(<TileReboot {...fakeProps()} />);
    expect((container.textContent || "").toLowerCase()).not.toContain("arduino");
  });

  it("renders package selector", () => {
    mockDev = true;
    const { container } = render(<TileReboot {...fakeProps()} />);
    expect((container.textContent || "").toLowerCase()).toContain("arduino");
  });

  it("edits the reboot step", () => {
    const p = fakeProps();
    const editFn = editTheRebootStep(p);
    editFn("arduino_firmware");
    expect(p.dispatch).toHaveBeenCalled();
    expect(editStep).toHaveBeenCalledWith({
      step: p.currentStep,
      index: p.index,
      sequence: p.currentSequence,
      executor: expect.any(Function),
    });
  });

  it("executes the executor", () => {
    const p = fakeProps();
    const step = p.currentStep;
    step.args.package = "X";
    const fn = rebootExecutor("arduino_firmware");
    fn(step);
    expect(step.args.package).toBe("arduino_firmware");
  });
});
