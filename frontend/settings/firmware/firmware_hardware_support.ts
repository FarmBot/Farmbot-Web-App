import { FirmwareHardware, TaggedFbosConfig } from "farmbot";
import { Feature, ShouldDisplay } from "../../devices/interfaces";

export const isFwHardwareValue = (x?: unknown): x is FirmwareHardware => {
  const values: FirmwareHardware[] = [
    "arduino",
    "farmduino", "farmduino_k14", "farmduino_k15",
    "express_k10",
    "none",
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

export const isExpress = (firmwareHardware: FirmwareHardware | undefined) =>
  !!(firmwareHardware && EXPRESS_BOARDS.includes(firmwareHardware));

export const hasZ2Params = (
  firmwareHardware: FirmwareHardware | undefined,
  shouldDisplay: ShouldDisplay,
) =>
  (isTMCBoard(firmwareHardware) && shouldDisplay(Feature.z2_firmware_params_tmc)) ||
  (isExpress(firmwareHardware) && shouldDisplay(Feature.z2_firmware_params));

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

export const getBoardCategoryFromFwHw =
  (firmwareHardware: FirmwareHardware | undefined):
    "Farmduino" | "Arduino" | "None" => {
    if (firmwareHardware === "none") { return "None"; }
    return firmwareHardware === "arduino" ? "Arduino" : "Farmduino";
  };

export const getKitName =
  (firmwareHardware: FirmwareHardware | undefined): KitLabels => {
    return KIT_LOOKUP[firmwareHardware || "unknown"];
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

enum BoardLabels {
  arduino = "Arduino/RAMPS (Genesis v1.2)",
  farmduino = "Farmduino (Genesis v1.3)",
  farmduino_k14 = "Farmduino (Genesis v1.4)",
  farmduino_k15 = "Farmduino (Genesis v1.5)",
  express_k10 = "Farmduino (Express v1.0)",
  none = "None",
}

enum KitLabels {
  arduino = "Genesis v1.2",
  farmduino = "Genesis v1.3",
  farmduino_k14 = "Genesis v1.4",
  farmduino_k15 = "Genesis v1.5",
  express_k10 = "Express v1.0",
  none = "None",
  unknown = "Farmduino",
}

const KIT_LOOKUP = {
  arduino: KitLabels.arduino,
  farmduino: KitLabels.farmduino,
  farmduino_k14: KitLabels.farmduino_k14,
  farmduino_k15: KitLabels.farmduino_k15,
  express_k10: KitLabels.express_k10,
  none: KitLabels.none,
  unknown: KitLabels.unknown,
};

const ARDUINO = { label: BoardLabels.arduino, value: "arduino" };
const FARMDUINO = { label: BoardLabels.farmduino, value: "farmduino" };
const FARMDUINO_K14 = { label: BoardLabels.farmduino_k14, value: "farmduino_k14" };
const FARMDUINO_K15 = { label: BoardLabels.farmduino_k15, value: "farmduino_k15" };
const EXPRESS_K10 = { label: BoardLabels.express_k10, value: "express_k10" };
const NONE = { label: BoardLabels.none, value: "none" };

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
