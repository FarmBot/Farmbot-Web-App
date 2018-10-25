import * as React from "react";
import { TileWritePin } from "../tile_write_pin";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { WritePin } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer_support";

describe("<TileWritePin/>", () => {
  function fakeProps() {
    const currentStep: WritePin = {
      kind: "write_pin",
      args: {
        pin_number: 3,
        pin_value: 2,
        pin_mode: 1
      }
    };
    return {
      currentSequence: fakeSequence(),
      currentStep: currentStep,
      dispatch: jest.fn(),
      index: 0,
      resources: emptyState().index,
      confirmStepDeletion: false,
    };
  }

  it("renders inputs: Analog", () => {
    const wrapper = mount(<TileWritePin {...fakeProps()} />);
    const inputs = wrapper.find("input");
    const labels = wrapper.find("label");
    const buttons = wrapper.find("button");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(3);
    expect(buttons.length).toEqual(2);
    expect(inputs.first().props().placeholder).toEqual("Write Pin");
    expect(labels.at(0).text()).toEqual("Pin");
    expect(inputs.at(1).props().value).toEqual(2);
    expect(labels.at(1).text()).toEqual("Value");
    expect(labels.at(2).text()).toEqual("Pin Mode");
    expect(buttons.at(0).text()).toEqual("Pin 3");
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
    expect(inputs.first().props().placeholder).toEqual("Write Pin");
    expect(labels.at(0).text()).toEqual("Pin");
    expect(labels.at(1).text()).toEqual("Value");
    expect(buttons.at(0).text()).toEqual("Pin 3");
    expect(labels.at(2).text()).toEqual("Pin Mode");
    expect(buttons.at(1).text()).toEqual("ON");
  });
});
