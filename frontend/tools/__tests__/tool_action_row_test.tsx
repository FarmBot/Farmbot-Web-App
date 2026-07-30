import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  fakePeripheral, fakeSensor, fakeTool,
} from "../../__test_support__/fake_state/resources";
import { ToolActionRow, ToolActionRowProps } from "../tool_action_row";
import * as deviceActions from "../../devices/actions";

const fakeProps = (): ToolActionRowProps => ({
  mountedTool: fakeTool(),
  sensors: [],
  peripherals: [],
  peripheralValues: [],
  botOnline: true,
  arduinoBusy: false,
  locked: false,
});

const addPeripheral = (
  props: ToolActionRowProps,
  label: string,
  pin: number,
  value = false,
) => {
  const peripheral = fakePeripheral();
  peripheral.body.label = label;
  peripheral.body.pin = pin;
  props.peripherals.push(peripheral);
  props.peripheralValues.push({ label, value });
};

describe("<ToolActionRow />", () => {
  afterEach(() => jest.restoreAllMocks());

  it("toggles the seeder vacuum peripheral", () => {
    const pinToggle = jest.spyOn(deviceActions, "pinToggle")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.mountedTool!.body.name = "Seeder";
    addPeripheral(p, "Vacuum", 0, true);
    const { getByText } = render(<ToolActionRow {...p} />);
    const toggle = getByText("on");
    expect(toggle).toHaveClass("green");
    fireEvent.click(toggle);
    expect(pinToggle).toHaveBeenCalledWith(0);
  });

  it("reads the soil moisture sensor", () => {
    const readPin = jest.spyOn(deviceActions, "readPin")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.mountedTool!.body.name = "Soil Sensor";
    const sensor = fakeSensor();
    sensor.body.label = "Soil Moisture";
    sensor.body.pin = 59;
    sensor.body.mode = 1;
    p.sensors = [sensor];
    const { getByText } = render(<ToolActionRow {...p} />);
    fireEvent.click(getByText("Read sensor"));
    expect(readPin).toHaveBeenCalledWith(59, "pin59", 1);
  });

  it.each([
    ["Rotary Tool", ["FWD", "REV"]],
    ["Watering Nozzle", ["Water"]],
  ])("renders %s actions", (toolName, labels) => {
    const p = fakeProps();
    p.mountedTool!.body.name = toolName;
    addPeripheral(p, "Rotary Tool", 2);
    addPeripheral(p, "Rotary Tool Reverse", 3);
    addPeripheral(p, "Water", 8);
    const { getByText } = render(<ToolActionRow {...p} />);
    labels.forEach(label => expect(getByText(label)).toBeVisible());
  });

  it.each([
    [false, false, false],
    [true, true, false],
    [true, false, true],
  ])("disables actions: online %s, busy %s, locked %s",
    (botOnline, arduinoBusy, locked) => {
      const p = fakeProps();
      p.mountedTool!.body.name = "Seeder";
      p.botOnline = botOnline;
      p.arduinoBusy = arduinoBusy;
      p.locked = locked;
      addPeripheral(p, "Vacuum", 9);
      const { getByText } = render(<ToolActionRow {...p} />);
      expect(getByText("off")).toBeDisabled();
    });

  it("doesn't render actions for other tools", () => {
    const p = fakeProps();
    p.mountedTool!.body.name = "Weeder";
    const { container } = render(<ToolActionRow {...p} />);
    expect(container).toBeEmptyDOMElement();
  });
});
