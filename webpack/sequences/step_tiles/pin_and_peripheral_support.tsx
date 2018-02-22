import * as React from "react";
import {
  ReadPin,
} from "farmbot";
import {
  getAllSavedPeripherals,
  getAllSavedSensors
} from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { JSXChildren } from "../../util/index";
import { DropDownItem } from "../../ui";
import { range } from "lodash";
import { TaggedPeripheral, TaggedSensor } from "../../resources/tagged_resources";

interface StepCheckBoxProps {
  onClick(): void;
  children?: JSXChildren;
  checked?: boolean;
}

export function StepCheckBox(props: StepCheckBoxProps) {
  return <>
    <label>{props.children}</label>
    <div className="fb-checkbox">
      <input
        type="checkbox"
        onChange={props.onClick}
        checked={!!props.checked} />
    </div>
  </>;
}

/** `headingIds` required to group the three kinds of pins. */
export enum PinGroupName { sensor = "👂", peripheral = "🔌", pin = "📌" }

export const PERIPHERAL_HEADING: DropDownItem =
  ({ heading: true, label: "Peripherals", value: 0 });

export const SENSOR_HEADING: DropDownItem =
  ({ heading: true, label: "Sensors", value: 0 });

export const PIN_HEADING: DropDownItem =
  ({ heading: true, label: "Pins", value: 0 });

/** Pass it the number X and it will generate a DropDownItem for `pin x`. */
const pinNumber2DropDown =
  (n: number) => ({ label: `Pin ${n}`, value: n, headingId: PinGroupName.pin });

const peripheral2DropDown =
  (x: TaggedPeripheral): DropDownItem => ({
    label: x.body.label,
    value: x.body.id || 0,
    headingId: PinGroupName.peripheral
  });

const sensor2DropDown =
  (x: TaggedSensor): DropDownItem => ({
    label: x.body.label,
    value: x.body.id || 0,
    headingId: PinGroupName.peripheral
  });

export function peripheralsAsDropDowns(input: ResourceIndex): DropDownItem[] {
  return [
    PERIPHERAL_HEADING,
    ...getAllSavedPeripherals(input).map(peripheral2DropDown)
  ];
}

export function sensorsAsDropDowns(input: ResourceIndex): DropDownItem[] {
  return [SENSOR_HEADING, ...getAllSavedSensors(input).map(sensor2DropDown)];
}

/** Number of pins in an Arduino Mega */
export const PIN_RANGE = range(0, 54);

export const pinDropdowns = [PIN_HEADING, ...PIN_RANGE.map(pinNumber2DropDown)];

const dropdownItemsForPinId = (input: ResourceIndex): DropDownItem[] => [
  ...peripheralsAsDropDowns(input),
  ...sensorsAsDropDowns(input),
  ...pinDropdowns,
];
