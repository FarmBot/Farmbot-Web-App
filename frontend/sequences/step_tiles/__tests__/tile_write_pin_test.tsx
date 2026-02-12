const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({ editStep: mockEditStep }));

import React from "react";
import { render } from "@testing-library/react";
import { TileWritePin } from "../tile_write_pin";
import { WritePin } from "farmbot";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

const fakeProps = (): StepParams<WritePin> => ({
  ...fakeStepParams({
    kind: "write_pin",
    args: { pin_number: 3, pin_value: 2, pin_mode: 1 },
  }),
  showPins: false,
});

afterAll(() => {
  jest.unmock("../../../api/crud");
});
describe("<TileWritePin />", () => {
  it("renders inputs: Analog", () => {
    const { container } = render(<TileWritePin {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    const buttons = container.querySelectorAll("button");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(3);
    expect(buttons.length).toEqual(2);
    expect(inputs[0]?.getAttribute("placeholder")).toEqual("Control Peripheral");
    expect(labels[0]?.textContent).toEqual("Peripheral");
    expect(labels[1]?.textContent).toEqual("Mode");
    expect(buttons[0]?.textContent).toEqual("Pin 3");
    expect(labels[2]?.textContent).toEqual("set to");
    const sliderLabels = container.querySelectorAll(".bp6-slider-label");
    [0, 255, 2].map((value, index) =>
      expect(sliderLabels[index]?.textContent).toEqual("" + value));
  });

  it("renders inputs: Digital", () => {
    const p = fakeProps();
    p.currentStep.args.pin_mode = 0;
    p.currentStep.args.pin_value = 1;
    const { container } = render(<TileWritePin {...p} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    const buttons = container.querySelectorAll("button");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(3);
    expect(buttons.length).toEqual(3);
    expect(inputs[0]?.getAttribute("placeholder")).toEqual("Control Peripheral");
    expect(labels[0]?.textContent).toEqual("Peripheral");
    expect(buttons[0]?.textContent).toEqual("Pin 3");
    expect(labels[1]?.textContent).toEqual("Mode");
    expect(buttons[1]?.textContent).toEqual("Digital");
    expect(labels[2]?.textContent).toEqual("set to");
    expect(buttons[2]?.textContent).toEqual("ON");
  });
});
