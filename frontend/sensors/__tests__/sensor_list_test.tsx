const mockDevice = { readPin: jest.fn((_) => Promise.resolve()) };

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { SensorList } from "../sensor_list";
import { Pins } from "farmbot";
import { fakeSensor } from "../../__test_support__/fake_state/resources";
import { SensorListProps } from "../interfaces";
import * as deviceModule from "../../device";

beforeEach(() => {
  jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
});

describe("<SensorList/>", function () {
  const fakeProps = (): SensorListProps => {
    const pins: Pins = {
      50: {
        mode: 1,
        value: 500,
      },
      51: {
        mode: 0,
        value: 1,
      },
      52: {
        mode: 0,
        value: 1,
      },
      53: {
        mode: 0,
        value: 0,
      },
    };
    const fakeSensor1 = fakeSensor();
    const fakeSensor2 = fakeSensor();
    const fakeSensor3 = fakeSensor();
    const fakeSensor4 = fakeSensor();
    fakeSensor1.body.id = 1;
    fakeSensor1.body.pin = 51;
    fakeSensor1.body.mode = 0;
    fakeSensor1.body.label = "GPIO 51";
    fakeSensor2.body.id = 2;
    fakeSensor2.body.pin = 50;
    fakeSensor2.body.mode = 1;
    fakeSensor2.body.label = "GPIO 50 - Moisture";
    fakeSensor3.body.id = 3;
    fakeSensor3.body.pin = 52;
    fakeSensor3.body.mode = 0;
    fakeSensor3.body.label = "GPIO 52 - Tool Verification";
    fakeSensor4.body.id = 4;
    fakeSensor4.body.pin = 53;
    fakeSensor4.body.mode = 0;
    fakeSensor4.body.label = "GPIO 53 - Tool Verification";
    return {
      dispatch: jest.fn(),
      sensors: [fakeSensor2, fakeSensor1, fakeSensor3, fakeSensor4],
      pins,
      disabled: false
    };
  };

  it("renders a list of sensors, in sorted order", function () {
    const { container } = render(<SensorList {...fakeProps()} />);
    const labels = container.querySelectorAll("label");
    const pinNumbers = container.querySelectorAll("p");
    const indicators = container.querySelectorAll(".indicator");
    expect(labels[0]?.textContent).toEqual("GPIO 51");
    expect(pinNumbers[0]?.textContent).toEqual("51");
    expect(indicators[0]?.textContent).toEqual("1");
    expect(labels[1]?.textContent).toEqual("GPIO 50 - Moisture");
    expect(pinNumbers[1]?.textContent).toEqual("50");
    expect(indicators[1]?.textContent).toEqual("500");
    expect(labels[2]?.textContent).toEqual("GPIO 52 - Tool Verification");
    expect(pinNumbers[2]?.textContent).toEqual("52");
    expect(indicators[2]?.textContent).toEqual("1 (NO TOOL)");
    expect(labels[3]?.textContent).toEqual("GPIO 53 - Tool Verification");
    expect(pinNumbers[3]?.textContent).toEqual("53");
    expect(indicators[3]?.textContent).toEqual("0 (TOOL ON)");
  });

  const expectedPayload = (pin_number: number, pin_mode: 0 | 1) => ({
    pin_number,
    label: `pin${pin_number}`,
    pin_mode
  });

  it("reads sensors", () => {
    const { container } = render(<SensorList {...fakeProps()} />);
    const readSensorBtn = container.querySelectorAll("button");
    fireEvent.click(readSensorBtn[0] as Element);
    expect(mockDevice.readPin).toHaveBeenCalledWith(expectedPayload(51, 0));
    fireEvent.click(readSensorBtn[1] as Element);
    expect(mockDevice.readPin).toHaveBeenLastCalledWith(expectedPayload(50, 1));
    expect(mockDevice.readPin).toHaveBeenCalledTimes(2);
  });

  it("sensor reading is disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const { container } = render(<SensorList {...p} />);
    const readSensorBtn = container.querySelectorAll("button");
    fireEvent.click(readSensorBtn[0] as Element);
    fireEvent.click(readSensorBtn[readSensorBtn.length - 1] as Element);
    expect(mockDevice.readPin).not.toHaveBeenCalled();
  });

  it("renders analog reading", () => {
    const p = fakeProps();
    p.pins[50] && (p.pins[50].value = 600);
    const { container } = render(<SensorList {...p} />);
    const moistureValue = container.querySelector(
      ".moisture-sensor .indicator span") as HTMLSpanElement;
    expect(moistureValue.style.marginLeft).toEqual("-3.5rem");
  });
});
