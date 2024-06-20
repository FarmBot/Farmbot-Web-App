import { t } from "../i18next_wrapper";
import { round } from "lodash";
import { SetupWizardContent, ToolTips } from "../constants";
import {
  WizardSection, WizardStepDataProps, WizardSteps, WizardToC, WizardToCSection,
} from "./interfaces";
import { botOnlineReq, ProductRegistration } from "./prerequisites";
import {
  AssemblyDocs,
  CameraCalibrationCheck,
  CameraCheck,
  Connectivity,
  FirmwareHardwareSelection,
  lowVoltageProblemStatus,
  CameraCalibrationCard,
  SwitchCameraCalibrationMethod,
  PeripheralsCheck,
  ToolCheck,
  SoilHeightMeasurementCheck,
  InvertJogButton,
  SwapJogButton,
  DisableStallDetection,
  RotateMapToggle,
  SelectMapOrigin,
  SensorsCheck,
  CameraOffset,
  FindHome,
  CameraReplacement,
  SetHome,
  FlashFirmware,
  CameraImageOrigin,
  MapOrientation,
  Tour,
  NetworkRequirementsLink,
  AxisActions,
  DynamicMapToggle,
  BootSequence,
  FlowRateInput,
  CheckForResistance,
  MotorCurrentContent,
  FindAxisLength,
  RpiSelection,
  DownloadOS,
  DownloadImager,
  Language,
  AutoUpdate,
} from "./checks";
import { TaggedWizardStepResult } from "farmbot";
import {
  hasEthernet, hasExtraButtons, hasRotaryTool, hasUTM, hasWeeder, isExpress,
} from "../settings/firmware/firmware_hardware_support";
import { BooleanSetting } from "../session_keys";
import { ExternalUrl } from "../external_urls";
import {
  motorCurrentMaToPercent, motorCurrentPercentToMa,
} from "../settings/hardware_settings";

const motorCurrentProps = ({
  inputMax: 100,
  toInput: motorCurrentMaToPercent,
  fromInput: motorCurrentPercentToMa,
});

export const setupProgressString = (
  results: TaggedWizardStepResult[],
  stepDataProps: WizardStepDataProps,
) => {
  const completed = results.filter(result => result.body.answer).length;
  const total = WIZARD_STEPS(stepDataProps).length;
  return `${round(completed / total * 100)}% ${t("complete")}`;
};

export enum WizardSectionSlug {
  intro = "intro",
  os = "os",
  connectivity = "connectivity",
  map = "map",
  motors = "motors",
  controls = "controls",
  home = "home",
  movements = "movements",
  axisLength = "axisLength",
  peripherals = "peripherals",
  camera = "camera",
  tools = "tools",
  tours = "tours",
}

const WIZARD_TOC =
  (props: WizardStepDataProps): WizardToC => {
    const toc: WizardToC = {
      [WizardSectionSlug.intro]: { title: t("INTRO"), steps: [] },
      [WizardSectionSlug.os]: { title: t("INSTALL FARMBOT OS"), steps: [] },
      [WizardSectionSlug.connectivity]: { title: t("CONNECTIVITY"), steps: [] },
      [WizardSectionSlug.map]: { title: t("MAP"), steps: [] },
      [WizardSectionSlug.motors]: { title: t("MOTORS"), steps: [] },
      [WizardSectionSlug.controls]: { title: t("MANUAL CONTROLS"), steps: [] },
      [WizardSectionSlug.home]: { title: t("HOME POSITION"), steps: [] },
      [WizardSectionSlug.movements]: { title: t("MOVEMENTS"), steps: [] },
      [WizardSectionSlug.axisLength]: { title: t("AXIS LENGTH"), steps: [] },
      [WizardSectionSlug.peripherals]: { title: t("PERIPHERALS"), steps: [] },
      [WizardSectionSlug.camera]: { title: t("CAMERA"), steps: [] },
      [WizardSectionSlug.tools]: {
        title: hasUTM(props.firmwareHardware) ? t("UTM and TOOLS") : t("TOOLS"),
        steps: [],
      },
      [WizardSectionSlug.tours]: { title: t("TOURS"), steps: [] },
    };
    return toc;
  };

export enum WizardStepSlug {
  intro = "intro",
  language = "language",
  orderInfo = "orderInfo",
  model = "model",
  rpi = "rpi",
  downloadOs = "downloadOs",
  downloadImager = "downloadImager",
  computerSdCard = "computerSdCard",
  flashSdCard = "flashSdCard",
  insertSdCard = "insertSdCard",
  assembled = "assembled",
  prePowerPosition = "prePowerPosition",
  networkPorts = "networkPorts",
  ethernetOption = "ethernetOption",
  power = "power",
  configuratorNetwork = "configuratorNetwork",
  configuratorBrowser = "configuratorBrowser",
  configuratorSteps = "configuratorSteps",
  connection = "connection",
  autoUpdate = "autoUpdate",
  mapOrientation = "mapOrientation",
  xMotor = "xMotor",
  yMotor = "yMotor",
  zMotor = "zMotor",
  controlsVideo = "controlsVideo",
  xAxis = "xAxis",
  yAxis = "yAxis",
  zAxis = "zAxis",
  xAxisFindHome = "xAxisFindHome",
  yAxisFindHome = "yAxisFindHome",
  zAxisFindHome = "zAxisFindHome",
  findHomeOnBoot = "findHomeOnBoot",
  movementsVideo = "movementsVideo",
  xAxisMovement = "xAxisMovement",
  yAxisMovement = "yAxisMovement",
  zAxisMovement = "zAxisMovement",
  xAxisLength = "xAxisLength",
  yAxisLength = "yAxisLength",
  zAxisLength = "zAxisLength",
  dynamicMapSize = "dynamicMapSize",
  valve = "valve",
  vacuum = "vacuum",
  lights = "lights",
  eStopButton = "eStopButton",
  unlockButton = "unlockButton",
  customButtons = "customButtons",
  photo = "photo",
  cameraCalibrationPreparation = "cameraCalibrationPreparation",
  cameraCalibrationCard = "cameraCalibrationCard",
  cameraCalibration = "cameraCalibration",
  cameraOffsetAdjustment = "cameraOffsetAdjustment",
  soilHeight = "soilHeight",
  utm = "utm",
  seeder = "seeder",
  wateringNozzle = "wateringNozzle",
  flowRate = "flowRate",
  weeder = "weeder",
  soilSensor = "soilSensor",
  soilSensorValue = "soilSensorValue",
  rotaryTool = "rotaryTool",
  rotaryToolForward = "rotaryToolForward",
  rotaryToolReverse = "rotaryToolReverse",
  appTour = "appTour",
  gardenTour = "gardenTour",
  toolsTour = "toolsTour",
}

// eslint-disable-next-line complexity
export const WIZARD_STEPS = (props: WizardStepDataProps): WizardSteps => {
  const { firmwareHardware } = props;
  const xySwap = !!props.getConfigValue?.(BooleanSetting.xy_swap);
  const positiveMovementInstruction = (swap: boolean) =>
    swap
      ? SetupWizardContent.PRESS_UP_JOG_BUTTON
      : SetupWizardContent.PRESS_RIGHT_JOG_BUTTON;
  const positiveMovementQuestion = (swap: boolean) =>
    swap
      ? t("Did FarmBot **move away from you**?")
      : t("Did FarmBot **move to the right**?");
  const xyMovementInstruction = (swap: boolean) =>
    swap
      ? t("Press the up arrow.")
      : t("Press the right arrow.");
  return [
    {
      section: WizardSectionSlug.intro,
      slug: WizardStepSlug.intro,
      title: t("Introduction"),
      content: SetupWizardContent.INTRO,
      question: t("Begin?"),
      outcomes: [
        {
          slug: "notYet",
          description: t("I do not wish to continue yet"),
          tips: t("Press YES when ready."),
        },
        {
          slug: "incorrect",
          description: t("I pressed the wrong button"),
          tips: t("Press YES."),
        },
      ],
    },
    {
      section: WizardSectionSlug.intro,
      slug: WizardStepSlug.language,
      title: t("Language"),
      content: t("What is your preferred language?"),
      component: Language,
      question: t("Continue?"),
      outcomes: [
      ],
    },
    {
      section: WizardSectionSlug.intro,
      slug: WizardStepSlug.orderInfo,
      title: t("Order info"),
      content: t("Please enter your FarmBot order number."),
      component: ProductRegistration,
      question: t("Continue?"),
      outcomes: [
        {
          slug: "missing",
          description: t("I do not know my order number"),
          tips: t("Check your purchase confirmation email."),
        },
      ],
    },
    {
      section: WizardSectionSlug.intro,
      slug: WizardStepSlug.model,
      title: t("FarmBot model"),
      content: t("Select your FarmBot model."),
      component: FirmwareHardwareSelection,
      question: t("Have you selected your FarmBot model?"),
      outcomes: [
        {
          slug: "unknown",
          description: t("I do not know my FarmBot model"),
          tips: t("Check your purchase confirmation email."),
        },
      ],
    },
    ...(firmwareHardware == "farmduino_k16"
      ? [{
        section: WizardSectionSlug.intro,
        slug: WizardStepSlug.rpi,
        title: t("Raspberry Pi model"),
        content: SetupWizardContent.RPI,
        component: RpiSelection,
        question: t("Have you identified which Raspberry Pi is in your FarmBot?"),
        outcomes: [
        ],
      }]
      : []),
    {
      section: WizardSectionSlug.intro,
      slug: WizardStepSlug.assembled,
      title: t("Assembly"),
      content: t("Assemble your FarmBot."),
      component: AssemblyDocs,
      question: t("Is FarmBot assembled and ready to power on?"),
      outcomes: [
        {
          slug: "assemble",
          description: t("I still need to assemble FarmBot"),
          tips: t("Visit the documentation."),
          component: AssemblyDocs,
        },
      ],
    },
    {
      section: WizardSectionSlug.intro,
      slug: WizardStepSlug.prePowerPosition,
      title: isExpress(firmwareHardware)
        ? t("Manually position the FarmBot")
        : t("Move FarmBot away from the hardstops"),
      content: isExpress(firmwareHardware)
        ? SetupWizardContent.PRE_POWER_POSITION_EXPRESS
        : SetupWizardContent.PRE_POWER_POSITION,
      question: isExpress(firmwareHardware)
        ? t("Is FarmBot positioned?")
        : t("Is FarmBot positioned away from the hardstops?"),
      outcomes: [
      ],
    },
    {
      section: WizardSectionSlug.os,
      slug: WizardStepSlug.downloadOs,
      title: t("Download FarmBot OS"),
      content: SetupWizardContent.DOWNLOAD_OS,
      component: DownloadOS,
      question: t("Has the download finished?"),
      outcomes: [
      ],
    },
    {
      section: WizardSectionSlug.os,
      slug: WizardStepSlug.downloadImager,
      title: t("Download Raspberry Pi Imager"),
      content: SetupWizardContent.IMAGER,
      images: ["rpi_imager.png"],
      component: DownloadImager,
      question: t("Is Raspberry Pi Imager installed?"),
      outcomes: [
      ],
    },
    {
      section: WizardSectionSlug.os,
      slug: WizardStepSlug.computerSdCard,
      title: t("Connect the microSD card to your computer"),
      content: isExpress(firmwareHardware)
        ? SetupWizardContent.COMPUTER_SD_CARD_EXPRESS
        : SetupWizardContent.COMPUTER_SD_CARD_GENESIS,
      images: [
        ...(isExpress(firmwareHardware)
          ? ["rpi_02_card_installed.png"]
          : ["rpi_3_card_installed.jpeg"]),
        "sd_card.jpg",
      ],
      question: t("Is the card connected?"),
      outcomes: [
      ],
    },
    {
      section: WizardSectionSlug.os,
      slug: WizardStepSlug.flashSdCard,
      title: t("Install FarmBot OS onto the microSD card"),
      content: SetupWizardContent.FLASH_SD_CARD,
      images: ["rpi_imager_flash.png"],
      question: t("Did the writing process complete?"),
      outcomes: [
      ],
    },
    {
      section: WizardSectionSlug.os,
      slug: WizardStepSlug.insertSdCard,
      title: t("Insert the microSD card into FarmBot"),
      content: isExpress(firmwareHardware)
        ? SetupWizardContent.INSERT_SD_CARD_EXPRESS
        : SetupWizardContent.INSERT_SD_CARD_GENESIS,
      images: isExpress(firmwareHardware)
        ? ["rpi_02_card_installed.png"]
        : ["rpi_3_card_installed.jpeg"],
      question: t("Have you inserted the microSD card into the Raspberry Pi?"),
      outcomes: [
      ],
    },
    {
      section: WizardSectionSlug.connectivity,
      slug: WizardStepSlug.networkPorts,
      title: t("Open network ports"),
      content: SetupWizardContent.NETWORK_PORTS,
      component: NetworkRequirementsLink,
      question: SetupWizardContent.NETWORK_PORTS_QUESTION,
      outcomes: [],
    },
    ...(hasEthernet(firmwareHardware)
      ? [{
        section: WizardSectionSlug.connectivity,
        slug: WizardStepSlug.ethernetOption,
        title: t("Ethernet connection (optional)"),
        content: SetupWizardContent.ETHERNET_OPTION,
        question: SetupWizardContent.ETHERNET_OPTION_QUESTION,
        outcomes: [
          {
            slug: "ethernetPort",
            description: t("I do not know where to connect the ethernet cable"),
            tips: "",
            images: isExpress(firmwareHardware)
              ? ["farmduino_ethernet_port.jpg"]
              : ["rpi_ethernet_port.jpg"],
          },
        ],
      }]
      : []),
    {
      section: WizardSectionSlug.connectivity,
      slug: WizardStepSlug.power,
      title: t("Power up"),
      content: t("Plug in FarmBot's power."),
      question: t("Did any lights in the electronics box light up?"),
      outcomes: [
        {
          slug: "noPower",
          description: t("There is no power"),
          tips: t("Check power cable connections."),
        },
      ],
    },
    {
      section: WizardSectionSlug.connectivity,
      slug: WizardStepSlug.configuratorNetwork,
      title: t("Configurator network"),
      content: SetupWizardContent.CONFIGURATOR_CONTENT,
      question: SetupWizardContent.CONFIGURATOR_CONNECTION_PROMPT,
      outcomes: [
        {
          slug: "noSetupNetwork",
          description: t("The FarmBot WiFi network isn't showing up"),
          tips: SetupWizardContent.NO_SETUP_NETWORK,
        },
        {
          slug: "cantConnect",
          description: SetupWizardContent.CANT_CONNECT,
          tips: SetupWizardContent.CANT_CONNECT_TIP,
        },
      ],
    },
    {
      section: WizardSectionSlug.connectivity,
      slug: WizardStepSlug.configuratorBrowser,
      title: t("Configurator"),
      content: t("Open a browser and navigate to `setup.farm.bot`"),
      images: ["configurator.png"],
      question: t("Is the configurator loaded?"),
      outcomes: [
        {
          slug: "noPageLoad",
          description: t("The page won't load"),
          tips: t("Try navigating to `192.168.24.1` instead."),
        },
        {
          slug: "redirect",
          description: t("I was redirected to a farm.bot page"),
          tips: t("If using a phone, disable cellular data and try again."),
        },
      ],
    },
    {
      section: WizardSectionSlug.connectivity,
      slug: WizardStepSlug.configuratorSteps,
      title: t("Configurator steps"),
      content: t("Complete the configurator steps."),
      question: t("Are all configurator steps complete?"),
      outcomes: [
        {
          slug: "error",
          description: t("There was an error"),
          tips: t("Check for the FarmBot WiFi network. If it is present,"),
          goToStep: {
            text: t("connect to Configurator"),
            step: WizardStepSlug.configuratorNetwork,
          },
        },
      ],
    },
    {
      section: WizardSectionSlug.connectivity,
      slug: WizardStepSlug.connection,
      title: t("Online"),
      content: "",
      component: Connectivity,
      question: t("Is FarmBot online?"),
      outcomes: [
        {
          slug: "offline",
          description: t("FarmBot is offline"),
          tips: t("Check for the FarmBot WiFi network. If it is present,"),
          goToStep: {
            text: t("connect to Configurator"),
            step: WizardStepSlug.configuratorNetwork,
          },
        },
        {
          slug: "noFirmware",
          description: t("The firmware is missing"),
          tips: t("Press the button to install your device's firmware."),
          component: FlashFirmware,
        },
      ],
    },
    {
      section: WizardSectionSlug.connectivity,
      slug: WizardStepSlug.autoUpdate,
      title: t("Auto update"),
      content: SetupWizardContent.AUTO_UPDATE,
      component: AutoUpdate,
      question: t(SetupWizardContent.AUTO_UPDATE_QUESTION),
      outcomes: [
      ],
    },
    {
      section: WizardSectionSlug.map,
      slug: WizardStepSlug.mapOrientation,
      title: t("Map orientation"),
      content: SetupWizardContent.MAP_ORIENTATION,
      video: ExternalUrl.Video.mapOrientation,
      component: MapOrientation,
      question: t("Does the virtual FarmBot match your real life FarmBot?"),
      outcomes: [
        {
          slug: "rotated",
          description: t("The map is rotated incorrectly"),
          tips: "",
          component: RotateMapToggle,
        },
        {
          slug: "incorrectOrigin",
          description: t("The map origin is in a different corner"),
          tips: t("Select the correct map origin."),
          component: SelectMapOrigin,
        },
      ],
    },
    {
      section: WizardSectionSlug.motors,
      slug: WizardStepSlug.xMotor,
      title: t("X-axis motor"),
      prerequisites: [botOnlineReq],
      content: xyMovementInstruction(xySwap),
      controlsCheckOptions: { axis: "x" },
      question: t(SetupWizardContent.DID_AXIS_MOVE, { axis: "x" }),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing happened"),
          tips: SetupWizardContent.NO_MOTOR_ACTIVITY,
          component: FlashFirmware,
        },
        {
          slug: "noMovement",
          description: SetupWizardContent.NO_MOTOR_MOVEMENT,
          tips: "",
          component: CheckForResistance,
        },
        {
          slug: "stall",
          description: t("It started to move, but stopped early"),
          tips: "",
          component: DisableStallDetection("x"),
        },
        {
          slug: "wrongAxis",
          description: t("A different axis moved"),
          tips: t("Verify axis motor connections."),
        },
      ],
    },
    {
      section: WizardSectionSlug.motors,
      slug: WizardStepSlug.yMotor,
      title: t("Y-axis motor"),
      prerequisites: [botOnlineReq],
      content: xyMovementInstruction(!xySwap),
      controlsCheckOptions: { axis: "y" },
      question: t(SetupWizardContent.DID_AXIS_MOVE, { axis: "y" }),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing happened"),
          tips: SetupWizardContent.NO_MOTOR_ACTIVITY,
        },
        {
          slug: "noMovement",
          description: SetupWizardContent.NO_MOTOR_MOVEMENT,
          tips: "",
          component: CheckForResistance,
        },
        {
          slug: "stall",
          description: t("It started to move, but stopped early"),
          tips: "",
          component: DisableStallDetection("y"),
        },
        {
          slug: "wrongAxis",
          description: t("A different axis moved"),
          tips: t("Verify axis motor connections."),
        },
      ],
    },
    {
      section: WizardSectionSlug.motors,
      slug: WizardStepSlug.zMotor,
      title: t("Z-axis motor"),
      prerequisites: [botOnlineReq],
      content: t("Press the down arrow."),
      controlsCheckOptions: { axis: "z" },
      question: t(SetupWizardContent.DID_AXIS_MOVE, { axis: "z" }),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing happened"),
          tips: SetupWizardContent.NO_MOTOR_ACTIVITY,
        },
        {
          slug: "noMovement",
          description: SetupWizardContent.NO_MOTOR_MOVEMENT,
          tips: "",
          component: CheckForResistance,
        },
        {
          slug: "stall",
          description: t("It started to move, but stopped early"),
          tips: "",
          component: DisableStallDetection("z"),
        },
        {
          slug: "wrongAxis",
          description: t("A different axis moved"),
          tips: t("Verify axis motor connections."),
        },
      ],
    },
    {
      section: WizardSectionSlug.controls,
      slug: WizardStepSlug.controlsVideo,
      title: t("Manual controls video"),
      content: SetupWizardContent.CONTROLS_VIDEO,
      video: ExternalUrl.Video.manualControls,
      question: t("Did you watch the video?"),
      outcomes: [],
    },
    {
      section: WizardSectionSlug.controls,
      slug: WizardStepSlug.xAxis,
      title: t("X-axis"),
      prerequisites: [botOnlineReq],
      content: positiveMovementInstruction(xySwap),
      controlsCheckOptions: { axis: "x" },
      question: positiveMovementQuestion(xySwap),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing happened"),
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.xMotor, text: t("x-axis motor step") },
        },
        {
          slug: "inverted",
          description: t("It moved the opposite direction"),
          tips: "",
          component: InvertJogButton("x"),
        },
        {
          slug: "otherMovement",
          description: t("It moved in a different direction"),
          tips: "",
          component: SwapJogButton,
        },
        {
          slug: "noMovement",
          description: SetupWizardContent.NO_MOTOR_MOVEMENT,
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.xMotor, text: t("x-axis motor step") },
        },
      ],
    },
    {
      section: WizardSectionSlug.controls,
      slug: WizardStepSlug.yAxis,
      title: t("Y-axis"),
      prerequisites: [botOnlineReq],
      content: positiveMovementInstruction(!xySwap),
      controlsCheckOptions: { axis: "y" },
      question: positiveMovementQuestion(!xySwap),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing happened"),
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.yMotor, text: t("y-axis motor step") },
        },
        {
          slug: "inverted",
          description: t("It moved the opposite direction"),
          tips: "",
          component: InvertJogButton("y"),
        },
        {
          slug: "otherMovement",
          description: t("It moved in a different direction"),
          tips: "",
          component: SwapJogButton,
        },
        {
          slug: "noMovement",
          description: SetupWizardContent.NO_MOTOR_MOVEMENT,
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.yMotor, text: t("y-axis motor step") },
        },
      ],
    },
    {
      section: WizardSectionSlug.controls,
      slug: WizardStepSlug.zAxis,
      title: t("Z-axis"),
      prerequisites: [botOnlineReq],
      content: SetupWizardContent.PRESS_DOWN_JOG_BUTTON,
      controlsCheckOptions: { axis: "z" },
      question: t("Did FarmBot **move down**?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing happened"),
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.zMotor, text: t("z-axis motor step") },
        },
        {
          slug: "inverted",
          description: t("It moved up"),
          tips: "",
          component: InvertJogButton("z"),
        },
        {
          slug: "otherMovement",
          description: t("It moved in a different direction"),
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.zMotor, text: t("z-axis motor step") },
        },
        {
          slug: "noMovement",
          description: SetupWizardContent.NO_MOTOR_MOVEMENT,
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.zMotor, text: t("z-axis motor step") },
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.zAxisFindHome,
      title: t("Home Z"),
      prerequisites: [botOnlineReq],
      content: isExpress(firmwareHardware)
        ? SetupWizardContent.FIND_HOME_Z_EXPRESS
        : t(SetupWizardContent.FIND_HOME, { axis: "Z" }),
      component: isExpress(firmwareHardware) ? undefined : AxisActions,
      controlsCheckOptions: isExpress(firmwareHardware) ? {} : undefined,
      question: isExpress(firmwareHardware)
        ? SetupWizardContent.HOME_Z_EXPRESS
        : SetupWizardContent.HOME,
      outcomes: [
        {
          slug: "notAtHome",
          description: t("The axis is not at the home position"),
          tips: t(SetupWizardContent.HOME_AXIS, { axis: "z" }),
          component: CheckForResistance,
          controlsCheckOptions: { home: true },
        },
        {
          slug: "notZero",
          description: t("The coordinate is not zero"),
          tips: "",
          component: SetHome("z"),
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.yAxisFindHome,
      title: t("Home Y"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.FIND_HOME, { axis: "Y" }),
      component: AxisActions,
      question: SetupWizardContent.HOME,
      outcomes: [
        {
          slug: "notAtHome",
          description: t("The axis is not at the home position"),
          tips: t(SetupWizardContent.HOME_AXIS, { axis: "y" }),
          component: CheckForResistance,
          controlsCheckOptions: { home: true },
        },
        {
          slug: "notZero",
          description: t("The coordinate is not zero"),
          tips: "",
          component: SetHome("y"),
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.xAxisFindHome,
      title: t("Home X"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.FIND_HOME, { axis: "X" }),
      component: AxisActions,
      question: SetupWizardContent.HOME,
      outcomes: [
        {
          slug: "notAtHome",
          description: t("The axis is not at the home position"),
          tips: t(SetupWizardContent.HOME_AXIS, { axis: "x" }),
          component: CheckForResistance,
          controlsCheckOptions: { home: true },
        },
        {
          slug: "notZero",
          description: t("The coordinate is not zero"),
          tips: "",
          component: SetHome("x"),
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.findHomeOnBoot,
      title: t("Boot sequence"),
      prerequisites: [botOnlineReq],
      content: SetupWizardContent.BOOT_SEQUENCE,
      component: BootSequence,
      question: t("Is the 'Find Home' sequence selected?"),
      outcomes: [
        {
          slug: "noFindHomeSequence",
          description: t("There is no 'Find Home' sequence"),
          tips: t("Create a new sequence and add the FIND HOME command."),
        },
      ],
    },
    {
      section: WizardSectionSlug.movements,
      slug: WizardStepSlug.movementsVideo,
      title: t("Movements video"),
      content: SetupWizardContent.MOVEMENTS_VIDEO,
      video: ExternalUrl.Video.movements,
      question: t("Did you watch the video?"),
      outcomes: [],
    },
    {
      section: WizardSectionSlug.movements,
      slug: WizardStepSlug.xAxisMovement,
      title: t("X-axis movements"),
      content: SetupWizardContent.X_AXIS_MOVEMENTS,
      controlsCheckOptions: { axis: "x", both: true },
      question: SetupWizardContent.X_AXIS_MOVEMENTS_QUESTION,
      outcomes: [
        {
          slug: "stalls",
          description: t("It stalls or has trouble at certain locations"),
          tips: SetupWizardContent.MOVEMENT_STALLS,
          component: MotorCurrentContent,
          firmwareNumberSettings: [{
            key: "movement_motor_current_x",
            label: t("x-axis motor current (%)"),
            ...motorCurrentProps,
          }],
        },
        {
          slug: "struggles",
          description: t("It struggles to move along the whole length of the axis"),
          tips: SetupWizardContent.MOVEMENT_ALL_X,
          component: MotorCurrentContent,
          firmwareNumberSettings: [{
            key: "movement_motor_current_x",
            label: t("x-axis motor current (%)"),
            ...motorCurrentProps,
          }],
        },
        {
          slug: "untuned",
          description: SetupWizardContent.MOVEMENT_SETTINGS_DESCRIPTION,
          tips: SetupWizardContent.MOVEMENT_SETTINGS,
          video: ExternalUrl.Video.motorTuning,
          firmwareNumberSettings: [
            {
              key: "movement_min_spd_x",
              label: t("x-axis minimum speed (mm/s)"),
              scale: "x",
            },
            {
              key: "movement_max_spd_x",
              label: t("x-axis maximum speed (mm/s)"),
              scale: "x",
            },
            {
              key: "movement_steps_acc_dec_x",
              label: t("x-axis acceleration (mm)"),
              scale: "x",
            },
            {
              key: "movement_motor_current_x",
              label: t("x-axis motor current (%)"),
              ...motorCurrentProps,
            },
          ],
        },
      ],
    },
    {
      section: WizardSectionSlug.movements,
      slug: WizardStepSlug.yAxisMovement,
      title: t("Y-axis movements"),
      content: SetupWizardContent.Y_AXIS_MOVEMENTS,
      controlsCheckOptions: { axis: "y", both: true },
      question: SetupWizardContent.Y_AXIS_MOVEMENTS_QUESTION,
      outcomes: [
        {
          slug: "stalls",
          description: t("It stalls or has trouble at certain locations"),
          tips: SetupWizardContent.MOVEMENT_STALLS,
          component: MotorCurrentContent,
          firmwareNumberSettings: [{
            key: "movement_motor_current_y",
            label: t("y-axis motor current (%)"),
            ...motorCurrentProps,
          }],
        },
        {
          slug: "struggles",
          description: t("It struggles to move along the whole length of the axis"),
          tips: SetupWizardContent.MOVEMENT_ALL_Y_AND_Z,
          component: MotorCurrentContent,
          firmwareNumberSettings: [{
            key: "movement_motor_current_y",
            label: t("y-axis motor current (%)"),
            ...motorCurrentProps,
          }],
        },
        {
          slug: "untuned",
          description: SetupWizardContent.MOVEMENT_SETTINGS_DESCRIPTION,
          tips: SetupWizardContent.MOVEMENT_SETTINGS,
          video: ExternalUrl.Video.motorTuning,
          firmwareNumberSettings: [
            {
              key: "movement_min_spd_y",
              label: t("y-axis minimum speed (mm/s)"),
              scale: "y",
            },
            {
              key: "movement_max_spd_y",
              label: t("y-axis maximum speed (mm/s)"),
              scale: "y",
            },
            {
              key: "movement_steps_acc_dec_y",
              label: t("y-axis acceleration (mm)"),
              scale: "y",
            },
            {
              key: "movement_motor_current_y",
              label: t("y-axis motor current (%)"),
              ...motorCurrentProps,
            },
          ],
        },
      ],
    },
    {
      section: WizardSectionSlug.movements,
      slug: WizardStepSlug.zAxisMovement,
      title: t("Z-axis movements"),
      content: SetupWizardContent.Z_AXIS_MOVEMENTS,
      controlsCheckOptions: { axis: "z", both: true },
      question: SetupWizardContent.Z_AXIS_MOVEMENTS_QUESTION,
      outcomes: [
        {
          slug: "stalls",
          description: t("It stalls or has trouble at certain locations"),
          tips: SetupWizardContent.MOVEMENT_STALLS,
          component: MotorCurrentContent,
          firmwareNumberSettings: [{
            key: "movement_motor_current_z",
            label: t("z-axis motor current (%)"),
            ...motorCurrentProps,
          }],
        },
        {
          slug: "struggles",
          description: t("It struggles to move along the whole length of the axis"),
          tips: SetupWizardContent.MOVEMENT_ALL_Y_AND_Z,
          component: MotorCurrentContent,
          firmwareNumberSettings: [{
            key: "movement_motor_current_z",
            label: t("z-axis motor current (%)"),
            ...motorCurrentProps,
          }],
        },
        {
          slug: "untuned",
          description: SetupWizardContent.MOVEMENT_SETTINGS_DESCRIPTION,
          tips: SetupWizardContent.MOVEMENT_SETTINGS,
          video: ExternalUrl.Video.motorTuning,
          firmwareNumberSettings: [
            {
              key: "movement_min_spd_z",
              label: t("z-axis minimum speed (mm/s)"),
              scale: "z",
            },
            {
              key: "movement_max_spd_z",
              label: t("z-axis maximum speed (mm/s)"),
              scale: "z",
            },
            {
              key: "movement_steps_acc_dec_z",
              label: t("z-axis acceleration (mm)"),
              scale: "z",
            },
            {
              key: "movement_motor_current_z",
              label: t("z-axis motor current (%)"),
              ...motorCurrentProps,
            },
          ],
        },
      ],
    },
    {
      section: WizardSectionSlug.axisLength,
      slug: WizardStepSlug.xAxisLength,
      title: t("X-axis length"),
      content: t(SetupWizardContent.FIND_AXIS_LENGTH, { axis: "X" }),
      component: AxisActions,
      question: SetupWizardContent.FIND_LENGTH,
      outcomes: [
        {
          slug: "stalls",
          description: t("It stopped before reaching the axis end"),
          tips: SetupWizardContent.MOVEMENT_STALLS,
          component: FindAxisLength("x"),
        },
        {
          slug: "incorrect",
          description: t("The axis length value looks incorrect"),
          tips: SetupWizardContent.AXIS_LENGTH,
          firmwareNumberSettings: [{
            key: "movement_axis_nr_steps_x",
            label: t("x-axis length (mm)"),
            scale: "x",
            intSize: "long",
          }],
        },
        {
          slug: "disabled",
          description: t("The FIND LENGTH button is disabled"),
          tips: "",
          component: DisableStallDetection("x", false),
        },
      ],
    },
    {
      section: WizardSectionSlug.axisLength,
      slug: WizardStepSlug.yAxisLength,
      title: t("Y-axis length"),
      content: t(SetupWizardContent.FIND_AXIS_LENGTH, { axis: "Y" }),
      component: AxisActions,
      question: SetupWizardContent.FIND_LENGTH,
      outcomes: [
        {
          slug: "stalls",
          description: t("It stopped before reaching the axis end"),
          tips: SetupWizardContent.MOVEMENT_STALLS,
          component: FindAxisLength("y"),
        },
        {
          slug: "incorrect",
          description: t("The axis length value looks incorrect"),
          tips: SetupWizardContent.AXIS_LENGTH,
          firmwareNumberSettings: [{
            key: "movement_axis_nr_steps_y",
            label: t("y-axis length (mm)"),
            scale: "y",
            intSize: "long",
          }],
        },
        {
          slug: "disabled",
          description: t("The FIND LENGTH button is disabled"),
          tips: "",
          component: DisableStallDetection("y", false),
        },
      ],
    },
    {
      section: WizardSectionSlug.axisLength,
      slug: WizardStepSlug.zAxisLength,
      title: t("Z-axis length"),
      content: isExpress(firmwareHardware)
        ? SetupWizardContent.FIND_AXIS_LENGTH_Z_EXPRESS
        : t(SetupWizardContent.FIND_AXIS_LENGTH, { axis: "Z" }),
      component: isExpress(firmwareHardware) ? undefined : AxisActions,
      controlsCheckOptions: isExpress(firmwareHardware) ? {} : undefined,
      question: isExpress(firmwareHardware)
        ? SetupWizardContent.FIND_LENGTH_Z_EXPRESS
        : SetupWizardContent.FIND_LENGTH,
      outcomes: [
        {
          slug: "stalls",
          description: t("It stopped before reaching the axis end"),
          tips: SetupWizardContent.MOVEMENT_STALLS,
          component: FindAxisLength("z"),
        },
        {
          slug: "incorrect",
          description: t("The axis length value looks incorrect"),
          tips: SetupWizardContent.AXIS_LENGTH,
          firmwareNumberSettings: [{
            key: "movement_axis_nr_steps_z",
            label: t("z-axis length (mm)"),
            scale: "z",
            intSize: "long",
          }],
        },
        ...(isExpress(firmwareHardware)
          ? []
          : [{
            slug: "disabled",
            description: t("The FIND LENGTH button is disabled"),
            tips: "",
            component: DisableStallDetection("z", false),
          }]),
      ],
    },
    {
      section: WizardSectionSlug.axisLength,
      slug: WizardStepSlug.dynamicMapSize,
      title: t("Dynamic map size"),
      content: t("Press the toggle button to enable dynamic map size."),
      component: DynamicMapToggle,
      question: t("Does the toggle indicate ON?"),
      outcomes: [
      ],
    },
    {
      section: WizardSectionSlug.peripherals,
      slug: WizardStepSlug.valve,
      title: t("Solenoid valve"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.TOGGLE_PERIPHERAL, { toggle: t("WATER") }),
      component: PeripheralsCheck,
      componentOptions: { border: false },
      question: t("Did water flow?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing happened"),
          tips: t("Check the solenoid valve power cable connections."),
        },
        {
          slug: "noWater",
          description: t("The valve clicked, but there isn't any water"),
          tips: t("Check your garden hose connection and try again."),
        },
      ],
    },
    {
      section: WizardSectionSlug.peripherals,
      slug: WizardStepSlug.vacuum,
      title: t("Vacuum pump"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.TOGGLE_PERIPHERAL, { toggle: t("VACUUM") }),
      component: PeripheralsCheck,
      componentOptions: { border: false },
      question: t("Did the vacuum pump run?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing happened"),
          tips: t("Check the vacuum pump power cable connections."),
        },
        {
          slug: "noSuction",
          description: t("The pump is on, but there isn't any suction"),
          tips: t("Check the tube connections."),
        },
      ],
    },
    {
      section: WizardSectionSlug.peripherals,
      slug: WizardStepSlug.lights,
      title: t("LED light strip"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.TOGGLE_PERIPHERAL, { toggle: t("LIGHTING") }),
      component: PeripheralsCheck,
      componentOptions: { border: false },
      question: t("Did the lights turn on?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing happened"),
          tips: t("Check the LED light strip power cable connections."),
        },
      ],
    },
    {
      section: WizardSectionSlug.peripherals,
      slug: WizardStepSlug.eStopButton,
      title: t("E-stop button"),
      prerequisites: [botOnlineReq],
      content: SetupWizardContent.ESTOP_BUTTON,
      pinBindingOptions: { editing: false },
      componentOptions: { fullWidth: true },
      question: SetupWizardContent.ESTOP_BUTTON_QUESTION,
      outcomes: [
        {
          slug: "stillPowered",
          description: t("FarmBot's motors are still powered"),
          tips: t("Check the E-STOP button wiring."),
        },
      ],
    },
    ...(hasExtraButtons(firmwareHardware)
      ? [{
        section: WizardSectionSlug.peripherals,
        slug: WizardStepSlug.unlockButton,
        title: t("Unlock button"),
        prerequisites: [botOnlineReq],
        content: SetupWizardContent.UNLOCK_BUTTON_BOX,
        pinBindingOptions: { editing: false },
        componentOptions: { fullWidth: true },
        question: SetupWizardContent.UNLOCK_BUTTON_QUESTION,
        outcomes: [
          {
            slug: "stillUnpowered",
            description: t("FarmBot's motors are still unpowered"),
            tips: t("Check the UNLOCK button wiring."),
          },
        ],
      }]
      : [{
        section: WizardSectionSlug.peripherals,
        slug: WizardStepSlug.unlockButton,
        title: t("Unlock button"),
        prerequisites: [botOnlineReq],
        content: SetupWizardContent.UNLOCK_BUTTON_VIRTUAL,
        pinBindingOptions: {
          editing: false,
          unlockOnly: true,
        },
        componentOptions: { border: false, background: false },
        question: SetupWizardContent.UNLOCK_BUTTON_QUESTION,
        outcomes: [],
      }]),
    ...(hasExtraButtons(firmwareHardware)
      ? [
        {
          section: WizardSectionSlug.peripherals,
          slug: WizardStepSlug.customButtons,
          title: t("Custom buttons"),
          prerequisites: [botOnlineReq],
          content: SetupWizardContent.CUSTOM_BUTTONS,
          pinBindingOptions: { editing: true },
          componentOptions: { fullWidth: true },
          question: t("Are you finished customizing the buttons?"),
          outcomes: [],
        },
      ]
      : []),
    {
      section: WizardSectionSlug.camera,
      slug: WizardStepSlug.photo,
      title: t("Photo"),
      prerequisites: [botOnlineReq],
      content: t("Press the button below to take a photo."),
      component: CameraCheck,
      question: t("Does the image look OK?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("There is no image"),
          tips: t("Try again while observing the log messages."),
          component: CameraReplacement,
        },
        {
          slug: "cameraError",
          description: SetupWizardContent.PROBLEM_GETTING_IMAGE,
          tips: SetupWizardContent.CHECK_CAMERA_CABLE,
          component: CameraReplacement,
        },
        {
          slug: "low_voltage",
          description: t("Camera voltage is low"),
          tips: t("Try a different Raspberry Pi USB power cable."),
          hidden: true,
        },
        {
          slug: "black",
          description: t("The image is black"),
          tips: SetupWizardContent.BLACK_IMAGE,
          component: CameraReplacement,
          detectedProblems: [{
            status: lowVoltageProblemStatus,
            description: SetupWizardContent.CAMERA_VOLTAGE_LOW,
          }],
        },
        {
          slug: "rotated",
          description: t("The image is rotated"),
          tips: t("Press YES to proceed to camera calibration."),
        },
      ],
    },
    {
      section: WizardSectionSlug.camera,
      slug: WizardStepSlug.cameraCalibrationPreparation,
      title: t("Calibration preparation"),
      prerequisites: [botOnlineReq],
      content: SetupWizardContent.CAMERA_CALIBRATION_PREPARATION,
      controlsCheckOptions: { axis: "z", up: true },
      question: t("Is the z-axis as high as it will go?"),
      outcomes: [
        {
          slug: "motor",
          description: t("The motor is having trouble"),
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.zMotor, text: t("z-axis motor step") },
        },
        {
          slug: "hardstop",
          description: t("The z-axis did not reach the hardstop"),
          tips: "",
          component: FindHome("z"),
        },
      ],
    },
    {
      section: WizardSectionSlug.camera,
      slug: WizardStepSlug.cameraCalibrationCard,
      title: t("Calibration card"),
      content: SetupWizardContent.CAMERA_CALIBRATION,
      component: CameraCalibrationCard,
      question: t("Is the calibration card on the soil underneath the camera?"),
      outcomes: [
        {
          slug: "missing",
          description: t("I can't find the calibration card"),
          tips: SetupWizardContent.RED_DOTS,
          component: SwitchCameraCalibrationMethod,
        },
      ],
    },
    {
      section: WizardSectionSlug.camera,
      slug: WizardStepSlug.cameraCalibration,
      title: t("Calibration"),
      prerequisites: [botOnlineReq],
      content: t("Press the button below to calibrate the camera."),
      component: CameraCalibrationCheck,
      question: t("Did calibration complete without error logs?"),
      outcomes: [
        {
          slug: "cameraError",
          description: SetupWizardContent.PROBLEM_GETTING_IMAGE,
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.photo, text: t("photo step") },
        },
        {
          slug: "detectionError",
          description: t("There is a detection error log"),
          tips: SetupWizardContent.CALIBRATION_OBJECT_DETECTION,
        },
        {
          slug: "motorError",
          description: t("There is an axis error log"),
          tips: t("Make sure the motors are working properly. Return to the"),
          goToStep: { step: WizardStepSlug.zMotor, text: t("z-axis motor step") },
        },
      ],
    },
    {
      section: WizardSectionSlug.camera,
      slug: WizardStepSlug.cameraOffsetAdjustment,
      title: t("Offset adjustment"),
      prerequisites: [botOnlineReq],
      content: SetupWizardContent.CAMERA_ALIGNMENT,
      component: CameraCheck,
      question: t("Is the location in the image aligned with the map location?"),
      outcomes: [
        {
          slug: "misaligned",
          description: t("It does not line up"),
          tips: t("Adjust one or both camera offset values and check again."),
          component: CameraOffset,
        },
        {
          slug: "flipped",
          description: t("The image appears flipped"),
          tips: t("Change the image origin and check again."),
          component: CameraImageOrigin,
        },
        {
          slug: "cameraError",
          description: SetupWizardContent.PROBLEM_GETTING_IMAGE,
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.photo, text: t("photo step") },
          hidden: true,
        },
      ],
    },
    {
      section: WizardSectionSlug.camera,
      slug: WizardStepSlug.soilHeight,
      title: t("Soil height measurement"),
      prerequisites: [botOnlineReq],
      content: ToolTips.SOIL_HEIGHT_DETECTION,
      component: SoilHeightMeasurementCheck,
      question: t("Does the image include red and green highlighted regions?"),
      outcomes: [
        {
          slug: "detectionError",
          description: t("There is a surface error message"),
          tips: t("Move FarmBot to a different location and try again."),
          controlsCheckOptions: {},
        },
        {
          slug: "cameraError",
          description: SetupWizardContent.PROBLEM_GETTING_IMAGE,
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.photo, text: t("photo step") },
          hidden: true,
        },
      ],
    },
    ...(hasUTM(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.utm,
        title: t("UTM"),
        content: t("Connect the UTM cable."),
        question: t("Is the UTM cable plugged in?"),
        outcomes: [{
          slug: "nothing",
          description: t("I'm not sure"),
          tips: t("Check the UTM top and Farmduino connections."),
        }],
      }]
      : []),
    ...(hasUTM(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.seeder,
        title: t("Seeder"),
        prerequisites: [botOnlineReq],
        content: t("Attach the seeder tool to the UTM and press VERIFY."),
        component: ToolCheck,
        question: t("Is the status 'connected'?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is 'disconnected'"),
            tips: SetupWizardContent.CHECK_TOOL_CONNECTIONS,
          },
        ],
      }]
      : []),
    ...(hasUTM(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.wateringNozzle,
        title: t("Watering nozzle"),
        prerequisites: [botOnlineReq],
        content: t("Attach the watering nozzle tool to the UTM and press VERIFY."),
        component: ToolCheck,
        question: t("Is the status 'connected'?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is 'disconnected'"),
            tips: SetupWizardContent.CHECK_TOOL_CONNECTIONS,
          },
        ],
      }]
      : []),
    {
      section: WizardSectionSlug.tools,
      slug: WizardStepSlug.flowRate,
      title: t("Water flow rate"),
      prerequisites: [botOnlineReq],
      content: ToolTips.WATER_FLOW_RATE,
      component: FlowRateInput,
      question: t("Has the value been entered?"),
      outcomes: [
      ],
    },
    ...(hasWeeder(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.weeder,
        title: t("Weeder"),
        prerequisites: [botOnlineReq],
        content: t("Attach the weeder tool to the UTM and press VERIFY."),
        component: ToolCheck,
        question: t("Is the status 'connected'?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is 'disconnected'"),
            tips: SetupWizardContent.CHECK_TOOL_CONNECTIONS,
          },
        ],
      }]
      : []),
    ...(hasUTM(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.soilSensor,
        title: t("Soil sensor"),
        prerequisites: [botOnlineReq],
        content: t("Attach the soil sensor tool to the UTM and press VERIFY."),
        component: ToolCheck,
        question: t("Is the status 'connected'?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is 'disconnected'"),
            tips: SetupWizardContent.CHECK_TOOL_CONNECTIONS,
          },
        ],
      }]
      : []),
    ...(hasUTM(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.soilSensorValue,
        title: t("Soil sensor reading"),
        prerequisites: [botOnlineReq],
        content: SetupWizardContent.READ_SOIL_SENSOR,
        component: SensorsCheck,
        componentOptions: { border: false },
        question: t("Did the sensor return a value?"),
        outcomes: [
          {
            slug: "noValue",
            description: t("There is no value"),
            tips: SetupWizardContent.CHECK_TOOL_CONNECTIONS,
          },
        ],
      }]
      : []),
    ...(hasRotaryTool(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.rotaryTool,
        title: t("Rotary tool"),
        prerequisites: [botOnlineReq],
        content: t("Attach the rotary tool to the UTM and press VERIFY."),
        warning: SetupWizardContent.ROTARY_TOOL_WARNING,
        component: ToolCheck,
        question: t("Is the status 'connected'?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is 'disconnected'"),
            tips: SetupWizardContent.CHECK_TOOL_CONNECTIONS,
          },
        ],
      }]
      : []),
    ...(hasRotaryTool(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.rotaryToolForward,
        title: t("Rotary tool forward"),
        prerequisites: [botOnlineReq],
        content: t(SetupWizardContent.TOGGLE_PERIPHERAL,
          { toggle: t("ROTARY TOOL") }),
        warning: SetupWizardContent.ROTARY_TOOL_WARNING,
        component: PeripheralsCheck,
        componentOptions: { border: false },
        question: t("Did the rotary tool rotate?"),
        outcomes: [
          {
            slug: "nothing",
            description: t("Nothing happened"),
            tips: SetupWizardContent.CHECK_TOOL_CONNECTIONS,
          },
        ],
      }]
      : []),
    ...(hasRotaryTool(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.rotaryToolReverse,
        title: t("Rotary tool reverse"),
        prerequisites: [botOnlineReq],
        content: t(SetupWizardContent.TOGGLE_PERIPHERAL,
          { toggle: t("ROTARY TOOL REVERSE") }),
        warning: SetupWizardContent.ROTARY_TOOL_WARNING,
        component: PeripheralsCheck,
        componentOptions: { border: false },
        question: t("Did the rotary tool rotate?"),
        outcomes: [
          {
            slug: "nothing",
            description: t("Nothing happened"),
            tips: SetupWizardContent.CHECK_TOOL_CONNECTIONS,
          },
        ],
      }]
      : []),
    {
      section: WizardSectionSlug.tours,
      slug: WizardStepSlug.appTour,
      title: t("Getting started"),
      content: t("Click the button below to start the tour"),
      component: Tour("gettingStarted"),
      componentOptions: { background: false },
      question: t("Did you finish the tour?"),
      outcomes: [],
    },
    {
      section: WizardSectionSlug.tours,
      slug: WizardStepSlug.gardenTour,
      title: t("Planting a garden"),
      content: t("Click the button below to start the tour"),
      component: Tour("garden"),
      componentOptions: { background: false },
      question: t("Did you finish the tour?"),
      outcomes: [],
    },
    {
      section: WizardSectionSlug.tours,
      slug: WizardStepSlug.toolsTour,
      title: t("Setting up slots"),
      content: t("Click the button below to start the tour"),
      component: Tour("tools"),
      componentOptions: { background: false },
      question: t("Did you finish the tour?"),
      outcomes: [],
    },
  ];
};

export const WIZARD_STEP_SLUGS = (props: WizardStepDataProps): WizardStepSlug[] =>
  WIZARD_STEPS(props).map(step => step.slug);

export const WIZARD_SECTIONS = (props: WizardStepDataProps): WizardSection[] => {
  const toC = WIZARD_TOC(props);
  WIZARD_STEPS(props).map(step => toC[step.section].steps.push(step));
  return Object.entries(toC)
    .map(([sectionSlug, sectionData]: [WizardSectionSlug, WizardToCSection]) =>
      ({ slug: sectionSlug, ...sectionData }));
};
