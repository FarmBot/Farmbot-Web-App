import { FirmwareHardware, TaggedFbosConfig } from "farmbot";
import { shouldDisplayFeature } from "../../devices/should_display";
import { Feature } from "../../devices/interfaces";

export const isFwHardwareValue = (x?: unknown): x is FirmwareHardware => {
  const values: FirmwareHardware[] = [
    "arduino",
    "farmduino", "farmduino_k14", "farmduino_k15", "farmduino_k16", "farmduino_k17",
    "express_k10", "express_k11", "express_k12",
    "none",
  ];
  return !!values.includes(x as FirmwareHardware);
};

const ordered: FirmwareHardware[] = [
  "express_k10",
  "express_k11",
  "express_k12",
  "arduino",
  "farmduino",
  "farmduino_k14",
  "farmduino_k15",
  "farmduino_k16",
  "farmduino_k17",
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
const EXPRESS_BOARDS = ["express_k10", "express_k11", "express_k12"];
const NO_SENSORS = [...EXPRESS_BOARDS];
const NO_ENCODERS = [...EXPRESS_BOARDS];
const NO_TOOLS = [...EXPRESS_BOARDS];
const NO_ETHERNET = ["express_k10"];
const NO_ZERO_2 = ["express_k10"];
const NO_EXTRA_BUTTONS = [...EXPRESS_BOARDS];
const NO_TMC = ["arduino", "farmduino", "farmduino_k14"];
const HAS_WEEDER = [
  "arduino", "farmduino", "farmduino_k14", "farmduino_k15", "farmduino_k16",
];
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

export const hasWeeder = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || HAS_WEEDER.includes(firmwareHardware);

export const hasRotaryTool = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_ROTARY.includes(firmwareHardware);

export const hasEthernet = (firmwareHardware: FirmwareHardware | undefined) =>
  !firmwareHardware || !NO_ETHERNET.includes(firmwareHardware);

export const hasZero2 = (firmwareHardware: FirmwareHardware | undefined) =>
  isExpress(firmwareHardware)
  && !NO_ZERO_2.includes(firmwareHardware as FirmwareHardware);

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
  J: "farmduino_k17",
  E: "express_k10",
  D: "express_k11",
  C: "express_k12",
};

enum BoardLabels {
  arduino = "Arduino/RAMPS (Genesis v1.2)",
  farmduino = "Farmduino (Genesis v1.3)",
  farmduino_k14 = "Farmduino (Genesis v1.4)",
  farmduino_k15 = "Farmduino (Genesis v1.5)",
  farmduino_k16 = "Farmduino (Genesis v1.6)",
  farmduino_k17 = "Farmduino (Genesis v1.7)",
  express_k10 = "Farmduino (Express v1.0)",
  express_k11 = "Farmduino (Express v1.1)",
  express_k12 = "Farmduino (Express v1.2)",
  none = "None",
}

enum KitLabels {
  arduino = "Genesis v1.2",
  farmduino = "Genesis v1.3",
  farmduino_k14 = "Genesis v1.4",
  farmduino_k15 = "Genesis v1.5",
  farmduino_k16 = "Genesis v1.6",
  farmduino_k17 = "Genesis v1.7",
  express_k10 = "Express v1.0",
  express_k11 = "Express v1.1",
  express_k12 = "Express v1.2",
  none = "None",
  unknown = "Farmduino",
}

const KIT_LOOKUP = {
  arduino: KitLabels.arduino,
  farmduino: KitLabels.farmduino,
  farmduino_k14: KitLabels.farmduino_k14,
  farmduino_k15: KitLabels.farmduino_k15,
  farmduino_k16: KitLabels.farmduino_k16,
  farmduino_k17: KitLabels.farmduino_k17,
  express_k10: KitLabels.express_k10,
  express_k11: KitLabels.express_k11,
  express_k12: KitLabels.express_k12,
  none: KitLabels.none,
  unknown: KitLabels.unknown,
};

const ARDUINO = { label: BoardLabels.arduino, value: "arduino" };
const FARMDUINO = { label: BoardLabels.farmduino, value: "farmduino" };
const FARMDUINO_K14 = { label: BoardLabels.farmduino_k14, value: "farmduino_k14" };
const FARMDUINO_K15 = { label: BoardLabels.farmduino_k15, value: "farmduino_k15" };
const FARMDUINO_K16 = { label: BoardLabels.farmduino_k16, value: "farmduino_k16" };
const FARMDUINO_K17 = { label: BoardLabels.farmduino_k17, value: "farmduino_k17" };
const EXPRESS_K10 = { label: BoardLabels.express_k10, value: "express_k10" };
const EXPRESS_K11 = { label: BoardLabels.express_k11, value: "express_k11" };
const EXPRESS_K12 = { label: BoardLabels.express_k12, value: "express_k12" };
const NONE = { label: BoardLabels.none, value: "none" };

export const FIRMWARE_CHOICES_DDI = {
  [FARMDUINO_K17.value]: FARMDUINO_K17,
  [FARMDUINO_K16.value]: FARMDUINO_K16,
  [FARMDUINO_K15.value]: FARMDUINO_K15,
  [FARMDUINO_K14.value]: FARMDUINO_K14,
  [FARMDUINO.value]: FARMDUINO,
  [ARDUINO.value]: ARDUINO,
  [EXPRESS_K12.value]: EXPRESS_K12,
  [EXPRESS_K11.value]: EXPRESS_K11,
  [EXPRESS_K10.value]: EXPRESS_K10,
  [NONE.value]: NONE,
};

export const getFirmwareChoices = () => ([
  FARMDUINO_K17,
  FARMDUINO_K16,
  FARMDUINO_K15,
  FARMDUINO_K14,
  FARMDUINO,
  ARDUINO,
  ...(shouldDisplayFeature(Feature.express_k12) ? [EXPRESS_K12] : []),
  EXPRESS_K11,
  EXPRESS_K10,
  NONE,
]);
