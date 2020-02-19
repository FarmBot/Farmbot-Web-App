import {
  PinBindingType,
  PinBindingSpecialAction
} from "farmbot/dist/resources/api_resources";
import { DropDownItem } from "../../ui";
import { gpio } from "./rpi_gpio_diagram";
import { flattenDeep, isNumber } from "lodash";
import { sysBtnBindings } from "./tagged_pin_binding_init";
import { t } from "../../i18next_wrapper";

export const bindingTypeLabelLookup: { [x: string]: string } = {
  [PinBindingType.standard]: t("Sequence"),
  [PinBindingType.special]: t("Action"),
  "": t("Sequence"),
};

export const bindingTypeList = (): DropDownItem[] =>
  Object.entries(bindingTypeLabelLookup)
    .filter(([value, _]) => !(value == ""))
    .map(([value, label]) => ({ label, value }));

export const specialActionLabelLookup: { [x: string]: string } = {
  [PinBindingSpecialAction.emergency_lock]: t("E-STOP"),
  [PinBindingSpecialAction.emergency_unlock]: t("UNLOCK"),
  [PinBindingSpecialAction.power_off]: t("Shutdown"),
  [PinBindingSpecialAction.reboot]: t("Reboot"),
  [PinBindingSpecialAction.sync]: t("Sync"),
  [PinBindingSpecialAction.read_status]: t("Read Status"),
  [PinBindingSpecialAction.take_photo]: t("Take Photo"),
  "": t("None")
};

export const specialActionList: DropDownItem[] =
  Object.values(PinBindingSpecialAction)
    .filter(action => action != PinBindingSpecialAction.dump_info)
    .map((action: PinBindingSpecialAction) =>
      ({ label: specialActionLabelLookup[action], value: action }));

export const getSpecialActionLabel =
  (action: PinBindingSpecialAction | undefined) =>
    specialActionLabelLookup[action || ""] || "";

/** Pin numbers for standard buttons. */
export enum ButtonPin {
  estop = 16,
  unlock = 22,
  btn3 = 26,
  btn4 = 5,
  btn5 = 20,
}

/** Pin numbers used for LED control; cannot be used in a pin binding. */
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

/** Other pins used by FarmBot OS that cannot be used in pin bindings. */
enum SystemPins {
  i2c1_sda = 2,
  i2c1_scl = 3,
  spi0_ce1 = 7,
  spi0_ce0 = 8,
  spi0_miso = 9,
  spi0_mosi = 10,
  spi0_sclk = 11,
  uart_tx = 14,
  uart_rx = 15,
  reset_2560 = 19,
}

const toPinNum = (n: string) => parseInt(n);

const sysLedBindings: number[] = Object.values(LEDPin).map(toPinNum);
const otherSysBindings: number[] = Object.values(SystemPins).map(toPinNum);
/** All pin numbers used by FarmBot OS that cannot be used in pin bindings. */
export const sysBindings = sysLedBindings.concat(sysBtnBindings, otherSysBindings);

const piI2c0Pins = [0, 1];
export const piSpi0Pins = [7, 8, 9, 10, 11];
export const piSpi1Pins = [16, 17, 18, 19, 20, 21];
/** Pin numbers used for special purposes by the RPi. (internal pullup, etc.) */
export const reservedPiGPIO = piI2c0Pins;

const GPIO_PIN_LABELS = (): { [x: number]: string } => ({
  [ButtonPin.estop]: t("Button {{ num }}: E-STOP", { num: 1 }),
  [ButtonPin.unlock]: t("Button {{ num }}: UNLOCK", { num: 2 }),
  [ButtonPin.btn3]: t("Button {{ num }})", { num: 3 }),
  [ButtonPin.btn4]: t("Button {{ num }}", { num: 4 }),
  [ButtonPin.btn5]: t("Button {{ num }}", { num: 5 }),
});

export const generatePinLabel = (pin: number) =>
  GPIO_PIN_LABELS()[pin]
    ? `${t(GPIO_PIN_LABELS()[pin])} (Pi ${pin})`
    : `Pi GPIO ${pin}`;

/** Raspberry Pi GPIO pin numbers. */
export const validGpioPins: number[] =
  flattenDeep(gpio)
    .filter(x => isNumber(x))
    .map((x: number) => x);

/** Sort fn for pin numbers using their labels. */
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

/** Given a list of bound pins, return a list of available pins (DDIs). */
export const RpiPinList = (taken: number[]): DropDownItem[] =>
  validGpioPins
    .filter(n => !sysBindings.includes(n))
    .filter(n => !taken.includes(n))
    .filter(n => !reservedPiGPIO.includes(n))
    .sort(sortByNameAndPin)
    .map(n => ({ label: generatePinLabel(n), value: n }));

/** FarmBot OS default pin binding data used by Pin Bindings widget. */
export const stockPinBindings = [
  {
    pin_num: ButtonPin.estop,
    special_action: PinBindingSpecialAction.emergency_lock,
    binding_type: PinBindingType.special,
  },
  {
    pin_num: ButtonPin.unlock,
    special_action: PinBindingSpecialAction.emergency_unlock,
    binding_type: PinBindingType.special,
  },
];
