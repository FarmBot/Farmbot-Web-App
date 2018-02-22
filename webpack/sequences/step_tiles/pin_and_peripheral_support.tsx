import * as React from "react";
import {
  getAllSavedPeripherals,
  getAllSavedSensors
} from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { JSXChildren } from "../../util/index";
import { DropDownItem } from "../../ui";
import { range, isNumber, isString } from "lodash";
import { TaggedPeripheral, TaggedSensor, ResourceName } from "../../resources/tagged_resources";
import { ReadPin, AllowedPinTypes, NamedPin } from "farmbot";
import { bail } from "../../util/errors";
import { joinKindAndId } from "../../resources/reducer";
import { StepParams } from "../interfaces";
import { editStep } from "../../api/crud";

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
  ({ heading: true, label: "➖ Peripherals", value: 0 });

export const SENSOR_HEADING: DropDownItem =
  ({ heading: true, label: "➖ Sensors", value: 0 });

export const PIN_HEADING: DropDownItem =
  ({ heading: true, label: "➖ Pins", value: 0 });

/** Pass it the number X and it will generate a DropDownItem for `pin x`. */
const pinNumber2DropDown =
  (n: number) => ({ label: `Pin ${n}`, value: n, headingId: PinGroupName.pin });

const peripheral2DropDown =
  (x: TaggedPeripheral): DropDownItem => ({
    label: x.body.label,
    value: x.uuid,
    headingId: PinGroupName.peripheral
  });

const sensor2DropDown =
  (x: TaggedSensor): DropDownItem => ({
    label: x.body.label,
    value: x.uuid,
    headingId: PinGroupName.peripheral
  });

export function peripheralsAsDropDowns(input: ResourceIndex): DropDownItem[] {
  const list = getAllSavedPeripherals(input).map(peripheral2DropDown);
  return (list.length) ? [PERIPHERAL_HEADING, ...list] : [];
}

export function sensorsAsDropDowns(input: ResourceIndex): DropDownItem[] {
  const list = getAllSavedSensors(input).map(sensor2DropDown);
  return list.length ? [SENSOR_HEADING, ...list] : [];
}

/** Number of pins in an Arduino Mega */
export const PIN_RANGE = range(0, 54);

export const pinDropdowns = [PIN_HEADING, ...PIN_RANGE.map(pinNumber2DropDown)];

export const pinsAsDropDowns = (input: ResourceIndex): DropDownItem[] => [
  ...peripheralsAsDropDowns(input),
  ...sensorsAsDropDowns(input),
  ...pinDropdowns,
];

const TYPE_MAPPING: Record<AllowedPinTypes, PinGroupName> = {
  "Peripheral": PinGroupName.peripheral,
  "Sensor": PinGroupName.sensor
};

const isPinType =
  (x: any): x is AllowedPinTypes => TYPE_MAPPING.hasOwnProperty(x);

export const findByPinNumber =
  (ri: ResourceIndex, input: NamedPin): TaggedPeripheral | TaggedSensor => {
    const { pin_type, pin_id } = input.args;
    const kindAndId = joinKindAndId(pin_type as ResourceName, pin_id);
    const uuid = ri.byKindAndId[kindAndId] || bail("no uuid found");
    const r = ri.references[uuid] || bail("resource not found");
    switch (r.kind) {
      case "Peripheral":
      case "Sensor":
        return r;
      default:
        return bail("Neither sensor nor peripheral");
    }
  };

export function namedPin2DropDown(ri: ResourceIndex, input: NamedPin) {
  const { pin_type } = input.args;
  const value = input.args.pin_id;

  if (isPinType(pin_type)) {
    const item = findByPinNumber(ri, input);
    const { label } = item.body;
    const headingId = TYPE_MAPPING[item.kind];
    return { label, value, headingId };
  } else {
    bail("Bad pin_type: " + JSON.stringify(pin_type));
  }
}

export const dropDown2CeleryArg =
  (ri: ResourceIndex, item: DropDownItem): number | NamedPin => {
    if (isString(item.value)) {
      const uuid: string = item.value;
      const r = ri.references[uuid];
      if (r) {
        return {
          kind: "named_pin",
          args: { pin_type: r.kind, pin_id: r.body.id || -99 }
        };
      } else {
        return bail("Bad uuid in celery arg: " + uuid);
      }
    } else {
      return item.value;
    }
  };

export const setArgsDotPinNumber =
  (x: StepParams) => (d: DropDownItem) => {
    const { dispatch, currentSequence, index, resources, currentStep } = x;

    dispatch(editStep({
      step: currentStep,
      sequence: currentSequence,
      index: index,
      executor(c) {
        if (c.kind === "read_pin") {
          c.args.pin_number = dropDown2CeleryArg(resources, d);
        } else {
          bail("Only for read_pin");
        }
      }
    }))
  };

type PinNumber = ReadPin["args"]["pin_number"];

export function celery2DropDown(input: PinNumber, ri: ResourceIndex) {
  return isNumber(input)
    ? pinNumber2DropDown(input)
    : namedPin2DropDown(ri, input);
}
