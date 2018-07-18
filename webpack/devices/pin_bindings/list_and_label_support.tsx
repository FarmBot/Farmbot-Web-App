import { t } from "i18next";
import { PinBindingType, PinBindingSpecialAction } from "./interfaces";
import { DropDownItem } from "../../ui";
import { gpio } from "./rpi_gpio_diagram";
import { flattenDeep, isNumber } from "lodash";

export const bindingTypeLabelLookup: { [x: string]: string } = {
  [PinBindingType.standard]: t("Sequence"),
  [PinBindingType.special]: t("Action"),
  "": t("Sequence"),
};

export const specialActionLabelLookup: { [x: string]: string } = {
  [PinBindingSpecialAction.emergency_lock]: t("E-STOP"),
  [PinBindingSpecialAction.emergency_unlock]: t("UNLOCK"),
  [PinBindingSpecialAction.power_off]: t("Shutdown"),
  [PinBindingSpecialAction.reboot]: t("Reboot"),
  [PinBindingSpecialAction.sync]: t("Sync"),
  [PinBindingSpecialAction.dump_info]: t("Diagnostic Report"),
  [PinBindingSpecialAction.read_status]: t("Read Status"),
  [PinBindingSpecialAction.take_photo]: t("Take Photo"),
  "": t("None")
};

export const specialActionList: DropDownItem[] =
  Object.values(PinBindingSpecialAction)
    .map((action: PinBindingSpecialAction) =>
      ({ label: specialActionLabelLookup[action], value: action }));

enum ButtonPin {
  estop = 16,
  unlock = 22,
  btn3 = 26,
  btn4 = 5,
  btn5 = 20,
}

enum LEDPin {
  sync = 24,
  connection = 25,
  led3 = 12,
  led4 = 13,
  estop = 17,
  unlock = 23,
  btn3 = 27,
  btn4 = 6,
  btn5 = 21,
}

const sysLedBindings = Object.values(LEDPin);
export const sysBtnBindings = [ButtonPin.estop, ButtonPin.unlock];
export const sysBindings = sysLedBindings.concat(sysBtnBindings);

const piI2cPins = [0, 1, 2, 3];
export const reservedPiGPIO = piI2cPins;

const LabeledGpioPins: { [x: number]: string } = {
  [ButtonPin.estop]: "Button 1: E-STOP",
  [ButtonPin.unlock]: "Button 2: UNLOCK",
  [ButtonPin.btn3]: "Button 3",
  [ButtonPin.btn4]: "Button 4",
  [ButtonPin.btn5]: "Button 5",
};

export const generatePinLabel = (pin: number) =>
  LabeledGpioPins[pin]
    ? `${LabeledGpioPins[pin]} (Pi ${pin})`
    : `Pi GPIO ${pin}`;

export const validGpioPins: number[] =
  flattenDeep(gpio)
    .filter(x => isNumber(x))
    .map((x: number) => x);
// .filter(n => !reservedPiGPIO.includes(n));

export const sortByNameAndPin = (a: number, b: number) => {
  const aLabel = generatePinLabel(a).slice(0, 8);
  const bLabel = generatePinLabel(b).slice(0, 8);
  // Sort "Button 1", "Button 2", etc.
  if (aLabel < bLabel) { return -1; }
  if (aLabel > bLabel) { return 1; }
  // Sort "GPIO Pi 4", "GPIO Pi 10", etc.
  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
};

export const RpiPinList = (taken: number[]): DropDownItem[] =>
  validGpioPins
    .filter(n => !sysBindings.includes(n))
    .filter(n => !taken.includes(n))
    .filter(n => !reservedPiGPIO.includes(n))
    .sort(sortByNameAndPin)
    .map(n => ({ label: generatePinLabel(n), value: n }));

export const sysBtnBindingData = [
  {
    pin_number: ButtonPin.estop,
    sequence_id: undefined,
    special_action: PinBindingSpecialAction.emergency_lock,
    binding_type: PinBindingType.special,
    uuid: "FBOS built-in binding: emergency_lock"
  },
  {
    pin_number: ButtonPin.unlock,
    sequence_id: undefined,
    special_action: PinBindingSpecialAction.emergency_unlock,
    binding_type: PinBindingType.special,
    uuid: "FBOS built-in binding: emergency_unlock"
  },
];
