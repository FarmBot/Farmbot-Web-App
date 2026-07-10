export type BotVersionNumber = "v1.7" | "v1.8" | "v1.9";
export type BotCameraFrame = "cross-slide" | "z-axis";
export type YCCSupportType = "models" | "extrusion";

export type BotVersion = Readonly<{
  number: BotVersionNumber;
  gantry: "v1.7" | "v1.9";
  leadscrewDrive: boolean;
  beamShape: "beam" | "beamV19";
  beamEndOffset: number;
  columnBaseZ: number;
  columnLength: number;
  cameraFrame: BotCameraFrame;
  cameraCable: "v1.7" | "v1.9";
  xCableCarrierMount: boolean;
  yMinimumStop: boolean;
  beltRouting: "v1.7" | "v1.9";
  zAxisBelt: boolean;
  yCCSupport: YCCSupportType;
  yCCDepth: number;
  zCCDepth: number;
  horizontalCCSupportWidth: number;
  verticalCCSupportWidth: number;
  verticalCCExtraLength: number;
  electronicsButtonCount: 3 | 5;
  electronicsLeds: boolean;
  ledsUnderBeam: boolean;
  promoToolbay: "three-slot" | "five-slot";
}>;

const BOT_VERSIONS: Record<BotVersionNumber, BotVersion> = {
  "v1.7": {
    number: "v1.7",
    gantry: "v1.7",
    leadscrewDrive: true,
    beamShape: "beam",
    beamEndOffset: 130,
    columnBaseZ: 30,
    columnLength: 500,
    cameraFrame: "z-axis",
    cameraCable: "v1.7",
    xCableCarrierMount: true,
    yMinimumStop: true,
    beltRouting: "v1.7",
    zAxisBelt: false,
    yCCSupport: "models",
    yCCDepth: 60,
    zCCDepth: 60,
    horizontalCCSupportWidth: 0,
    verticalCCSupportWidth: 0,
    verticalCCExtraLength: 0,
    electronicsButtonCount: 5,
    electronicsLeds: true,
    ledsUnderBeam: true,
    promoToolbay: "three-slot",
  },
  "v1.8": {
    number: "v1.8",
    gantry: "v1.7",
    leadscrewDrive: true,
    beamShape: "beam",
    beamEndOffset: 130,
    columnBaseZ: 30,
    columnLength: 500,
    cameraFrame: "z-axis",
    cameraCable: "v1.7",
    xCableCarrierMount: true,
    yMinimumStop: true,
    beltRouting: "v1.7",
    zAxisBelt: false,
    yCCSupport: "extrusion",
    yCCDepth: 40,
    zCCDepth: 60,
    horizontalCCSupportWidth: 40,
    verticalCCSupportWidth: 60,
    verticalCCExtraLength: 0,
    electronicsButtonCount: 3,
    electronicsLeds: false,
    ledsUnderBeam: false,
    promoToolbay: "three-slot",
  },
  "v1.9": {
    number: "v1.9",
    gantry: "v1.9",
    leadscrewDrive: false,
    beamShape: "beamV19",
    beamEndOffset: 50,
    columnBaseZ: 90,
    columnLength: 450,
    cameraFrame: "cross-slide",
    cameraCable: "v1.9",
    xCableCarrierMount: false,
    yMinimumStop: false,
    beltRouting: "v1.9",
    zAxisBelt: true,
    yCCSupport: "extrusion",
    yCCDepth: 30,
    zCCDepth: 30,
    horizontalCCSupportWidth: 30,
    verticalCCSupportWidth: 30,
    verticalCCExtraLength: 225,
    electronicsButtonCount: 3,
    electronicsLeds: false,
    ledsUnderBeam: false,
    promoToolbay: "five-slot",
  },
};

export const getBotVersion = (kitVersion: string): BotVersion => {
  switch (kitVersion) {
    case "v1.7":
    case "v1.8":
      return BOT_VERSIONS[kitVersion];
    case "v1.9":
    default:
      return BOT_VERSIONS["v1.9"];
  }
};
