import React from "react";
import { render } from "@testing-library/react";
import { TileSetZero } from "../tile_set_zero";
import { Zero } from "farmbot";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileSetZero/>", () => {
  const fakeProps = (): StepParams<Zero> => ({
    ...fakeStepParams({ kind: "zero", args: { axis: "all" } }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileSetZero {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(labels[0]?.textContent).toContain("x");
    expect((inputs[1] as HTMLInputElement | undefined)?.value).toEqual("x");
  });
});
