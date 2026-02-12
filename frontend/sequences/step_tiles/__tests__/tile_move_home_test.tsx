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
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toEqual(6);
    expect(labels.length).toEqual(5);
    expect(inputs[0]?.placeholder).toEqual("Move to Home");
    expect(labels[0]?.textContent).toContain("x");
    expect(inputs[1]?.value).toEqual("x");
  });
});
