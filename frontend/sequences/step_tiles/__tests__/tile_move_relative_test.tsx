import React from "react";
import { TileMoveRelative } from "../tile_move_relative";
import { render } from "@testing-library/react";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileMoveRelative/>", () => {
  const fakeProps = (): StepParams => ({
    ...fakeStepParams({
      kind: "move_relative",
      args: {
        x: 1.1,
        y: 2,
        z: 3,
        speed: 100
      }
    }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileMoveRelative {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(inputs[0]?.placeholder).toEqual("Move Relative");
    expect(labels[0]?.textContent?.toLowerCase()).toEqual("x (mm)");
    expect(inputs[1]?.value).toEqual("1.1");
    expect(labels[1]?.textContent?.toLowerCase()).toEqual("y (mm)");
    expect(inputs[2]?.value).toEqual("2");
    expect(labels[2]?.textContent?.toLowerCase()).toEqual("z (mm)");
    expect(inputs[3]?.value).toEqual("3");
    expect(labels[3]?.textContent?.toLowerCase()).toEqual("speed (%)");
    expect(inputs[4]?.value).toEqual("100");
  });
});
