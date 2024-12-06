import React from "react";
import { mount } from "enzyme";
import { PeripheralForm } from "../peripheral_form";
import { TaggedPeripheral, SpecialStatus } from "farmbot";
import { PeripheralFormProps } from "../interfaces";
import { NameInputBox, PinDropdown } from "../../pin_form_fields";

describe("<PeripheralForm/>", () => {
  const dispatch = jest.fn();
  const peripherals: TaggedPeripheral[] = [
    {
      uuid: "Peripheral.2.2",
      specialStatus: SpecialStatus.SAVED,
      kind: "Peripheral",
      body: {
        id: 2,
        pin: 13,
        label: "GPIO 13 - LED",
        mode: 0,
      }
    },
    {
      uuid: "Peripheral.1.1",
      specialStatus: SpecialStatus.SAVED,
      kind: "Peripheral",
      body: {
        id: 1,
        pin: 2,
        label: "GPIO 2",
        mode: 0,
      }
    },
  ];
  const fakeProps = (): PeripheralFormProps => ({ dispatch, peripherals });

  it("renders a list of editable peripherals, in sorted order", () => {
    const form = mount(<PeripheralForm {...fakeProps()} />);
    const sensorNames = form.find(NameInputBox);
    expect(sensorNames.at(0).props().value).toEqual("GPIO 2");
    expect(sensorNames.at(1).props().value).toEqual("GPIO 13 - LED");
    const sensorPins = form.find(PinDropdown);
    expect(sensorPins.at(0).props().value).toEqual(2);
    expect(sensorPins.at(1).props().value).toEqual(13);
  });
});
