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
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect((inputs[0] as HTMLInputElement).placeholder).toEqual("Find Home");
    expect((labels[0] as HTMLElement).textContent).toContain("x");
    expect((inputs[1] as HTMLInputElement).checked).toBeFalsy();
    expect((labels[1] as HTMLElement).textContent).toContain("y");
    expect((inputs[2] as HTMLInputElement).checked).toBeFalsy();
    expect((labels[2] as HTMLElement).textContent).toContain("z");
    expect((inputs[3] as HTMLInputElement).checked).toBeFalsy();
    expect((labels[3] as HTMLElement).textContent).toContain("all");
    expect((inputs[4] as HTMLInputElement).checked).toBeTruthy();
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
