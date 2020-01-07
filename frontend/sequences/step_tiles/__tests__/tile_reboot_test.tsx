jest.mock("../../../api/crud", () => ({ editStep: jest.fn() }));

import { TileReboot, editTheRebootStep, rebootExecutor } from "../tile_reboot";
import { render } from "enzyme";
import React from "react";
import { StepParams } from "../../interfaces";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { editStep } from "../../../api/crud";
import { Reboot } from "farmbot";

const fakeProps = (): StepParams => {
  const currentSequence = fakeSequence();
  const resources = buildResourceIndex().index;

  return {
    currentSequence,
    currentStep: {
      kind: "reboot",
      args: {
        package: "farmbot_os"
      }
    },
    dispatch: jest.fn(),
    index: 1,
    resources,
    confirmStepDeletion: false,
  };
};

describe("<TileReboot/>", () => {
  it("renders", () => {
    const el = render(<TileReboot {...fakeProps()} />);
    const verbiage = el.text();
    expect(verbiage).toContain("Entire system");
    expect(verbiage).toContain("Just the Arduino");
  });

  it("crashes if the step is of the wrong `kind`", () => {
    const props = fakeProps();
    props.currentStep = { kind: "sync", args: {} };
    const boom = () => TileReboot(props);
    expect(boom).toThrowError();
  });

  it("edits the reboot step", () => {
    const props = fakeProps();
    const editFn = editTheRebootStep(props);
    editFn("arduino_firmware");
    expect(props.dispatch).toHaveBeenCalled();
    expect(editStep).toHaveBeenCalledWith({
      step: props.currentStep,
      index: props.index,
      sequence: props.currentSequence,
      executor: expect.any(Function),
    });
  });

  it("executes the executor", () => {
    const props = fakeProps();
    const step = props.currentStep as Reboot;
    step.args.package = "X";
    const fn = rebootExecutor("arduino_firmware");
    fn(step);
    expect(step.args.package).toBe("arduino_firmware");
  });
});
