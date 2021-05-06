import { t } from "../i18next_wrapper";
import { round } from "lodash";
import { SetupWizardContent, ToolTips } from "../constants";
import {
  WizardSection, WizardSteps, WizardToC, WizardToCSection,
} from "./interfaces";
import { botOnlineReq, ProductRegistration } from "./prerequisites";
import {
  AssemblyDocs,
  CameraCalibrationCheck,
  CameraCheck,
  ConfiguratorDocs,
  Connectivity,
  ControlsCheck,
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
  CurrentPosition,
  EthernetPortImage,
  CameraImageOrigin,
} from "./checks";
import { FirmwareHardware, TaggedWizardStepResult } from "farmbot";
import { hasUTM } from "../settings/firmware/firmware_hardware_support";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";

export const setupProgressString = (
  results: TaggedWizardStepResult[],
  firmwareHardware: FirmwareHardware | undefined,
) => {
  const completed = results.filter(result => result.body.answer).length;
  const total = WIZARD_STEPS(firmwareHardware).length;
  return `${round(completed / total * 100)}% ${t("complete")}`;
};

export enum WizardSectionSlug {
  intro = "intro",
  connectivity = "connectivity",
  map = "map",
  motors = "motors",
  controls = "controls",
  home = "home",
  peripherals = "peripherals",
  camera = "camera",
  tools = "tools",
}

export const WIZARD_TOC =
  (firmwareHardware: FirmwareHardware | undefined): WizardToC => {
    const toc: WizardToC = {
      [WizardSectionSlug.intro]: { title: t("INTRO"), steps: [] },
      [WizardSectionSlug.connectivity]: { title: t("CONNECTIVITY"), steps: [] },
      [WizardSectionSlug.map]: { title: t("MAP"), steps: [] },
      [WizardSectionSlug.motors]: { title: t("MOTORS"), steps: [] },
      [WizardSectionSlug.controls]: { title: t("MANUAL CONTROLS"), steps: [] },
      [WizardSectionSlug.home]: { title: t("HOME"), steps: [] },
      [WizardSectionSlug.peripherals]: { title: t("PERIPHERALS"), steps: [] },
      [WizardSectionSlug.camera]: { title: t("CAMERA"), steps: [] },
    };
    if (hasUTM(firmwareHardware)) {
      toc[WizardSectionSlug.tools] = { title: t("UTM and TOOLS"), steps: [] };
    }
    return toc;
  };

export enum WizardStepSlug {
  intro = "intro",
  orderInfo = "orderInfo",
  model = "model",
  connection = "connection",
  sdCard = "sdCard",
  ethernetOption = "ethernetOption",
  assembled = "assembled",
  power = "power",
  configuratorNetwork = "configuratorNetwork",
  configuratorBrowser = "configuratorBrowser",
  configuratorSteps = "configuratorSteps",
  xySwap = "xySwap",
  mapOrigin = "mapOrigin",
  xMotor = "xMotor",
  yMotor = "yMotor",
  zMotor = "zMotor",
  xAxis = "xAxis",
  yAxis = "yAxis",
  zAxis = "zAxis",
  xAxisHardwareHome = "xAxisHardwareHome",
  xAxisSoftwareHome = "xAxisSoftwareHome",
  yAxisHardwareHome = "yAxisHardwareHome",
  yAxisSoftwareHome = "yAxisSoftwareHome",
  zAxisHardwareHome = "zAxisHardwareHome",
  zAxisSoftwareHome = "zAxisSoftwareHome",
  valve = "valve",
  vacuum = "vacuum",
  lights = "lights",
  photo = "photo",
  cameraCalibrationPreparation = "cameraCalibrationPreparation",
  cameraCalibrationCard = "cameraCalibrationCard",
  cameraCalibration = "cameraCalibration",
  cameraOffsetAdjustment = "cameraOffsetAdjustment",
  soilHeight = "soilHeight",
  utm = "utm",
  seeder = "seeder",
  wateringNozzle = "wateringNozzle",
  weeder = "weeder",
  soilSensor = "soilSensor",
  soilSensorValue = "soilSensorValue",
}

export const WIZARD_STEPS = (
  firmwareHardware: FirmwareHardware | undefined,
  getConfigValue?: GetWebAppConfigValue,
): WizardSteps => {
  const xySwap = !!getConfigValue?.(BooleanSetting.xy_swap);
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
      content: t(SetupWizardContent.INTRO),
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
    {
      section: WizardSectionSlug.connectivity,
      slug: WizardStepSlug.sdCard,
      title: t("SD card"),
      content: t("Flash FarmBot's SD card with FarmBot OS and re-insert it."),
      component: ConfiguratorDocs,
      question: t("Is the SD card with FarmBot OS installed?"),
      outcomes: [
        {
          slug: "flashFbos",
          description: t("I do not know where to get FarmBot OS"),
          tips: t("Visit the documentation."),
          component: ConfiguratorDocs,
        },
      ],
    },
    {
      section: WizardSectionSlug.connectivity,
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
    ...(hasUTM(firmwareHardware)
      ? [{
        section: WizardSectionSlug.connectivity,
        slug: WizardStepSlug.ethernetOption,
        title: t("Ethernet connection (optional)"),
        content: t(SetupWizardContent.ETHERNET_OPTION),
        question: t(SetupWizardContent.ETHERNET_OPTION_QUESTION),
        outcomes: [
          {
            slug: "ethernetPort",
            description: t("I do not know where to connect the ethernet cable"),
            tips: "",
            component: EthernetPortImage,
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
      content: t("Connect to the `farmbot-xxxx` WiFi network"),
      question: t(SetupWizardContent.CONFIGURATOR_CONNECTION_PROMPT),
      outcomes: [
        {
          slug: "noSetupNetwork",
          description: t("The FarmBot WiFi network isn't showing up"),
          tips: t(SetupWizardContent.NO_SETUP_NETWORK),
        },
      ],
    },
    {
      section: WizardSectionSlug.connectivity,
      slug: WizardStepSlug.configuratorBrowser,
      title: t("Configurator"),
      content: t("Open a browser and navigate to `setup.farm.bot`"),
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
          tips: t("If using a phone, disable data and try again."),
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
      section: WizardSectionSlug.map,
      slug: WizardStepSlug.xySwap,
      title: t("Rotate Map"),
      content: t("Observe the orientation of the virtual FarmBot in the map."),
      question: t("Does the map rotation match FarmBot as you normally view it?"),
      outcomes: [
        {
          slug: "rotated",
          description: t("The map is rotated incorrectly"),
          tips: "",
          component: RotateMapToggle,
        },
      ],
    },
    {
      section: WizardSectionSlug.map,
      slug: WizardStepSlug.mapOrigin,
      title: t("Map Origin"),
      content: t(SetupWizardContent.FIND_MAP_ORIGIN),
      question: t("Does the map origin match your real FarmBot's origin?"),
      outcomes: [
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
      title: t("X-Axis Motor"),
      prerequisites: [botOnlineReq],
      content: xyMovementInstruction(xySwap),
      component: ControlsCheck("x"),
      question: t("Did FarmBot's x-axis move?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
          tips: t(SetupWizardContent.NO_MOTOR_ACTIVITY),
          component: FlashFirmware,
        },
        {
          slug: "noMovement",
          description: t(SetupWizardContent.NO_MOTOR_MOVEMENT),
          tips: t("Check hardware for resistance."),
        },
        {
          slug: "stall",
          description: t("It started to move, but stopped early"),
          tips: t("Check hardware for resistance."),
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
      title: t("Y-Axis Motor"),
      prerequisites: [botOnlineReq],
      content: xyMovementInstruction(!xySwap),
      component: ControlsCheck("y"),
      question: t("Did FarmBot's y-axis move?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
          tips: t(SetupWizardContent.NO_MOTOR_ACTIVITY),
        },
        {
          slug: "noMovement",
          description: t(SetupWizardContent.NO_MOTOR_MOVEMENT),
          tips: t("Check hardware for resistance."),
        },
        {
          slug: "stall",
          description: t("It started to move, but stopped early"),
          tips: t("Check hardware for resistance."),
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
      title: t("Z-Axis Motor"),
      prerequisites: [botOnlineReq],
      content: t("Press the down arrow."),
      component: ControlsCheck("z"),
      question: t("Did FarmBot's z-axis move?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
          tips: t(SetupWizardContent.NO_MOTOR_ACTIVITY),
        },
        {
          slug: "noMovement",
          description: t(SetupWizardContent.NO_MOTOR_MOVEMENT),
          tips: t("Check hardware for resistance."),
        },
        {
          slug: "stall",
          description: t("It started to move, but stopped early"),
          tips: t("Check hardware for resistance."),
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
      slug: WizardStepSlug.xAxis,
      title: t("X-axis"),
      prerequisites: [botOnlineReq],
      content: positiveMovementInstruction(xySwap),
      component: ControlsCheck("x"),
      question: positiveMovementQuestion(xySwap),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
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
          description: t(SetupWizardContent.NO_MOTOR_MOVEMENT),
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
      component: ControlsCheck("y"),
      question: positiveMovementQuestion(!xySwap),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
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
          description: t(SetupWizardContent.NO_MOTOR_MOVEMENT),
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
      content: t(SetupWizardContent.PRESS_DOWN_JOG_BUTTON),
      component: ControlsCheck("z"),
      question: t("Did FarmBot **move down**?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
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
          description: t(SetupWizardContent.NO_MOTOR_MOVEMENT),
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.zMotor, text: t("z-axis motor step") },
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.xAxisHardwareHome,
      title: t("X-axis"),
      content: t("Observe the position of the FarmBot gantry along the tracks."),
      question: t(SetupWizardContent.X_HOME_PROMPT),
      outcomes: [
        {
          slug: "notAtHome",
          description: t("They are somewhere else"),
          tips: t(SetupWizardContent.HOME_X),
          component: ControlsCheck(undefined, true),
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.xAxisSoftwareHome,
      title: t("X-axis Home"),
      prerequisites: [botOnlineReq],
      content: t("Review FarmBot's coordinate location in the boxes below."),
      component: CurrentPosition("x"),
      question: t("Is the x-axis coordinate zero (0)?"),
      outcomes: [
        {
          slug: "notZero",
          description: t("It is some other value"),
          tips: "",
          component: SetHome("x"),
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.yAxisHardwareHome,
      title: t("Y-axis"),
      content: t("Observe the position of the cross-slide plate on the gantry."),
      question: t(SetupWizardContent.Y_HOME_PROMPT),
      outcomes: [
        {
          slug: "notAtHome",
          description: t("It is somewhere else"),
          tips: t(SetupWizardContent.HOME_Y),
          component: ControlsCheck(undefined, true),
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.yAxisSoftwareHome,
      title: t("Y-axis Home"),
      prerequisites: [botOnlineReq],
      content: t("Review FarmBot's coordinate location in the boxes below."),
      component: CurrentPosition("y"),
      question: t("Is the y-axis coordinate zero (0)?"),
      outcomes: [
        {
          slug: "notZero",
          description: t("It is some other value"),
          tips: "",
          component: SetHome("y"),
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.zAxisHardwareHome,
      title: t("Z-axis"),
      content: t("Observe the position of the z-axis."),
      question: t(SetupWizardContent.Z_HOME_PROMPT),
      outcomes: [
        {
          slug: "notAtHome",
          description: t("It is somewhere else"),
          tips: t(SetupWizardContent.HOME_Z),
          component: ControlsCheck(undefined, true),
        },
      ],
    },
    {
      section: WizardSectionSlug.home,
      slug: WizardStepSlug.zAxisSoftwareHome,
      title: t("Z-axis Home"),
      prerequisites: [botOnlineReq],
      content: t("Review FarmBot's coordinate location in the boxes below."),
      component: CurrentPosition("z"),
      question: t("Is the z-axis coordinate zero (0)?"),
      outcomes: [
        {
          slug: "notZero",
          description: t("It is some other value"),
          tips: "",
          component: SetHome("z"),
        },
      ],
    },
    {
      section: WizardSectionSlug.peripherals,
      slug: WizardStepSlug.valve,
      title: t("Solenoid Valve"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.TOGGLE_PERIPHERAL, { toggle: t("WATER") }),
      component: PeripheralsCheck,
      componentBorder: false,
      question: t("Did water flow?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
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
      title: t("Vacuum Pump"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.TOGGLE_PERIPHERAL, { toggle: t("VACUUM") }),
      component: PeripheralsCheck,
      componentBorder: false,
      question: t("Did the vacuum pump run?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
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
      title: t("LED Light Strip"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.TOGGLE_PERIPHERAL, { toggle: t("LIGHTING") }),
      component: PeripheralsCheck,
      componentBorder: false,
      question: t("Did the lights turn on?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
          tips: t("Check the LED light strip power cable connections."),
        },
      ],
    },
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
          description: t(SetupWizardContent.PROBLEM_GETTING_IMAGE),
          tips: t(SetupWizardContent.CHECK_CAMERA_CABLE),
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
          tips: t(SetupWizardContent.BLACK_IMAGE),
          component: CameraReplacement,
          detectedProblems: [{
            status: lowVoltageProblemStatus,
            description: t(SetupWizardContent.CAMERA_VOLTAGE_LOW),
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
      content: t(SetupWizardContent.CAMERA_CALIBRATION_PREPARATION),
      component: ControlsCheck(),
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
      content: t(SetupWizardContent.CAMERA_CALIBRATION),
      component: CameraCalibrationCard,
      question: t("Is the calibration card on the soil underneath the camera?"),
      outcomes: [
        {
          slug: "missing",
          description: t("I can't find the calibration card"),
          tips: t(SetupWizardContent.RED_DOTS),
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
          description: t(SetupWizardContent.PROBLEM_GETTING_IMAGE),
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.photo, text: t("photo step") },
        },
        {
          slug: "detectionError",
          description: t("There is a detection error log"),
          tips: t("Make sure the calibration card is visible to the camera."),
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
      title: t("Offset Adjustment"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.CAMERA_ALIGNMENT),
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
          description: t(SetupWizardContent.PROBLEM_GETTING_IMAGE),
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
      content: t(ToolTips.SOIL_HEIGHT_DETECTION),
      component: SoilHeightMeasurementCheck,
      question: t("Does the image include red and green highlighted regions?"),
      outcomes: [
        {
          slug: "detectionError",
          description: t("There is a surface error message"),
          tips: t("Move FarmBot to a different location and try again."),
          component: ControlsCheck(),
        },
        {
          slug: "cameraError",
          description: t(SetupWizardContent.PROBLEM_GETTING_IMAGE),
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
            tips: t(SetupWizardContent.CHECK_TOOL_CONNECTIONS),
          },
        ],
      }]
      : []),
    ...(hasUTM(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.wateringNozzle,
        title: t("Watering Nozzle"),
        prerequisites: [botOnlineReq],
        content: t("Attach the watering nozzle tool to the UTM and press VERIFY."),
        component: ToolCheck,
        question: t("Is the status 'connected'?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is 'disconnected'"),
            tips: t(SetupWizardContent.CHECK_TOOL_CONNECTIONS),
          },
        ],
      }]
      : []),
    ...(hasUTM(firmwareHardware)
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
            tips: t(SetupWizardContent.CHECK_TOOL_CONNECTIONS),
          },
        ],
      }]
      : []),
    ...(hasUTM(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.soilSensor,
        title: t("Soil Sensor"),
        prerequisites: [botOnlineReq],
        content: t("Attach the soil sensor tool to the UTM and press VERIFY."),
        component: ToolCheck,
        question: t("Is the status 'connected'?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is 'disconnected'"),
            tips: t(SetupWizardContent.CHECK_TOOL_CONNECTIONS),
          },
        ],
      }]
      : []),
    ...(hasUTM(firmwareHardware)
      ? [{
        section: WizardSectionSlug.tools,
        slug: WizardStepSlug.soilSensorValue,
        title: t("Soil Sensor Reading"),
        prerequisites: [botOnlineReq],
        content: t(SetupWizardContent.READ_SOIL_SENSOR),
        component: SensorsCheck,
        componentBorder: false,
        question: t("Did the sensor return a value?"),
        outcomes: [
          {
            slug: "noValue",
            description: t("There is no value"),
            tips: t(SetupWizardContent.CHECK_TOOL_CONNECTIONS),
          },
        ],
      }]
      : []),
  ];
};

export const WIZARD_STEP_SLUGS =
  (firmwareHardware: FirmwareHardware | undefined): WizardStepSlug[] =>
    WIZARD_STEPS(firmwareHardware).map(step => step.slug);

export const WIZARD_SECTIONS = (
  firmwareHardware: FirmwareHardware | undefined,
  getConfigValue?: GetWebAppConfigValue,
): WizardSection[] => {
  const toC = WIZARD_TOC(firmwareHardware);
  WIZARD_STEPS(firmwareHardware, getConfigValue)
    .map(step => toC[step.section]?.steps.push(step));
  return Object.entries(toC)
    .map(([sectionSlug, sectionData]: [WizardSectionSlug, WizardToCSection]) =>
      ({ slug: sectionSlug, ...sectionData }));
};
