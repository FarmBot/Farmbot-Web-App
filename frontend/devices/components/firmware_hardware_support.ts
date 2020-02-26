import { FirmwareHardware, TaggedFbosConfig } from "farmbot";

export const isFwHardwareValue = (x?: unknown): x is FirmwareHardware => {
  const values: FirmwareHardware[] = [
    "arduino",
    "farmduino", "farmduino_k14", "farmduino_k15",
    "express_k10",
    "none"
  ];
  return !!values.includes(x as FirmwareHardware);
};

export const getFwHardwareValue =
  (fbosConfig: TaggedFbosConfig | undefined) => {
    const value = fbosConfig?.body.firmware_hardware;
    return isFwHardwareValue(value) ? value : undefined;
  };

const NO_BUTTONS = ["arduino", "farmduino", "none"];
const EXPRESS_BOARDS = ["express_k10"];
const NO_SENSORS = [...EXPRESS_BOARDS];
const NO_ENCODERS = [...EXPRESS_BOARDS];
const NO_TOOLS = [...EXPRESS_BOARDS];
const NO_TMC = ["arduino", "farmduino", "farmduino_k14"];

export const isTMCBoard = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_TMC.includes(firmwareHardware);

export const isExpressBoard = (firmwareHardware: FirmwareHardware | undefined) =>
  !!(firmwareHardware && EXPRESS_BOARDS.includes(firmwareHardware));

export const hasButtons = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_BUTTONS.includes(firmwareHardware);

export const hasEncoders = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_ENCODERS.includes(firmwareHardware);

export const hasSensors = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_SENSORS.includes(firmwareHardware);

export const hasUTM = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_TOOLS.includes(firmwareHardware);

export const getBoardIdentifier =
  (firmwareVersion: string | undefined): string =>
    firmwareVersion ? firmwareVersion.split(".")[3] : "undefined";

export const isKnownBoard = (firmwareVersion: string | undefined): boolean => {
  const boardIdentifier = getBoardIdentifier(firmwareVersion);
  return ["R", "F", "G", "H", "E"].includes(boardIdentifier);
};

export const getBoardCategory =
  (firmwareVersion: string | undefined): "Farmduino" | "Arduino" => {
    const boardIdentifier = getBoardIdentifier(firmwareVersion);
    return boardIdentifier === "R" ? "Arduino" : "Farmduino";
  };

export const boardType =
  (firmwareVersion: string | undefined): FirmwareHardware | "unknown" => {
    if (firmwareVersion === "none") { return "none"; }
    const boardIdentifier = getBoardIdentifier(firmwareVersion);
    switch (boardIdentifier) {
      case "R":
        return "arduino";
      case "F":
        return "farmduino";
      case "G":
        return "farmduino_k14";
      case "H":
        return "farmduino_k15";
      case "E":
        return "express_k10";
      default:
        return "unknown";
    }
  };

const ARDUINO = { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" };
const FARMDUINO = { label: "Farmduino (Genesis v1.3)", value: "farmduino" };
const FARMDUINO_K14 = {
  label: "Farmduino (Genesis v1.4)", value: "farmduino_k14"
};
const FARMDUINO_K15 = {
  label: "Farmduino (Genesis v1.5)", value: "farmduino_k15"
};
const EXPRESS_K10 = {
  label: "Farmduino (Express v1.0)", value: "express_k10"
};
const NONE = { label: "None", value: "none" };

export const FIRMWARE_CHOICES_DDI = {
  [ARDUINO.value]: ARDUINO,
  [FARMDUINO.value]: FARMDUINO,
  [FARMDUINO_K14.value]: FARMDUINO_K14,
  [FARMDUINO_K15.value]: FARMDUINO_K15,
  [EXPRESS_K10.value]: EXPRESS_K10,
  [NONE.value]: NONE
};

export const getFirmwareChoices = () => ([
  ARDUINO,
  FARMDUINO,
  FARMDUINO_K14,
  FARMDUINO_K15,
  EXPRESS_K10,
  NONE,
]);
