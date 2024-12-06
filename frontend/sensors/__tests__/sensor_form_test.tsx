import React from "react";
import { shallow } from "enzyme";
import { SensorForm } from "../sensor_form";
import { SensorFormProps } from "../interfaces";
import { fakeSensor } from "../../__test_support__/fake_state/resources";
import {
  NameInputBox, PinDropdown, ModeDropdown,
} from "../../controls/pin_form_fields";

describe("<SensorForm/>", function () {
  const fakeProps = (): SensorFormProps => {
    const fakeSensor1 = fakeSensor();
    const fakeSensor2 = fakeSensor();
    fakeSensor1.body.id = 1;
    fakeSensor1.body.pin = 51;
    fakeSensor1.body.label = "GPIO 51";
    fakeSensor2.body.id = 2;
    fakeSensor2.body.pin = 50;
    fakeSensor2.body.label = "GPIO 50 - Moisture";
    return {
      dispatch: jest.fn(),
      sensors: [fakeSensor2, fakeSensor1]
    };
  };

  it("renders a list of editable sensors, in sorted order", () => {
    const form = shallow(<SensorForm {...fakeProps()} />);
    const sensorNames = form.find(NameInputBox);
    expect(sensorNames.at(0).props().value).toEqual("GPIO 51");
    expect(sensorNames.at(1).props().value).toEqual("GPIO 50 - Moisture");
    const sensorPins = form.find(PinDropdown);
    expect(sensorPins.at(0).props().value).toEqual(51);
    expect(sensorPins.at(1).props().value).toEqual(50);
    const sensorModes = form.find(ModeDropdown);
    expect(sensorModes.at(0).props().value).toEqual(0);
    expect(sensorModes.at(1).props().value).toEqual(0);
  });
});
