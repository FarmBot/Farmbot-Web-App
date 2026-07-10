import { TaggedPeripheral } from "farmbot";
import { isNumber, uniq } from "lodash";
import { BotState } from "../devices/interfaces";
import { PeripheralValues } from "./map/layers/farmbot/bot_trail";

export const mapPeripheralValues = (
  peripherals: TaggedPeripheral[],
  pins: BotState["hardware"]["pins"],
): PeripheralValues =>
  uniq(peripherals)
    .map(peripheral => {
      const label = peripheral.body.label;
      const pinStatus = isNumber(peripheral.body.pin)
        ? pins[peripheral.body.pin]
        : undefined;
      const value = pinStatus ? pinStatus.value > 0 : false;
      return { label, value };
    });

export const selectPeripheralValues = (() => {
  let lastKey = "";
  let lastResult: PeripheralValues | undefined;
  return (
    peripherals: TaggedPeripheral[],
    pins: BotState["hardware"]["pins"],
  ): PeripheralValues => {
    const key = peripherals
      .map(peripheral => {
        const pin = peripheral.body.pin;
        const value = isNumber(pin) ? pins[pin]?.value : undefined;
        return `${peripheral.uuid}:${peripheral.body.label}:${pin}:${value}`;
      })
      .join("|");
    if (key === lastKey && lastResult) { return lastResult; }
    lastKey = key;
    lastResult = mapPeripheralValues(peripherals, pins);
    return lastResult;
  };
})();
