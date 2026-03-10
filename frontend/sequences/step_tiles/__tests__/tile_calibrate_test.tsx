import React from "react";
import { render } from "@testing-library/react";
import { TileCalibrate } from "../tile_calibrate";
import { HardwareFlags, StepParams } from "../../interfaces";
import {
  fakeHardwareFlags, fakeStepParams,
} from "../../../__test_support__/fake_sequence_step_data";
import { Calibrate } from "farmbot";

describe("<TileCalibrate/>", () => {
  const fakeProps = (): StepParams<Calibrate> => ({
    ...fakeStepParams({ kind: "calibrate", args: { axis: "all" } }),
    hardwareFlags: fakeHardwareFlags(),
  });

  it("renders inputs", () => {
    const { container } = render(<TileCalibrate {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    const text = (container.textContent || "").toLowerCase();
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    ["x", "y", "z", "all"].forEach(axis => expect(text).toContain(axis));
    expect((inputs[1]).value).toEqual("x");
  });

  const CONFLICT_TEXT_BASE = "Hardware setting conflict";

  it("doesn't render warning", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    (p.hardwareFlags as HardwareFlags).findHomeEnabled.x = true;
    const { container } = render(<TileCalibrate {...p} />);
    expect(container.querySelector(".step-warning")).toBeNull();
  });

  it("renders warning: all axes", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "all";
    (p.hardwareFlags as HardwareFlags).findHomeEnabled.x = false;
    const { container } = render(<TileCalibrate {...p} />);
    const warning = container.querySelector(".step-warning") as HTMLElement;
    expect(warning).toBeTruthy();
    expect(warning.title).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("renders warning: one axis", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    (p.hardwareFlags as HardwareFlags).findHomeEnabled.x = false;
    const { container } = render(<TileCalibrate {...p} />);
    const warning = container.querySelector(".step-warning") as HTMLElement;
    expect(warning).toBeTruthy();
    expect(warning.title).toContain(CONFLICT_TEXT_BASE + ": x");
  });
});
