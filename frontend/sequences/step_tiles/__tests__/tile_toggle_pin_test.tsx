import React from "react";
import { render } from "@testing-library/react";
import { TileTogglePin } from "../tile_toggle_pin";
import { StepParams } from "../../interfaces";
import { TogglePin } from "farmbot";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileTogglePin/>", () => {
  const fakeProps = (): StepParams<TogglePin> => ({
    ...fakeStepParams({ kind: "toggle_pin", args: { pin_number: 13 } }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileTogglePin {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(1);
    expect(inputs[0]?.getAttribute("placeholder")).toEqual("Toggle Peripheral");
    expect(labels[0]?.textContent).toContain("Peripheral");
  });
});
