import React from "react";
import { render } from "@testing-library/react";
import { SensorForm } from "../sensor_form";
import { SensorFormProps } from "../interfaces";
import { fakeSensor } from "../../__test_support__/fake_state/resources";

jest.mock("../../controls/pin_form_fields", () => ({
  NameInputBox: ({ value }: { value: string }) =>
    <div data-testid="name-input-box">{value}</div>,
  PinDropdown: ({ value }: { value: number }) =>
    <div data-testid="pin-dropdown">{value}</div>,
  ModeDropdown: ({ value }: { value: number }) =>
    <div data-testid="mode-dropdown">{value}</div>,
}));

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
    const { container } = render(<SensorForm {...fakeProps()} />);
    const sensorNames = container.querySelectorAll("[data-testid='name-input-box']");
    expect(sensorNames[0]?.textContent).toEqual("GPIO 51");
    expect(sensorNames[1]?.textContent).toEqual("GPIO 50 - Moisture");
    const sensorPins = container.querySelectorAll("[data-testid='pin-dropdown']");
    expect(sensorPins[0]?.textContent).toEqual("51");
    expect(sensorPins[1]?.textContent).toEqual("50");
    const sensorModes = container.querySelectorAll("[data-testid='mode-dropdown']");
    expect(sensorModes[0]?.textContent).toEqual("0");
    expect(sensorModes[1]?.textContent).toEqual("0");
  });
});
