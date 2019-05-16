import {
  selectAllSavedPeripherals,
  selectAllSavedSensors
} from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { DropDownItem } from "../../ui";
import { range, isNumber, isString } from "lodash";
import {
  TaggedPeripheral, TaggedSensor, ResourceName, Nothing
} from "farmbot";
import { ReadPin, AllowedPinTypes, NamedPin } from "farmbot";
import { bail } from "../../util/errors";
import { StepParams } from "../interfaces";
import { editStep } from "../../api/crud";
import { joinKindAndId } from "../../resources/reducer_support";
import { t } from "../../i18next_wrapper";

/** `headingIds` required to group the four kinds of pins. */
export enum PinGroupName {
  Sensor = "Sensor",
  Peripheral = "Peripheral",
  BoxLed = "Box LED",
  Pin = "Pin",
  Position = "Position"
}

/** User-controllable box LEDs connected to the RPi. */
export enum BoxLed {
  BoxLed3 = "BoxLed3",
  BoxLed4 = "BoxLed4",
}

const BOX_LED_LABELS: { [x: string]: string } = {
  [BoxLed.BoxLed3]: t("Box LED 3"),
  [BoxLed.BoxLed4]: t("Box LED 4"),
};

export const PERIPHERAL_HEADING: DropDownItem =
  ({ heading: true, label: t("Peripherals"), value: 0, headingId: PinGroupName.Peripheral });

export const SENSOR_HEADING: DropDownItem =
  ({ heading: true, label: t("Sensors"), value: 0, headingId: PinGroupName.Sensor });

export const BOX_LED_HEADING: DropDownItem =
  ({ heading: true, label: t("Box LEDs"), value: 0, headingId: PinGroupName.BoxLed });

export const PIN_HEADING: DropDownItem =
  ({ heading: true, label: t("Pins"), value: 0, headingId: PinGroupName.Pin });

/** Pass it the number X and it will generate a DropDownItem for `pin x`. */
export const pinNumber2DropDown =
  (valueFormat: (n: number) => (string | number)) =>
    (n: number): DropDownItem => {
      const analog = n > 53 ? ` (A${n - 54})` : "";
      const label = `${t("Pin")} ${n}${analog}`;
      return { label, value: valueFormat(n), headingId: PinGroupName.Pin };
    };

const peripheral2DropDown =
  (x: TaggedPeripheral): DropDownItem => ({
    label: x.body.label,
    value: x.uuid,
    headingId: PinGroupName.Peripheral
  });

const sensor2DropDown =
  (x: TaggedSensor): DropDownItem => ({
    label: x.body.label,
    value: x.uuid,
    headingId: PinGroupName.Sensor
  });

const boxLed2DropDown =
  (boxLed: BoxLed): DropDownItem => ({
    label: t(BOX_LED_LABELS[boxLed]),
    value: boxLed,
    headingId: PinGroupName.BoxLed
  });

export function peripheralsAsDropDowns(input: ResourceIndex): DropDownItem[] {
  const list = selectAllSavedPeripherals(input).map(peripheral2DropDown);
  return list.length ? [PERIPHERAL_HEADING, ...list] : [];
}

export function sensorsAsDropDowns(input: ResourceIndex): DropDownItem[] {
  const list = selectAllSavedSensors(input).map(sensor2DropDown);
  return list.length ? [SENSOR_HEADING, ...list] : [];
}

export function boxLedsAsDropDowns(): DropDownItem[] {
  const list = Object.values(BoxLed).map(boxLed2DropDown);
  return [BOX_LED_HEADING, ...list];
}

/** Number of pins in an Arduino Mega */
export const PIN_RANGE = range(0, 70);

export function pinDropdowns(
  valueFormat: (n: number) => string | number): DropDownItem[] {
  return [PIN_HEADING, ...PIN_RANGE.map(pinNumber2DropDown(valueFormat))];
}

export const pinsAsDropDownsWritePin = (
  input: ResourceIndex, showPins: boolean
): DropDownItem[] => [
    ...peripheralsAsDropDowns(input),
    ...boxLedsAsDropDowns(),
    ...(showPins ? pinDropdowns(n => n) : []),
  ];

export const pinsAsDropDownsReadPin = (
  input: ResourceIndex, showPins: boolean
): DropDownItem[] => [
    ...sensorsAsDropDowns(input),
    ...peripheralsAsDropDowns(input),
    ...(showPins ? pinDropdowns(n => n) : []),
  ];

const TYPE_MAPPING: Record<AllowedPinTypes, PinGroupName | BoxLed> = {
  "Peripheral": PinGroupName.Peripheral,
  "Sensor": PinGroupName.Sensor,
  "BoxLed3": BoxLed.BoxLed3,
  "BoxLed4": BoxLed.BoxLed4,
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

export function namedPin2DropDown(ri: ResourceIndex, input: NamedPin | Nothing):
  DropDownItem {
  if (input.kind === "named_pin") {
    const { pin_type } = input.args;
    if (isPinType(pin_type)) {
      switch (pin_type) {
        case BoxLed.BoxLed3:
        case BoxLed.BoxLed4:
          return boxLed2DropDown(pin_type as BoxLed);
        case PinGroupName.Peripheral:
        case PinGroupName.Sensor:
        default:
          const item = findByPinNumber(ri, input);
          switch (item.kind) {
            case PinGroupName.Peripheral:
              return peripheral2DropDown(item);
            case PinGroupName.Sensor:
              return sensor2DropDown(item);
          }
      }
    } else {
      bail("Bad pin_type: " + JSON.stringify(pin_type));
    }
  }
  return { label: t("Select a pin"), value: "", isNull: true };
}

export const dropDown2CeleryArg =
  (ri: ResourceIndex, item: DropDownItem): number | NamedPin => {
    if (isString(item.value)) { // str means "Named Pin". num means "Raw Pin"
      if (Object.values(BoxLed).includes(item.value)) {
        return {
          kind: "named_pin",
          args: { pin_type: item.value as AllowedPinTypes, pin_id: -1 }
        };
      }
      const uuid: string = item.value;
      const r = ri.references[uuid];
      if (r) {
        return {
          kind: "named_pin",
          args: { pin_type: r.kind as AllowedPinTypes, pin_id: r.body.id || -99 }
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

export function celery2DropDown(input: PinNumber, ri: ResourceIndex): DropDownItem {
  return isNumber(input)
    ? pinNumber2DropDown(n => n)(input)
    : namedPin2DropDown(ri, input);
}
