import {
  currentSensorMatchesPeripheralTypes,
  currentSensorPeripheral,
  currentSensorPeripherals,
  currentSensorPeripheralType,
} from "../current_sensor_mapping";
import {
  fakePeripheral, fakeSensor,
} from "../../__test_support__/fake_state/resources";

describe("current sensor mapping", () => {
  const resources = () => {
    const sensor = fakeSensor();
    sensor.body.type = "current";
    sensor.body.pin = 60;
    const first = fakePeripheral();
    first.body.pin = 2;
    first.body.type = "vacuum";
    const second = fakePeripheral();
    second.body.pin = 3;
    second.body.type = "lighting";
    const unrelated = fakePeripheral();
    unrelated.body.pin = 4;
    unrelated.body.type = "water";
    return { sensor, first, second, unrelated };
  };

  it("returns mapped peripherals", () => {
    const { sensor, first, second, unrelated } = resources();
    const peripherals = [first, unrelated, second];
    expect(currentSensorPeripherals(sensor, peripherals))
      .toEqual([first, second]);
    expect(currentSensorPeripheral(sensor, peripherals)).toEqual(first);
    expect(currentSensorPeripheralType(sensor, peripherals)).toEqual("vacuum");
  });

  it("returns no match for unsupported sensors and pins", () => {
    const { sensor, first } = resources();
    sensor.body.type = "soil_moisture";
    expect(currentSensorPeripherals(sensor, [first])).toEqual([]);
    sensor.body.type = "current";
    sensor.body.pin = undefined;
    expect(currentSensorPeripherals(sensor, [first])).toEqual([]);
    sensor.body.pin = 1;
    expect(currentSensorPeripheral(sensor, [first])).toBeUndefined();
    expect(currentSensorPeripheralType(sensor, [first])).toBeUndefined();
  });

  it("ignores peripherals without pins", () => {
    const { sensor, first } = resources();
    first.body.pin = undefined;
    expect(currentSensorPeripherals(sensor, [first])).toEqual([]);
  });

  it("matches peripheral types", () => {
    const { sensor, first, second } = resources();
    expect(currentSensorMatchesPeripheralTypes(
      sensor, [first, second], ["lighting"],
    )).toBeTruthy();
    expect(currentSensorMatchesPeripheralTypes(
      sensor, [first, second], ["water"],
    )).toBeFalsy();
  });
});
