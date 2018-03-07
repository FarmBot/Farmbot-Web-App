import { t } from "i18next";
import {
  getAllSavedPeripherals,
  getAllSavedSensors
} from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { shouldDisplay } from "../../util";
import { DropDownItem } from "../../ui";
import { range, isNumber, isString } from "lodash";
import {
  TaggedPeripheral, TaggedSensor, ResourceName
} from "../../resources/tagged_resources";
import { ReadPin, AllowedPinTypes, NamedPin } from "farmbot";
import { bail } from "../../util/errors";
import { joinKindAndId } from "../../resources/reducer";
import { StepParams } from "../interfaces";
import { editStep } from "../../api/crud";

/** `headingIds` required to group the three kinds of pins. */
export enum PinGroupName {
  sensor = "Sensor",
  peripheral = "Peripheral",
  pin = "Pin"
}

export const PERIPHERAL_HEADING: DropDownItem =
  ({ heading: true, label: t("Peripherals"), value: 0 });

export const SENSOR_HEADING: DropDownItem =
  ({ heading: true, label: t("Sensors"), value: 0 });

export const PIN_HEADING: DropDownItem =
  ({ heading: true, label: t("Pins"), value: 0 });

/** Pass it the number X and it will generate a DropDownItem for `pin x`. */
export const pinNumber2DropDown =
  (valueFormat: (n: number) => (string | number)) =>
    (n: number) => {
      const analog = n > 53 ? ` (A${n - 54})` : "";
      const label = `${t("Pin")} ${n}${analog}`;
      return { label, value: valueFormat(n), headingId: PinGroupName.pin };
    };

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
    headingId: PinGroupName.sensor
  });

export function peripheralsAsDropDowns(input: ResourceIndex): DropDownItem[] {
  const list = getAllSavedPeripherals(input).map(peripheral2DropDown);
  return list.length ? [PERIPHERAL_HEADING, ...list] : [];
}

export function sensorsAsDropDowns(input: ResourceIndex): DropDownItem[] {
  const list = getAllSavedSensors(input).map(sensor2DropDown);
  return list.length ? [SENSOR_HEADING, ...list] : [];
}

/** Number of pins in an Arduino Mega */
export const PIN_RANGE = range(0, 70);

export function pinDropdowns(
  valueFormat: (n: number) => string | number): DropDownItem[] {
  return [PIN_HEADING, ...PIN_RANGE.map(pinNumber2DropDown(valueFormat))];
}

export const pinsAsDropDowns =
  (input: ResourceIndex, fbosVersion: string | undefined): DropDownItem[] => [
    ...(shouldDisplay("named_pins", fbosVersion) ?
      peripheralsAsDropDowns(input) : []),
    ...(shouldDisplay("named_pins", fbosVersion) ?
      sensorsAsDropDowns(input) : []),
    ...pinDropdowns(n => n),
  ];

const TYPE_MAPPING: Record<AllowedPinTypes, PinGroupName> = {
  "Peripheral": PinGroupName.peripheral,
  "Sensor": PinGroupName.sensor
};

export const isPinType =
  (x: string): x is AllowedPinTypes => !!TYPE_MAPPING[x as AllowedPinTypes];

const NO = "UUID or ID not found";

export const findByPinNumber =
  (ri: ResourceIndex, input: NamedPin): TaggedPeripheral | TaggedSensor => {
    const { pin_type, pin_id } = input.args;
    const kindAndId = joinKindAndId(pin_type as ResourceName, pin_id);
    const r = ri.references[ri.byKindAndId[kindAndId] || NO] || bail(NO);
    switch (r.kind) {
      case "Peripheral":
      case "Sensor": return r;
      default: return bail("Not a Peripheral or Sensor");
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
    if (isString(item.value)) { // str means "Named Pin". num means "Raw Pin"
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
        switch (c.kind) {
          case "read_pin":
          case "write_pin":
            c.args.pin_number = dropDown2CeleryArg(resources, d);
        }
      }
    }));
  };

type PinNumber = ReadPin["args"]["pin_number"];

export function celery2DropDown(input: PinNumber, ri: ResourceIndex) {
  return isNumber(input)
    ? pinNumber2DropDown(n => n)(input)
    : namedPin2DropDown(ri, input);
}
