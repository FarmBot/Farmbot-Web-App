const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({ editStep: mockEditStep }));

import * as React from "react";
import { TileWritePin, WritePinStep } from "../tile_write_pin";
import { mount, shallow } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { WritePin } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";
import { FBSelect } from "../../../ui";

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
      shouldDisplay: () => false,
      showPins: false,
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
    expect(inputs.first().props().placeholder).toEqual("Control Peripheral");
    expect(labels.at(0).text()).toEqual("Peripheral");
    expect(inputs.at(1).props().value).toEqual(2);
    expect(labels.at(1).text()).toEqual("Mode");
    expect(buttons.at(0).text()).toEqual("Pin 3");
    expect(labels.at(2).text()).toEqual("set to");
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

  it("changes pin value", () => {
    const p = fakeProps();
    p.currentStep.args.pin_mode = 0;
    p.currentStep.args.pin_value = 1;
    const wrapper = mount<WritePinStep>(<WritePinStep {...p} />);
    const pinValueSelect = shallow(
      <div>{wrapper.instance().PinValueField()}</div>);
    pinValueSelect.find(FBSelect).last().simulate("change", {
      label: "123", value: 123
    });
    const step = p.currentStep;
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_value).toEqual(123);
  });

  it("throws when not a WritePin step", () => {
    console.error = jest.fn();
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.currentStep.kind = "wrong_step" as any;
    expect(() => mount(<TileWritePin {...p} />))
      .toThrow("Not a write_pin block.");
  });
});
