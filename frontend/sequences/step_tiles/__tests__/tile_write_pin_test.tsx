const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({ editStep: mockEditStep }));

import React from "react";
import { mount } from "enzyme";
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

describe("<TileWritePin />", () => {
  it("renders inputs: Analog", () => {
    const wrapper = mount(<TileWritePin {...fakeProps()} />);
    const inputs = wrapper.find("input");
    const labels = wrapper.find("label");
    const buttons = wrapper.find("button");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(3);
    expect(buttons.length).toEqual(2);
    expect(inputs.first().props().placeholder).toEqual("Control Peripheral");
    expect(labels.at(0).text()).toEqual("Peripheral");
    expect(labels.at(1).text()).toEqual("Mode");
    expect(buttons.at(0).text()).toEqual("Pin 3");
    expect(labels.at(2).text()).toEqual("set to");
    const sliderLabels = wrapper.find(".bp6-slider-label");
    [0, 255, 2].map((value, index) =>
      expect(sliderLabels.at(index).text()).toEqual("" + value));
  });

  it("renders inputs: Digital", () => {
    const p = fakeProps();
    p.currentStep.args.pin_mode = 0;
    p.currentStep.args.pin_value = 1;
    const wrapper = mount(<TileWritePin {...p} />);
    const inputs = wrapper.find("input");
    const labels = wrapper.find("label");
    const buttons = wrapper.find("button");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(3);
    expect(buttons.length).toEqual(3);
    expect(inputs.first().props().placeholder).toEqual("Control Peripheral");
    expect(labels.at(0).text()).toEqual("Peripheral");
    expect(buttons.at(0).text()).toEqual("Pin 3");
    expect(labels.at(1).text()).toEqual("Mode");
    expect(buttons.at(1).text()).toEqual("Digital");
    expect(labels.at(2).text()).toEqual("set to");
    expect(buttons.at(2).text()).toEqual("ON");
  });
});
