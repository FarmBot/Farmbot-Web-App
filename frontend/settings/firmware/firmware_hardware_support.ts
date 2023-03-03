import { FirmwareHardware, TaggedFbosConfig } from "farmbot";

export const isFwHardwareValue = (x?: unknown): x is FirmwareHardware => {
  const values: FirmwareHardware[] = [
    "arduino",
    "farmduino", "farmduino_k14", "farmduino_k15", "farmduino_k16",
    "express_k10", "express_k11",
    "none",
  ];
  return !!values.includes(x as FirmwareHardware);
};

const ordered: FirmwareHardware[] = [
  "express_k10",
  "express_k11",
  "arduino",
  "farmduino",
  "farmduino_k14",
  "farmduino_k15",
  "farmduino_k16",
  "none",
];

export const isUpgrade =
  (prev: FirmwareHardware | undefined, next: FirmwareHardware): boolean =>
    !!(prev && (ordered.indexOf(next) - ordered.indexOf(prev)) > 0);

export const validFirmwareHardware = (value: unknown) =>
  isFwHardwareValue(value) ? value : undefined;

export const getFwHardwareValue =
  (fbosConfig: TaggedFbosConfig | undefined) => {
    const value = fbosConfig?.body.firmware_hardware;
    return validFirmwareHardware(value);
  };

const NO_BUTTONS = ["arduino", "farmduino", "none"];
const EXPRESS_BOARDS = ["express_k10", "express_k11"];
const NO_SENSORS = [...EXPRESS_BOARDS];
const NO_ENCODERS = [...EXPRESS_BOARDS];
const NO_TOOLS = [...EXPRESS_BOARDS];
const NO_ETHERNET = ["express_k10"];
const NO_EXTRA_BUTTONS = [...EXPRESS_BOARDS];
const NO_TMC = ["arduino", "farmduino", "farmduino_k14"];
const NO_ROTARY = ["arduino", "farmduino", "farmduino_k14", "farmduino_k15"]
  .concat(EXPRESS_BOARDS);

export const isTMCBoard = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_TMC.includes(firmwareHardware);

export const isExpress = (firmwareHardware: FirmwareHardware | undefined) =>
  !!(firmwareHardware && EXPRESS_BOARDS.includes(firmwareHardware));

export const hasButtons = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_BUTTONS.includes(firmwareHardware);

export const hasExtraButtons = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_EXTRA_BUTTONS.includes(firmwareHardware);

export const hasEncoders = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_ENCODERS.includes(firmwareHardware);

export const hasSensors = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_SENSORS.includes(firmwareHardware);

export const hasUTM = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_TOOLS.includes(firmwareHardware);

export const hasRotaryTool = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_ROTARY.includes(firmwareHardware);

export const hasEthernet = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_ETHERNET.includes(firmwareHardware);

const getBoardIdentifier =
  (firmwareVersion: string | undefined): string =>
    firmwareVersion ? firmwareVersion.split(".")[3] : "undefined";

export const isKnownBoard = (firmwareVersion: string | undefined): boolean => {
  const boardIdentifier = getBoardIdentifier(firmwareVersion);
  return Object.keys(FIRMWARE_LOOKUP).includes(boardIdentifier);
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
    return FIRMWARE_LOOKUP[boardIdentifier] || "unknown";
  };

const FIRMWARE_LOOKUP: { [id: string]: FirmwareHardware } = {
  R: "arduino",
  F: "farmduino",
  G: "farmduino_k14",
  H: "farmduino_k15",
  I: "farmduino_k16",
  E: "express_k10",
  D: "express_k11",
};

enum BoardLabels {
  arduino = "Arduino/RAMPS (Genesis v1.2)",
  farmduino = "Farmduino (Genesis v1.3)",
  farmduino_k14 = "Farmduino (Genesis v1.4)",
  farmduino_k15 = "Farmduino (Genesis v1.5)",
  farmduino_k16 = "Farmduino (Genesis v1.6)",
  express_k10 = "Farmduino (Express v1.0)",
  express_k11 = "Farmduino (Express v1.1)",
  none = "None",
}

enum KitLabels {
  arduino = "Genesis v1.2",
  farmduino = "Genesis v1.3",
  farmduino_k14 = "Genesis v1.4",
  farmduino_k15 = "Genesis v1.5",
  farmduino_k16 = "Genesis v1.6",
  express_k10 = "Express v1.0",
  express_k11 = "Express v1.1",
  none = "None",
  unknown = "Farmduino",
}

const KIT_LOOKUP = {
  arduino: KitLabels.arduino,
  farmduino: KitLabels.farmduino,
  farmduino_k14: KitLabels.farmduino_k14,
  farmduino_k15: KitLabels.farmduino_k15,
  farmduino_k16: KitLabels.farmduino_k16,
  express_k10: KitLabels.express_k10,
  express_k11: KitLabels.express_k11,
  none: KitLabels.none,
  unknown: KitLabels.unknown,
};

const ARDUINO = { label: BoardLabels.arduino, value: "arduino" };
const FARMDUINO = { label: BoardLabels.farmduino, value: "farmduino" };
const FARMDUINO_K14 = { label: BoardLabels.farmduino_k14, value: "farmduino_k14" };
const FARMDUINO_K15 = { label: BoardLabels.farmduino_k15, value: "farmduino_k15" };
const FARMDUINO_K16 = { label: BoardLabels.farmduino_k16, value: "farmduino_k16" };
const EXPRESS_K10 = { label: BoardLabels.express_k10, value: "express_k10" };
const EXPRESS_K11 = { label: BoardLabels.express_k11, value: "express_k11" };
const NONE = { label: BoardLabels.none, value: "none" };

export const FIRMWARE_CHOICES_DDI = {
  [ARDUINO.value]: ARDUINO,
  [FARMDUINO.value]: FARMDUINO,
  [FARMDUINO_K14.value]: FARMDUINO_K14,
  [FARMDUINO_K15.value]: FARMDUINO_K15,
  [FARMDUINO_K16.value]: FARMDUINO_K16,
  [EXPRESS_K10.value]: EXPRESS_K10,
  [EXPRESS_K11.value]: EXPRESS_K11,
  [NONE.value]: NONE,
};

export const getFirmwareChoices = () => ([
  ARDUINO,
  FARMDUINO,
  FARMDUINO_K14,
  FARMDUINO_K15,
  FARMDUINO_K16,
  EXPRESS_K10,
  EXPRESS_K11,
  NONE,
]);
