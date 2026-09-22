import { TaggedPeripheral, TaggedSensor } from "farmbot";
import { isNumber } from "lodash";
import { PeripheralType } from "farmbot/dist/resources/api_resources";

export const CURRENT_SENSOR_PERIPHERAL_PINS: Record<number, number[]> = {
  54: [7],
  55: [8],
  56: [12],
  57: [10],
  58: [9],
  60: [2, 3],
};

export const currentSensorPeripherals = (
  sensor: TaggedSensor,
  peripherals: TaggedPeripheral[],
): TaggedPeripheral[] => {
  if (sensor.body.type != "current" || !isNumber(sensor.body.pin)) {
    return [];
  }
  const peripheralPins = CURRENT_SENSOR_PERIPHERAL_PINS[sensor.body.pin] || [];
  return peripherals.filter(peripheral =>
    isNumber(peripheral.body.pin)
    && peripheralPins.includes(peripheral.body.pin));
};

export const currentSensorPeripheral = (
  sensor: TaggedSensor,
  peripherals: TaggedPeripheral[],
): TaggedPeripheral | undefined =>
  currentSensorPeripherals(sensor, peripherals)[0];

export const currentSensorPeripheralType = (
  sensor: TaggedSensor,
  peripherals: TaggedPeripheral[],
): PeripheralType | undefined =>
  currentSensorPeripheral(sensor, peripherals)?.body.type;

export const currentSensorMatchesPeripheralTypes = (
  sensor: TaggedSensor,
  peripherals: TaggedPeripheral[],
  peripheralTypes: PeripheralType[],
) => {
  return currentSensorPeripherals(sensor, peripherals)
    .some(peripheral => peripheralTypes.includes(peripheral.body.type));
};
