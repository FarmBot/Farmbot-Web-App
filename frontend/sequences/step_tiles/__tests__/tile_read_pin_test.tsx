import React from "react";
import { render } from "@testing-library/react";
import { TileReadPin } from "../tile_read_pin";
import { ReadPin } from "farmbot";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileReadPin />", () => {
  const fakeProps = (): StepParams<ReadPin> => ({
    ...fakeStepParams({
      kind: "read_pin",
      args: {
        pin_number: 3,
        label: "pinlabel",
        pin_mode: 1
      }
    }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileReadPin {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    const buttons = container.querySelectorAll("button");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(3);
    expect(buttons.length).toEqual(2);
    expect(inputs[0]?.placeholder).toEqual("Read Sensor");
    expect(labels[0]?.textContent).toEqual("sensor or peripheral");
    expect(labels[1]?.textContent).toEqual("Mode");
    expect(labels[2]?.textContent).toEqual("Data Label");
    expect(inputs[1]?.value).toEqual("pinlabel");
    expect(buttons[0]?.textContent).toEqual("Pin 3");
  });
});
