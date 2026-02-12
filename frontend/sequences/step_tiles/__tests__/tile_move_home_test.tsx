import React from "react";
import { render } from "@testing-library/react";
import { TileMoveHome } from "../tile_move_home";
import { Home } from "farmbot";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileMoveHome/>", () => {
  const fakeProps = (): StepParams<Home> => ({
    ...fakeStepParams({ kind: "home", args: { axis: "all", speed: 100 } }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileMoveHome {...fakeProps()} />);
    const labels = Array.from(container.querySelectorAll("label"))
      .map(label => (label.textContent || "").toLowerCase().trim());
    expect(labels).toEqual(expect.arrayContaining(["x", "y", "z", "all", "speed"]));

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
});
