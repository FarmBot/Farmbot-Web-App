import React from "react";
import { TileFindHome } from "../tile_find_home";
import { render } from "@testing-library/react";
import {
  fakeHardwareFlags, fakeStepParams,
} from "../../../__test_support__/fake_sequence_step_data";
import { StepParams } from "../../interfaces";
import { FindHome } from "farmbot";

describe("<TileFindHome/>", () => {
  const fakeProps = (): StepParams<FindHome> => ({
    ...fakeStepParams({ kind: "find_home", args: { speed: 100, axis: "all" } }),
    hardwareFlags: fakeHardwareFlags(),
  });

  it("renders inputs", () => {
    const { container } = render(<TileFindHome {...fakeProps()} />);
    const labels = Array.from(container.querySelectorAll("label"))
      .map(label => (label.textContent || "").toLowerCase().trim());
    expect(labels).toEqual(expect.arrayContaining(["x", "y", "z", "all"]));

    const xInput =
      container.querySelector("input[type='radio'][name='x']") as HTMLInputElement;
    expect(xInput).toBeTruthy();
    expect(xInput.checked).toBeFalsy();

    const yInput =
      container.querySelector("input[type='radio'][name='y']") as HTMLInputElement;
    expect(yInput).toBeTruthy();
    expect(yInput.checked).toBeFalsy();

    const zInput =
      container.querySelector("input[type='radio'][name='z']") as HTMLInputElement;
    expect(zInput).toBeTruthy();
    expect(zInput.checked).toBeFalsy();

    const allInput =
      container.querySelector("input[type='radio'][name='all']") as HTMLInputElement;
    expect(allInput).toBeTruthy();
    expect(allInput.checked).toBeTruthy();
  });

  const CONFLICT_TEXT_BASE = "Hardware setting conflict";

  it("doesn't render warning", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    p.hardwareFlags && (p.hardwareFlags.findHomeEnabled.x = true);
    const { container } = render(<TileFindHome {...p} />);
    expect(container.querySelector(".step-warning")).toBeNull();
  });

  it("renders warning: all axes", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "all";
    p.hardwareFlags && (p.hardwareFlags.findHomeEnabled.x = false);
    const { container } = render(<TileFindHome {...p} />);
    const warning = container.querySelector(".step-warning") as HTMLElement;
    expect(warning).toBeTruthy();
    expect(warning.title).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("renders warning: one axis", () => {
    const p = fakeProps();
    p.currentStep.args.axis = "x";
    p.hardwareFlags && (p.hardwareFlags.findHomeEnabled.x = false);
    const { container } = render(<TileFindHome {...p} />);
    const warning = container.querySelector(".step-warning") as HTMLElement;
    expect(warning).toBeTruthy();
    expect(warning.title).toContain(CONFLICT_TEXT_BASE + ": x");
  });
});
