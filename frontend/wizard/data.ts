import { t } from "../i18next_wrapper";
import { round } from "lodash";
import { SetupWizardContent, ToolTips } from "../constants";
import {
  WizardResults, WizardSection, WizardStepResult, WizardSteps, WizardToC,
  WizardToCSection,
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
} from "./checks";
import { FirmwareHardware } from "farmbot";
import { hasUTM } from "../settings/firmware/firmware_hardware_support";

export namespace WizardData {
  enum StorageKey {
    results = "setup_results",
    complete = "setup_complete",
    order = "setup_order_number",
  }

  const getItem = (key: StorageKey) => localStorage.getItem(key);
  const setItem = (key: StorageKey, value: string) =>
    localStorage.setItem(key, value);

  export const fetch = (): WizardResults =>
    JSON.parse(getItem(StorageKey.results) || "{}");
  export const update = (update: WizardResults) => {
    const newData = { ...fetch(), ...update };
    setItem(StorageKey.results, JSON.stringify(newData));
    return newData;
  };

  export const setOrderNumber = (value: string) =>
    setItem(StorageKey.order, value);
  export const getOrderNumber = () => getItem(StorageKey.order) || "";

  export const doneCount = () => Object.values(fetch())
    .filter((stepResult: WizardStepResult) => stepResult.answer).length;
  export const progressPercent =
    (firmwareHardware: FirmwareHardware | undefined) =>
      round(doneCount() / WIZARD_STEPS(firmwareHardware).length * 100);
  export const getComplete = () => !!getItem(StorageKey.complete);
  export const setComplete = () => setItem(StorageKey.complete, "true");
  export const reset = () => {
    setItem(StorageKey.results, "{}");
    setItem(StorageKey.complete, "");
  };
}

export enum WizardSectionSlug {
  intro = "intro",
  connectivity = "connectivity",
  axes = "axes",
  motors = "motors",
  peripherals = "peripherals",
  camera = "camera",
  tools = "tools",
}

export const WIZARD_TOC =
  (firmwareHardware: FirmwareHardware | undefined): WizardToC => {
    const toc: WizardToC = {
      [WizardSectionSlug.intro]: { title: t("INTRO"), steps: [] },
      [WizardSectionSlug.connectivity]: { title: t("CONNECTIVITY"), steps: [] },
      [WizardSectionSlug.motors]: { title: t("MOTORS"), steps: [] },
      [WizardSectionSlug.axes]: { title: t("HOME and AXES"), steps: [] },
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
  assembled = "assembled",
  power = "power",
  configuratorNetwork = "configuratorNetwork",
  configuratorBrowser = "configuratorBrowser",
  configuratorSteps = "configuratorSteps",
  xMotor = "xMotor",
  yMotor = "yMotor",
  zMotor = "zMotor",
  xAxis = "xAxis",
  yAxis = "yAxis",
  zAxis = "zAxis",
  valve = "valve",
  vacuum = "vacuum",
  lights = "lights",
  photo = "photo",
  cameraCalibrationCard = "cameraCalibrationCard",
  cameraCalibration = "cameraCalibration",
  cameraOffsetAdjustment = "cameraOffsetAdjustment",
  soilHeight = "soilHeight",
  utm = "utm",
  seeder = "seeder",
  wateringNozzle = "wateringNozzle",
  weeder = "weeder",
  soilSensor = "soilSensor",
}

export const WIZARD_STEPS =
  (firmwareHardware: FirmwareHardware | undefined): WizardSteps => [
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
      ],
    },
    {
      section: WizardSectionSlug.motors,
      slug: WizardStepSlug.xMotor,
      title: t("X-Axis Motor"),
      prerequisites: [botOnlineReq],
      content: t("Press the right arrow."),
      component: ControlsCheck("x"),
      question: t("Did FarmBot's x-axis move?"),
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
      content: t("Press the up arrow."),
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
      section: WizardSectionSlug.axes,
      slug: WizardStepSlug.xAxis,
      title: t("X-axis"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.PRESS_RIGHT_JOG_BUTTON),
      component: ControlsCheck("x"),
      question: t("Did FarmBot **move to the right**?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.xMotor, text: t("x-axis motor step") },
        },
        {
          slug: "inverted",
          description: t("It moved left"),
          tips: t("Invert x-axis jog buttons"),
          component: InvertJogButton("x"),
        },
        {
          slug: "otherMovement",
          description: t("It moved in a different direction"),
          tips: t("Swap x and y axis jog buttons"),
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
      section: WizardSectionSlug.axes,
      slug: WizardStepSlug.yAxis,
      title: t("Y-axis"),
      prerequisites: [botOnlineReq],
      content: t(SetupWizardContent.PRESS_RIGHT_JOG_BUTTON),
      component: ControlsCheck("y"),
      question: t("Did FarmBot **move to the away from you**?"),
      outcomes: [
        {
          slug: "nothing",
          description: t("Nothing"),
          tips: t("Return to the"),
          goToStep: { step: WizardStepSlug.yMotor, text: t("y-axis motor step") },
        },
        {
          slug: "inverted",
          description: t("It moved left"),
          tips: t("Invert y-axis jog buttons"),
          component: InvertJogButton("y"),
        },
        {
          slug: "otherMovement",
          description: t("It moved in a different direction"),
          tips: t("Swap x and y axis jog buttons"),
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
      section: WizardSectionSlug.axes,
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
          tips: t("Invert z-axis jog buttons"),
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
      section: WizardSectionSlug.peripherals,
      slug: WizardStepSlug.valve,
      title: t("Solenoid Valve"),
      prerequisites: [botOnlineReq],
      content: t("Press the solenoid valve ON/OFF toggle."),
      component: PeripheralsCheck,
      question: t("Is water flowing?"),
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
      content: t("Press the vacuum pump ON/OFF toggle."),
      component: PeripheralsCheck,
      question: t("Is the vacuum pump running?"),
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
      content: t("Press the lighting ON/OFF toggle."),
      component: PeripheralsCheck,
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
          tips: t("Try again."),
        },
        {
          slug: "error",
          description: t("There is a 'camera not detected' error log"),
          tips: t(SetupWizardContent.CHECK_CAMERA_CABLE),
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
          tips: t("Is it night? Is the camera lens covered?"),
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
      slug: WizardStepSlug.cameraCalibrationCard,
      title: t("Calibration card"),
      content: t(SetupWizardContent.CAMERA_CALIBRATION),
      component: CameraCalibrationCard,
      question: t("Is the calibration card on the soil underneath the camera?"),
      outcomes: [
        {
          slug: "missing",
          description: t("I can't find the calibration card"),
          tips: t("Try an alternate calibration method."),
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
      question: t("Did calibration complete successfully?"),
      outcomes: [
        {
          slug: "cameraError",
          description: t("There is a camera error log"),
          tips: t("Make sure the camera is working properly and try again."),
        },
        {
          slug: "detectionError",
          description: t("There is a detection error log"),
          tips: t("Make sure the calibration card is visible to the camera."),
        },
        {
          slug: "motorError",
          description: t("There is an axis error log"),
          tips: t("Make sure the motors are working properly."),
        },
      ],
    },
    {
      section: WizardSectionSlug.camera,
      slug: WizardStepSlug.cameraOffsetAdjustment,
      title: t("Offset Adjustment"),
      prerequisites: [botOnlineReq],
      content: t("Check photo alignment in the map against a known location."),
      component: CameraCheck,
      question: t("Is the location in the image aligned with the map location?"),
      outcomes: [
        {
          slug: "misaligned",
          description: t("It does not line up"),
          tips: t("Adjust one or both camera offset values and check again."),
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
          slug: "error",
          description: t("There is a surface error message"),
          tips: t("Try a different location."),
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
          description: t("Nothing"),
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
        question: t("Is the status MOUNTED?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is DISMOUNTED"),
            tips: t("Check the UTM to tool electrical connections."),
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
        question: t("Is the status MOUNTED?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is DISMOUNTED"),
            tips: t("Check the UTM to tool electrical connections."),
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
        question: t("Is the status MOUNTED?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is DISMOUNTED"),
            tips: t("Check the UTM to tool electrical connections."),
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
        question: t("Is the status MOUNTED?"),
        outcomes: [
          {
            slug: "dismounted",
            description: t("The status is DISMOUNTED"),
            tips: t("Check the UTM to tool electrical connections."),
          },
        ],
      }]
      : []),
  ];

export const WIZARD_STEP_SLUGS =
  (firmwareHardware: FirmwareHardware | undefined): WizardStepSlug[] =>
    WIZARD_STEPS(firmwareHardware).map(step => step.slug);

export const WIZARD_SECTIONS =
  (firmwareHardware: FirmwareHardware | undefined): WizardSection[] => {
    const toC = WIZARD_TOC(firmwareHardware);
    WIZARD_STEPS(firmwareHardware).map(step => toC[step.section]?.steps.push(step));
    return Object.entries(toC)
      .map(([sectionSlug, sectionData]: [WizardSectionSlug, WizardToCSection]) =>
        ({ slug: sectionSlug, ...sectionData }));
  };
