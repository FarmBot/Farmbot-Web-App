jest.mock("../../../api/crud", () => ({ editStep: jest.fn() }));

import { TileReboot, editTheRebootStep, rebootExecutor } from "../tile_reboot";
import { render } from "enzyme";
import React from "react";
import { StepParams } from "../../interfaces";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { editStep } from "../../../api/crud";
import { Reboot } from "farmbot";
import { Content } from "../../../constants";

const fakeProps = (): StepParams => ({
  currentSequence: fakeSequence(),
  currentStep: {
    kind: "reboot",
    args: {
      package: "farmbot_os"
    }
  },
  dispatch: jest.fn(),
  index: 1,
  resources: buildResourceIndex().index,
  confirmStepDeletion: false,
});

describe("<TileReboot/>", () => {
  it("renders", () => {
    const block = render(<TileReboot {...fakeProps()} />);
    expect(block.text()).toContain(Content.REBOOT_STEP);
  });

  it("crashes if the step is of the wrong `kind`", () => {
    const p = fakeProps();
    p.currentStep = { kind: "sync", args: {} };
    const boom = () => TileReboot(p);
    expect(boom).toThrowError();
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
    const step = p.currentStep as Reboot;
    step.args.package = "X";
    const fn = rebootExecutor("arduino_firmware");
    fn(step);
    expect(step.args.package).toBe("arduino_firmware");
  });
});
