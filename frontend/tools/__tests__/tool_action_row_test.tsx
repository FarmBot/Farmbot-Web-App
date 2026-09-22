import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  fakePeripheral, fakeSensor, fakeTool,
} from "../../__test_support__/fake_state/resources";
import { ToolActionRow, ToolActionRowProps } from "../tool_action_row";
import * as deviceActions from "../../devices/actions";
import {
  PeripheralType, ToolType,
} from "farmbot/dist/resources/api_resources";

const fakeProps = (): ToolActionRowProps => ({
  mountedTool: fakeTool(),
  sensors: [],
  peripherals: [],
  peripheralValues: [],
  pins: {},
  botOnline: true,
  arduinoBusy: false,
  locked: false,
});

const addPeripheral = (
  props: ToolActionRowProps,
  label: string,
  pin: number,
  type: PeripheralType,
  value = false,
) => {
  const peripheral = fakePeripheral();
  peripheral.body.label = label;
  peripheral.body.pin = pin;
  peripheral.body.type = type;
  props.peripherals.push(peripheral);
  props.peripheralValues.push({ uuid: peripheral.uuid, type, pin, value });
};

describe("<ToolActionRow />", () => {
  afterEach(() => jest.restoreAllMocks());

  it("toggles the seeder vacuum peripheral", () => {
    const pinToggle = jest.spyOn(deviceActions, "pinToggle")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.mountedTool!.body.name = "arbitrary name";
    p.mountedTool!.body.type = "seeder";
    addPeripheral(p, "arbitrary peripheral", 0, "vacuum", true);
    const { getByText } = render(<ToolActionRow {...p} />);
    expect(getByText("TOOL ACTION")).toBeVisible();
    const toggle = getByText("on");
    expect(toggle).toHaveClass("green");
    fireEvent.click(toggle);
    expect(pinToggle).toHaveBeenCalledWith(0);
  });

  it("reads all soil moisture sensors", () => {
    const readPin = jest.spyOn(deviceActions, "readPin")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.mountedTool!.body.type = "soil_sensor";
    const firstSensor = fakeSensor();
    firstSensor.body.label = "first sensor";
    firstSensor.body.type = "soil_moisture";
    firstSensor.body.pin = 59;
    firstSensor.body.mode = 1;
    const secondSensor = fakeSensor();
    secondSensor.body.label = "second sensor";
    secondSensor.body.type = "soil_moisture";
    secondSensor.body.pin = 60;
    secondSensor.body.mode = 0;
    p.sensors = [firstSensor, secondSensor];
    p.pins = {
      59: { mode: 1, value: 500 },
      60: { mode: 0, value: 1 },
    };
    const { container, getAllByText, getByText } =
      render(<ToolActionRow {...p} />);
    expect(getByText("TOOL ACTIONS")).toBeVisible();
    expect(getByText("first sensor")).toBeVisible();
    expect(getByText("second sensor")).toBeVisible();
    const readings = container.querySelectorAll(".sensor-reading-display");
    expect(readings[0]).toHaveTextContent("500");
    expect(readings[1]).toHaveTextContent("1");
    getAllByText("Read sensor").map(button => fireEvent.click(button));
    expect(readPin).toHaveBeenNthCalledWith(1, 59, "pin59", 1);
    expect(readPin).toHaveBeenNthCalledWith(2, 60, "pin60", 0);
  });

  it.each<[ToolType, string[], string]>([
    ["rotary_tool", ["first rotary", "second rotary"], "TOOL ACTIONS"],
    ["watering_nozzle", ["arbitrary water"], "TOOL ACTION"],
  ])("renders %s actions", (toolType, labels, actionLabel) => {
    const p = fakeProps();
    p.mountedTool!.body.type = toolType;
    addPeripheral(p, "first rotary", 2, "rotary_tool");
    addPeripheral(p, "second rotary", 3, "rotary_tool");
    addPeripheral(p, "arbitrary water", 8, "water");
    const { getByText } = render(<ToolActionRow {...p} />);
    expect(getByText(actionLabel)).toBeVisible();
    labels.forEach(label => expect(getByText(label)).toBeVisible());
  });

  it("uses each rotary peripheral's state and pin", () => {
    const pinToggle = jest.spyOn(deviceActions, "pinToggle")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.mountedTool!.body.type = "rotary_tool";
    addPeripheral(p, "first rotary", 2, "rotary_tool", true);
    addPeripheral(p, "second rotary", 3, "rotary_tool", false);
    const { getByText } = render(<ToolActionRow {...p} />);
    expect(getByText("on")).toHaveClass("green");
    expect(getByText("off")).toHaveClass("red");
    fireEvent.click(getByText("on"));
    fireEvent.click(getByText("off"));
    expect(pinToggle).toHaveBeenNthCalledWith(1, 2);
    expect(pinToggle).toHaveBeenNthCalledWith(2, 3);
  });

  it("includes current sensors matching peripheral pin types", () => {
    const readPin = jest.spyOn(deviceActions, "readPin")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.mountedTool!.body.type = "seeder";
    addPeripheral(p, "vacuum", 9, "vacuum");
    addPeripheral(p, "water", 8, "water");
    const vacuumCurrent = fakeSensor();
    vacuumCurrent.body.label = "vacuum current";
    vacuumCurrent.body.type = "current";
    vacuumCurrent.body.pin = 58;
    vacuumCurrent.body.mode = 1;
    const waterCurrent = fakeSensor();
    waterCurrent.body.label = "water current";
    waterCurrent.body.type = "current";
    waterCurrent.body.pin = 55;
    p.sensors = [vacuumCurrent, waterCurrent];
    const { getByText, queryByText } = render(<ToolActionRow {...p} />);
    expect(getByText("vacuum current")).toBeVisible();
    expect(queryByText("water current")).not.toBeInTheDocument();
    fireEvent.click(getByText("Read sensor"));
    expect(readPin).toHaveBeenCalledWith(58, "pin58", 1);
  });

  it.each([
    [54, 7],
    [55, 8],
    [56, 12],
    [57, 10],
    [58, 9],
    [60, 2],
    [60, 3],
  ])("matches current pin %s to peripheral pin %s",
    (sensorPin, peripheralPin) => {
      const p = fakeProps();
      p.mountedTool!.body.type = "seeder";
      addPeripheral(p, "peripheral", peripheralPin, "vacuum");
      const current = fakeSensor();
      current.body.label = "current sensor";
      current.body.type = "current";
      current.body.pin = sensorPin;
      p.sensors = [current];
      const { getByText } = render(<ToolActionRow {...p} />);
      expect(getByText("current sensor")).toBeVisible();
    });

  it.each([
    [false, false, false],
    [true, true, false],
    [true, false, true],
  ])("disables actions: online %s, busy %s, locked %s",
    (botOnline, arduinoBusy, locked) => {
      const p = fakeProps();
      p.mountedTool!.body.type = "seeder";
      p.botOnline = botOnline;
      p.arduinoBusy = arduinoBusy;
      p.locked = locked;
      addPeripheral(p, "arbitrary peripheral", 9, "vacuum");
      const { getByText } = render(<ToolActionRow {...p} />);
      expect(getByText("off")).toBeDisabled();
    });

  it("doesn't render actions for other tools", () => {
    const p = fakeProps();
    p.mountedTool!.body.type = "weeder";
    const { container } = render(<ToolActionRow {...p} />);
    expect(container).toBeEmptyDOMElement();
  });
});
