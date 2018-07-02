import * as React from "react";
import { mount } from "enzyme";
import { PeripheralForm } from "../peripheral_form";
import { TaggedPeripheral, SpecialStatus } from "../../../resources/tagged_resources";

describe("<PeripheralForm/>", function () {
  const dispatch = jest.fn();
  const peripherals: TaggedPeripheral[] = [
    {
      uuid: "Peripheral.2.2",
      specialStatus: SpecialStatus.SAVED,
      kind: "Peripheral",
      body: {
        id: 2,
        pin: 13,
        label: "GPIO 13 - LED"
      }
    },
    {
      uuid: "Peripheral.1.1",
      specialStatus: SpecialStatus.SAVED,
      kind: "Peripheral",
      body: {
        id: 1,
        pin: 2,
        label: "GPIO 2"
      }
    },
  ];

  it("renders a list of editable peripherals, in sorted order", function () {
    const form =mount<>(<PeripheralForm dispatch={dispatch}
      peripherals={peripherals} />);
    const inputs = form.find("input");
    const buttons = form.find("button");
    expect(inputs.at(0).props().value).toEqual("GPIO 2");
    inputs.at(0).simulate("change");
    expect(inputs.at(1).props().value).toEqual("2");
    inputs.at(1).simulate("change");
    buttons.at(0).simulate("click");
    expect(inputs.at(2).props().value).toEqual("GPIO 13 - LED");
    inputs.at(2).simulate("change");
    expect(inputs.at(3).props().value).toEqual("13");
    inputs.at(3).simulate("change");
    buttons.at(1).simulate("click");
    expect(dispatch).toHaveBeenCalledTimes(6);
  });
});
