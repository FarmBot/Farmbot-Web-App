import React from "react";
import { render } from "@testing-library/react";
import { TileSystemAction } from "../tile_system_action";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import { Sync } from "farmbot";

describe("<TileSystemAction/>", () => {
  const fakeProps = (): StepParams<Sync> => ({
    ...fakeStepParams({ kind: "sync", args: {} }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileSystemAction {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(0);
    expect(inputs[0]?.getAttribute("placeholder")).toEqual("Sync");
  });
});
