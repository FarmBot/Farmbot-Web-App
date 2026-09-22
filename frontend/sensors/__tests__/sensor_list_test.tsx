const mockDevice = {
  readPin: jest.fn((_) => Promise.resolve()),
  togglePin: jest.fn((_) => Promise.resolve()),
};

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { SensorList } from "../sensor_list";
import { Pins } from "farmbot";
import {
  fakePeripheral, fakeSensor,
} from "../../__test_support__/fake_state/resources";
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
      54: {
        mode: 0,
        value: 1,
      },
      7: {
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
    fakeSensor1.body.pin = 54;
    fakeSensor1.body.mode = 0;
    fakeSensor1.body.label = "arbitrary current sensor";
    fakeSensor1.body.type = "current";
    fakeSensor2.body.id = 2;
    fakeSensor2.body.pin = 50;
    fakeSensor2.body.mode = 1;
    fakeSensor2.body.label = "arbitrary analog sensor";
    fakeSensor2.body.type = "soil_moisture";
    fakeSensor3.body.id = 3;
    fakeSensor3.body.pin = 52;
    fakeSensor3.body.mode = 0;
    fakeSensor3.body.label = "first arbitrary digital sensor";
    fakeSensor3.body.type = "tool_verification";
    fakeSensor4.body.id = 4;
    fakeSensor4.body.pin = 53;
    fakeSensor4.body.mode = 0;
    fakeSensor4.body.label = "second arbitrary digital sensor";
    fakeSensor4.body.type = "tool_verification";
    const lighting = fakePeripheral();
    lighting.body.label = "arbitrary lighting";
    lighting.body.pin = 7;
    lighting.body.type = "lighting";
    return {
      dispatch: jest.fn(),
      sensors: [fakeSensor2, fakeSensor1, fakeSensor3, fakeSensor4],
      peripherals: [lighting],
      pins,
      disabled: false,
      locked: false,
    };
  };

  it("renders a list of sensors, in sorted order", function () {
    const { container } = render(<SensorList {...fakeProps()} />);
    const labels = container.querySelectorAll("label");
    const pinNumbers = container.querySelectorAll("p");
    const indicators = container.querySelectorAll(".indicator");
    const typeEmojis = container.querySelectorAll(".pin-type-emoji");
    expect(labels[0]?.textContent).toEqual("arbitrary current sensor");
    expect(pinNumbers[0]?.textContent).toEqual("54");
    expect(indicators[0]?.textContent).toEqual("1");
    expect(labels[1]?.textContent).toEqual("arbitrary analog sensor");
    expect(pinNumbers[1]?.textContent).toEqual("50");
    expect(indicators[1]?.textContent).toEqual("500");
    expect(labels[2]?.textContent).toEqual("first arbitrary digital sensor");
    expect(pinNumbers[2]?.textContent).toEqual("52");
    expect(indicators[2]?.textContent).toEqual("1 (NO TOOL)");
    expect(labels[3]?.textContent).toEqual("second arbitrary digital sensor");
    expect(pinNumbers[3]?.textContent).toEqual("53");
    expect(indicators[3]?.textContent).toEqual("0 (TOOL ON)");
    expect(Array.from(typeEmojis).map(emoji => emoji.textContent)).toEqual([
      "⚡", "💡", "💧", "", "🔧", "", "🔧", "",
    ]);
    expect(typeEmojis[0]).toHaveAccessibleName("Current");
    expect(typeEmojis[1]).toHaveAccessibleName("Lighting");
  });

  it("leaves the peripheral emoji empty without a match", () => {
    const p = fakeProps();
    p.peripherals = [];
    const { container } = render(<SensorList {...p} />);
    const typeEmojis = container.querySelectorAll(".pin-type-emoji");
    expect(typeEmojis[0]?.textContent).toEqual("⚡");
    expect(typeEmojis[0]).toHaveAccessibleName("Current");
    expect(typeEmojis[1]?.textContent).toEqual("");
    expect(typeEmojis[1]).not.toHaveAttribute("aria-label");
  });

  it("opens and toggles the corresponding peripheral", async () => {
    const { getByText, getByTitle, queryByText } = render(
      <SensorList {...fakeProps()} />);
    const target = getByTitle("Show arbitrary lighting controls");
    fireEvent.click(target);
    expect(getByText("arbitrary lighting")).toBeVisible();
    const toggle = getByText("on");
    expect(toggle).toBeEnabled();
    fireEvent.click(toggle);
    expect(mockDevice.togglePin).toHaveBeenCalledWith({ pin_number: 7 });
    expect(getByText("arbitrary lighting")).toBeVisible();
    fireEvent.mouseDown(document.body);
    expect(getByText("arbitrary lighting")).toBeVisible();
    fireEvent.click(getByTitle("Show arbitrary lighting controls"));
    await waitFor(() =>
      expect(queryByText("arbitrary lighting")).not.toBeInTheDocument());
  });

  it("uses the peripheral analog control", () => {
    const p = fakeProps();
    p.peripherals[0].body.mode = 1;
    const { getByRole, getByTitle } = render(<SensorList {...p} />);
    fireEvent.click(getByTitle("Show arbitrary lighting controls"));
    expect(getByRole("slider")).toBeInTheDocument();
  });

  it("shows both rotary tool peripherals", () => {
    const p = fakeProps();
    p.sensors[1].body.pin = 60;
    p.peripherals[0].body.label = "first rotary";
    p.peripherals[0].body.pin = 2;
    p.peripherals[0].body.type = "rotary_tool";
    const secondRotary = fakePeripheral();
    secondRotary.body.label = "second rotary";
    secondRotary.body.pin = 3;
    secondRotary.body.type = "rotary_tool";
    p.peripherals.push(secondRotary);
    p.pins[2] = { mode: 0, value: 1 };
    p.pins[3] = { mode: 0, value: 0 };
    const { getByText, getByTitle } = render(<SensorList {...p} />);
    fireEvent.click(getByTitle("Show first rotary controls"));
    expect(getByText("first rotary")).toBeVisible();
    expect(getByText("second rotary")).toBeVisible();
    expect(getByText("on")).toBeVisible();
    expect(getByText("off")).toBeVisible();
  });

  const expectedPayload = (pin_number: number, pin_mode: 0 | 1) => ({
    pin_number,
    label: `pin${pin_number}`,
    pin_mode
  });

  it("reads sensors", () => {
    const { getAllByRole } = render(<SensorList {...fakeProps()} />);
    const readSensorButtons = getAllByRole("button", { name: "read" });
    fireEvent.click(readSensorButtons[0]);
    expect(mockDevice.readPin).toHaveBeenCalledWith(expectedPayload(54, 0));
    fireEvent.click(readSensorButtons[1]);
    expect(mockDevice.readPin).toHaveBeenLastCalledWith(expectedPayload(50, 1));
    expect(mockDevice.readPin).toHaveBeenCalledTimes(2);
  });

  it("sensor reading is disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const { getAllByRole } = render(<SensorList {...p} />);
    const readSensorButtons = getAllByRole("button", { name: "read" });
    fireEvent.click(readSensorButtons[0]);
    fireEvent.click(readSensorButtons[readSensorButtons.length - 1]);
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
