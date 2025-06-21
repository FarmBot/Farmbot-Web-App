import React from "react";
import { store } from "../redux/store";
import { SettingsPanelState } from "../interfaces";
import { toggleControlPanel, bulkToggleControlPanel } from "./toggle_section";
import { getUrlQuery, urlFriendly } from "../util";
import { Actions, DeviceSetting } from "../constants";
import { trim, some } from "lodash";
import { Path } from "../internal_urls";
import { PhotosPanelState } from "../photos/interfaces";
import { useLocation, useNavigate } from "react-router";

const FARMBOT_PANEL = [
  DeviceSetting.farmbotSettings,
  DeviceSetting.name,
  DeviceSetting.orderNumber,
  DeviceSetting.timezone,
  DeviceSetting.farmbotLocation,
  DeviceSetting.indoor,
  DeviceSetting.environment,
  DeviceSetting.heading,
  DeviceSetting.time_zone,
  DeviceSetting.camera,
  DeviceSetting.osUpdateTime,
  DeviceSetting.osAutoUpdate,
  DeviceSetting.farmbotOS,
  DeviceSetting.bootSequence,
  DeviceSetting.firmware,
  DeviceSetting.flashFirmware,
  DeviceSetting.firmwarePath,
  DeviceSetting.raspberryPiModel,
];
const POWER_AND_RESET_PANEL = [
  DeviceSetting.powerAndReset,
  DeviceSetting.restartFirmware,
  DeviceSetting.restartFarmbot,
  DeviceSetting.shutdownFarmbot,
  DeviceSetting.softReset,
  DeviceSetting.hardReset,
];
const AXES_PANEL = [
  DeviceSetting.axisSettings,
  DeviceSetting.findHome,
  DeviceSetting.setHome,
  DeviceSetting.findHomeOnBoot,
  DeviceSetting.stopAtHome,
  DeviceSetting.stopAtMax,
  DeviceSetting.negativeCoordinatesOnly,
  DeviceSetting.findAxisLength,
  DeviceSetting.setAxisLength,
  DeviceSetting.axisLength,
  DeviceSetting.safeHeight,
  DeviceSetting.fallbackSoilHeight,
];
const MOTORS_PANEL = [
  DeviceSetting.motors,
  DeviceSetting.maxSpeed,
  DeviceSetting.maxSpeedTowardHome,
  DeviceSetting.homingSpeed,
  DeviceSetting.minimumSpeed,
  DeviceSetting.minimumSpeedTowardHome,
  DeviceSetting.accelerateFor,
  DeviceSetting.accelerateForTowardHome,
  DeviceSetting.stepsPerMm,
  DeviceSetting.microstepsPerStep,
  DeviceSetting.alwaysPowerMotors,
  DeviceSetting.invertMotors,
  DeviceSetting.motorCurrent,
  DeviceSetting.quietMode,
  DeviceSetting.enable2ndXMotor,
  DeviceSetting.invert2ndXMotor,
];
const ENCODERS_PANEL = [
  DeviceSetting.encoders,
  DeviceSetting.stallDetection,
  DeviceSetting.stallDetectionNote,
  DeviceSetting.enableEncoders,
  DeviceSetting.enableStallDetection,
  DeviceSetting.stallSensitivity,
  DeviceSetting.useEncodersForPositioning,
  DeviceSetting.invertEncoders,
  DeviceSetting.maxMissedSteps,
  DeviceSetting.maxMotorLoad,
  DeviceSetting.missedStepDecay,
  DeviceSetting.gracePeriod,
  DeviceSetting.encoderScaling,
];
const LIMIT_SWITCHES_PANEL = [
  DeviceSetting.limitSwitchSettings,
  DeviceSetting.enableLimitSwitches,
  DeviceSetting.swapLimitSwitches,
  DeviceSetting.invertLimitSwitches,
];
const ERROR_HANDLING_PANEL = [
  DeviceSetting.errorHandling,
  DeviceSetting.timeoutAfter,
  DeviceSetting.maxRetries,
  DeviceSetting.calibrationRetries,
  DeviceSetting.calibrationTotalRetries,
  DeviceSetting.calibrationRetryResetDistance,
  DeviceSetting.estopOnMovementError,
];
const PIN_BINDINGS_PANEL = [
  DeviceSetting.pinBindings,
  DeviceSetting.stockPinBindings,
  DeviceSetting.savedPinBindings,
  DeviceSetting.addNewPinBinding,
];
const PIN_GUARD_PANEL = [
  DeviceSetting.pinGuardTitles,
  DeviceSetting.pinGuard,
  DeviceSetting.pinGuard1,
  DeviceSetting.pinGuard2,
  DeviceSetting.pinGuard3,
  DeviceSetting.pinGuard4,
  DeviceSetting.pinGuard5,
];
const PIN_REPORTING_PANEL = [
  DeviceSetting.pinReporting,
  DeviceSetting.pinReporting1,
  DeviceSetting.pinReporting2,
];
const PARAMETER_MANAGEMENT = [
  DeviceSetting.parameterManagement,
  DeviceSetting.paramLoadProgress,
  DeviceSetting.resetHardwareParams,
  DeviceSetting.exportParameters,
  DeviceSetting.importParameters,
  DeviceSetting.highlightModifiedSettings,
  DeviceSetting.showAdvancedSettings,
  DeviceSetting.resetHardwareParams,
];
const CUSTOM_SETTINGS_PANEL = [
  DeviceSetting.customSettings,
  DeviceSetting.envEditor,
];
const FARM_DESIGNER_PANEL = [
  DeviceSetting.farmDesigner,
  DeviceSetting.animations,
  DeviceSetting.trail,
  DeviceSetting.mapMissedSteps,
  DeviceSetting.dynamicMap,
  DeviceSetting.mapSize,
  DeviceSetting.rotateMap,
  DeviceSetting.mapOrigin,
  DeviceSetting.cropMapImages,
  DeviceSetting.clipPhotosOutOfBounds,
  DeviceSetting.cameraView,
  DeviceSetting.confirmPlantDeletion,
  DeviceSetting.defaultPlantDepth,
];
const THREE_D_PANEL = [
  DeviceSetting.threeDGarden,
  DeviceSetting.bedWallThickness,
  DeviceSetting.bedHeight,
  DeviceSetting.ccSupportSize,
  DeviceSetting.beamLength,
  DeviceSetting.columnLength,
  DeviceSetting.zAxisLength,
  DeviceSetting.bedXOffset,
  DeviceSetting.bedYOffset,
  DeviceSetting.bedZOffset,
  DeviceSetting.legSize,
  DeviceSetting.bounds,
  DeviceSetting.grid,
];
const ACCOUNT_PANEL = [
  DeviceSetting.accountSettings,
  DeviceSetting.accountName,
  DeviceSetting.accountEmail,
  DeviceSetting.changePassword,
  DeviceSetting.language,
  DeviceSetting.resetAccount,
  DeviceSetting.deleteAccount,
  DeviceSetting.exportAccountData,
];
const MAP_SETTINGS = [
  DeviceSetting.showPlantsMapLayer,
  DeviceSetting.showPointsMapLayer,
  DeviceSetting.showWeedsMapLayer,
  DeviceSetting.showRemovedWeedsMapLayer,
  DeviceSetting.showSoilInterpolationMapLayer,
  DeviceSetting.showSpreadMapLayer,
  DeviceSetting.showFarmbotMapLayer,
  DeviceSetting.showPhotosMapLayer,
  DeviceSetting.showAreasMapLayer,
  DeviceSetting.showReadingsMapLayer,
  DeviceSetting.showMoistureInterpolationMapLayer,
  DeviceSetting.show3DMap,
];
const CONTROLS_SETTINGS = [
  DeviceSetting.invertXAxisJogButton,
  DeviceSetting.invertYAxisJogButton,
  DeviceSetting.invertZAxisJogButton,
  DeviceSetting.displayScaledEncoderPosition,
  DeviceSetting.displayRawEncoderPosition,
  DeviceSetting.swapXAndYAxisJogButtons,
  DeviceSetting.showMotorPositionPlotDisplay,
];
const SEQUENCE_SETTINGS = [
  DeviceSetting.confirmStepDeletion,
  DeviceSetting.confirmSequenceDeletion,
  DeviceSetting.showPins,
  DeviceSetting.openOptionsByDefault,
  DeviceSetting.discardUnsavedSequenceChanges,
  DeviceSetting.viewCeleryScript,
];
const LOG_SETTINGS = [
  DeviceSetting.logFilterLevelSuccess,
  DeviceSetting.logFilterLevelBusy,
  DeviceSetting.logFilterLevelWarn,
  DeviceSetting.logFilterLevelError,
  DeviceSetting.logFilterLevelInfo,
  DeviceSetting.logFilterLevelFun,
  DeviceSetting.logFilterLevelDebug,
  DeviceSetting.logFilterLevelAssertion,
  DeviceSetting.enableSequenceBeginLogs,
  DeviceSetting.enableSequenceStepLogs,
  DeviceSetting.enableSequenceCompleteLogs,
];
const APP_SETTINGS = [
  DeviceSetting.internationalizeWebApp,
  DeviceSetting.use24hourTimeFormat,
  DeviceSetting.showSecondsInTime,
  DeviceSetting.hideWebcamWidget,
  DeviceSetting.hideSensorsPanel,
  DeviceSetting.enable3dElectronicsBox,
  DeviceSetting.readSpeakLogsInBrowser,
  DeviceSetting.landingPage,
  DeviceSetting.browserFarmbotActivityBeep,
  DeviceSetting.discardUnsavedChanges,
  DeviceSetting.confirmEmergencyUnlock,
  DeviceSetting.userInterfaceReadOnlyMode,
  DeviceSetting.darkMode,
];
const FILTER = [
  DeviceSetting.showPhotos,
  DeviceSetting.alwaysHighlightCurrentPhotoInMap,
  DeviceSetting.onlyShowCurrentPhotoInMap,
  DeviceSetting.showTakePhotoImages,
  DeviceSetting.showCalibrationImages,
  DeviceSetting.showWeedDetectorImages,
  DeviceSetting.showSoilHeightImages,
];
const CAMERA_SETTINGS = [
  DeviceSetting.camera,
  DeviceSetting.imageResolution,
  DeviceSetting.rotateDuringCapture,
];
const CAMERA_CALIBRATION = [
  DeviceSetting.useAlternativeMethod,
  DeviceSetting.calibrationHue,
  DeviceSetting.calibrationSaturation,
  DeviceSetting.calibrationValue,
  DeviceSetting.calibrationBlur,
  DeviceSetting.calibrationMorph,
  DeviceSetting.calibrationIterations,
  DeviceSetting.invertHueRangeSelection,
  DeviceSetting.calibrationObjectSeparation,
  DeviceSetting.calibrationObjectSeparationAlongAxis,
  DeviceSetting.cameraOffsetX,
  DeviceSetting.cameraOffsetY,
  DeviceSetting.originLocationInImage,
  DeviceSetting.pixelCoordinateScale,
  DeviceSetting.cameraRotation,
];
const CAMERA_CALIBRATION_PP = [
  DeviceSetting.calibrationBlur,
  DeviceSetting.calibrationMorph,
  DeviceSetting.calibrationIterations,
];
const WEED_DETECTION = [
  DeviceSetting.detectionHue,
  DeviceSetting.detectionSaturation,
  DeviceSetting.detectionValue,
  DeviceSetting.detectionBlur,
  DeviceSetting.detectionMorph,
  DeviceSetting.detectionIterations,
  DeviceSetting.saveDetectedPlants,
  DeviceSetting.ignoreDetectionsOutOfBounds,
  DeviceSetting.minimumWeedSize,
  DeviceSetting.maximumWeedSize,
];
const WEED_DETECTION_PP = [
  DeviceSetting.detectionBlur,
  DeviceSetting.detectionMorph,
  DeviceSetting.detectionIterations,
];
const MANAGE = [
  DeviceSetting.highlightModifiedSettings,
  DeviceSetting.showAdvancedSettings,
];

/** Look up parent panels for settings. */
const SETTING_PANEL_LOOKUP = {} as Record<DeviceSetting, keyof SettingsPanelState>;
FARMBOT_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "farmbot_settings");
POWER_AND_RESET_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "power_and_reset");
AXES_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "axis_settings");
MOTORS_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "motors");
ENCODERS_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "encoders_or_stall_detection");
LIMIT_SWITCHES_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "limit_switches");
ERROR_HANDLING_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "error_handling");
PIN_BINDINGS_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "pin_bindings");
PIN_GUARD_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "pin_guard");
PIN_REPORTING_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "pin_reporting");
PARAMETER_MANAGEMENT.map(s => SETTING_PANEL_LOOKUP[s] = "parameter_management");
CUSTOM_SETTINGS_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "custom_settings");
FARM_DESIGNER_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "farm_designer");
THREE_D_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "three_d");
ACCOUNT_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "account");
APP_SETTINGS.map(s => SETTING_PANEL_LOOKUP[s] = "account");
CONTROLS_SETTINGS.map(s => SETTING_PANEL_LOOKUP[s] = "other_settings");
MAP_SETTINGS.map(s => SETTING_PANEL_LOOKUP[s] = "other_settings");
SEQUENCE_SETTINGS.map(s => SETTING_PANEL_LOOKUP[s] = "other_settings");
LOG_SETTINGS.map(s => SETTING_PANEL_LOOKUP[s] = "other_settings");

const PHOTOS_PANEL_LOOKUP =
  {} as Record<DeviceSetting, (keyof PhotosPanelState)[]>;
const add = (section: keyof PhotosPanelState) => (s: DeviceSetting) =>
  PHOTOS_PANEL_LOOKUP[s] = (PHOTOS_PANEL_LOOKUP[s] || []).concat([section]);
FILTER.map(add("filter"));
CAMERA_SETTINGS.map(add("camera"));
CAMERA_CALIBRATION.map(add("calibration"));
CAMERA_CALIBRATION_PP.map(add("calibrationPP"));
WEED_DETECTION.map(add("detection"));
WEED_DETECTION_PP.map(add("detectionPP"));
MANAGE.map(add("manage"));

const CONTENT_LOOKUP = {} as Record<DeviceSetting, DeviceSetting[]>;
CONTENT_LOOKUP[DeviceSetting.farmbotSettings] = FARMBOT_PANEL;
CONTENT_LOOKUP[DeviceSetting.powerAndReset] = POWER_AND_RESET_PANEL;
CONTENT_LOOKUP[DeviceSetting.axisSettings] = AXES_PANEL;
CONTENT_LOOKUP[DeviceSetting.motors] = MOTORS_PANEL;
CONTENT_LOOKUP[DeviceSetting.encoders] = ENCODERS_PANEL;
CONTENT_LOOKUP[DeviceSetting.stallDetection] = ENCODERS_PANEL;
CONTENT_LOOKUP[DeviceSetting.limitSwitchSettings] = LIMIT_SWITCHES_PANEL;
CONTENT_LOOKUP[DeviceSetting.errorHandling] = ERROR_HANDLING_PANEL;
CONTENT_LOOKUP[DeviceSetting.pinBindings] = PIN_BINDINGS_PANEL;
CONTENT_LOOKUP[DeviceSetting.pinGuard] = PIN_GUARD_PANEL;
CONTENT_LOOKUP[DeviceSetting.parameterManagement] = PARAMETER_MANAGEMENT;
CONTENT_LOOKUP[DeviceSetting.customSettings] = CUSTOM_SETTINGS_PANEL;
CONTENT_LOOKUP[DeviceSetting.threeDGarden] = THREE_D_PANEL;
CONTENT_LOOKUP[DeviceSetting.farmDesigner] = FARM_DESIGNER_PANEL;
CONTENT_LOOKUP[DeviceSetting.accountSettings] = ACCOUNT_PANEL
  .concat(APP_SETTINGS);
CONTENT_LOOKUP[DeviceSetting.otherSettings] = CONTROLS_SETTINGS
  .concat(MAP_SETTINGS, SEQUENCE_SETTINGS, LOG_SETTINGS);

/** Keep string up until first `(` character (trailing whitespace removed). */
const stripUnits = (settingName: string) => trim(settingName.split("(")[0]);

/** Look up parent panels for settings using URL-friendly names. */
const URL_FRIENDLY_LOOKUP: Record<string, keyof SettingsPanelState> = {};
Object.entries(SETTING_PANEL_LOOKUP).map(([setting, panel]) => {
  URL_FRIENDLY_LOOKUP[urlFriendly(setting).toLowerCase()] = panel;
  URL_FRIENDLY_LOOKUP[urlFriendly(stripUnits(setting)).toLowerCase()] = panel;
});

/** Look up parent panels for settings using URL-friendly names. */
const URL_FRIENDLY_LOOKUP_PHOTOS:
  Record<string, (keyof PhotosPanelState)[]> = {};
Object.entries(PHOTOS_PANEL_LOOKUP).map(([setting, panel]) => {
  URL_FRIENDLY_LOOKUP_PHOTOS[urlFriendly(setting).toLowerCase()] = panel;
});

/** Look up all relevant names for the same setting. */
const ALTERNATE_NAMES =
  Object.values(DeviceSetting).reduce((acc, s) => { acc[s] = [s]; return acc; },
    {} as Record<DeviceSetting, DeviceSetting[]>);
ALTERNATE_NAMES[DeviceSetting.encoders].push(DeviceSetting.stallDetection);
ALTERNATE_NAMES[DeviceSetting.stallDetection].push(DeviceSetting.encoders);
ALTERNATE_NAMES[DeviceSetting.enableEncoders]
  .push(DeviceSetting.enableStallDetection);
ALTERNATE_NAMES[DeviceSetting.enableStallDetection]
  .push(DeviceSetting.enableEncoders);
ALTERNATE_NAMES[DeviceSetting.missedStepDecay].push(DeviceSetting.gracePeriod);
ALTERNATE_NAMES[DeviceSetting.gracePeriod].push(DeviceSetting.missedStepDecay);
ALTERNATE_NAMES[DeviceSetting.maxMotorLoad].push(DeviceSetting.maxMissedSteps);
ALTERNATE_NAMES[DeviceSetting.maxMissedSteps].push(DeviceSetting.maxMotorLoad);
ALTERNATE_NAMES[DeviceSetting.firmware].push(DeviceSetting.flashFirmware);
ALTERNATE_NAMES[DeviceSetting.flashFirmware].push(DeviceSetting.firmware);
ALTERNATE_NAMES[DeviceSetting.time_zone].push(DeviceSetting.timezone);
ALTERNATE_NAMES[DeviceSetting.timezone].push(DeviceSetting.time_zone);
ALTERNATE_NAMES[DeviceSetting.osAutoUpdate].push(DeviceSetting.osUpdateTime);
ALTERNATE_NAMES[DeviceSetting.pinGuardLabels].push(DeviceSetting.pinGuard);
ALTERNATE_NAMES[DeviceSetting.pinGuardTitles].push(DeviceSetting.pinGuard);
ALTERNATE_NAMES[DeviceSetting.pinGuardLabels].push(DeviceSetting.pinGuardTitles);
ALTERNATE_NAMES[DeviceSetting.pinGuard1].push(DeviceSetting.pinGuardTitles);
ALTERNATE_NAMES[DeviceSetting.pinGuard2].push(DeviceSetting.pinGuardTitles);
ALTERNATE_NAMES[DeviceSetting.pinGuard3].push(DeviceSetting.pinGuardTitles);
ALTERNATE_NAMES[DeviceSetting.pinGuard4].push(DeviceSetting.pinGuardTitles);
ALTERNATE_NAMES[DeviceSetting.pinGuard5].push(DeviceSetting.pinGuardTitles);
THREE_D_PANEL.map(settingName =>
  ALTERNATE_NAMES[settingName].push(DeviceSetting.threeDGarden));

/** Generate array of names for the same setting. Most only have one. */
const compareValues = (settingName: DeviceSetting) =>
  (ALTERNATE_NAMES[settingName] as string[])
    .concat(stripUnits(settingName))
    .map(s => urlFriendly(s).toLowerCase());

/** Open a panel if a setting in that panel is highlighted. */
export const maybeOpenPanel = (panelKey: "settings" | "photos" = "settings") =>
  (dispatch: Function) => {
    if (getUrlQuery("only") || getUrlQuery("search")) {
      dispatch(bulkToggleControlPanel(true));
      return;
    }
    const highlightName =
      new URLSearchParams(window.location.search).get("highlight");
    const urlFriendlySettingName = urlFriendly(highlightName || "").toLowerCase();
    if (!urlFriendlySettingName) { return; }
    if (panelKey == "settings") {
      const panel = URL_FRIENDLY_LOOKUP[urlFriendlySettingName];
      dispatch(bulkToggleControlPanel(false));
      dispatch(toggleControlPanel(panel));
    }
    if (panelKey == "photos") {
      dispatch({ type: Actions.BULK_TOGGLE_PHOTOS_PANEL, payload: false });
      URL_FRIENDLY_LOOKUP_PHOTOS[urlFriendlySettingName].map(panel =>
        dispatch({ type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: panel }));
    }
  };

export interface HighlightProps {
  settingName: DeviceSetting;
  children: React.ReactNode;
  className?: string;
  searchTerm?: string;
  hidden?: boolean;
  pathPrefix?(path?: string): string;
}

/** Wrap highlight-able settings. */
export const Highlight = (props: HighlightProps) => {
  const { settingName } = props;

  const [hovered, setHovered] = React.useState(false);
  const [highlightClass, setHighlightClass] = React.useState("");
  const [highlightTimestamp, setHighlightTimestamp] = React.useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const highlightName = new URLSearchParams(location.search).get("highlight");
  const highlightMatch = highlightName &&
    compareValues(settingName).includes(highlightName.toLowerCase());

  React.useEffect(() => {
    if (highlightMatch) {
      setHighlightTimestamp(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  React.useEffect(() => {
    if (!highlightMatch) {
      setHighlightClass("");
      return;
    }
    setHighlightClass("highlight");
    setTimeout(() => setHighlightClass("unhighlight"), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightTimestamp]);

  const searchTerm = store.getState().app.settingsSearchTerm;

  const isSectionHeader = props.className?.includes("section");

  const inContent = (term: string, urlCompare = false) => {
    const content = CONTENT_LOOKUP[settingName] || [];
    return some(content.map(s => {
      const compareTerm = urlCompare ? compareValues(s)[0] : s;
      return compareTerm.toLowerCase().includes(term.toLowerCase());
    }));
  };

  const searchMatch = () => {
    return searchTerm &&
      // if searching, look for setting name match
      (some(ALTERNATE_NAMES[settingName].map(s => s.toLowerCase()
        .includes(searchTerm.toLowerCase())))
        // if match not found, look for section content match
        || (isSectionHeader && inContent(searchTerm)));
  };

  const hidden = () => {
    const isolateName = getUrlQuery("only");
    if (isolateName) {
      const inSection = isSectionHeader && inContent(isolateName, true);
      const settingMatch =
        compareValues(settingName).includes(isolateName);
      return !(inSection || settingMatch);
    }
    if (!highlightName) { return !!props.hidden; }
    const highlightInSection = isSectionHeader
      && inContent(highlightName, true) || highlightMatch;
    const notHighlighted =
      SETTING_PANEL_LOOKUP[settingName] == "other_settings" &&
      !highlightMatch;
    return props.hidden ? !highlightInSection : notHighlighted;
  };

  return <div
    className={[
      "setting",
      props.className,
      highlightClass,
    ].join(" ")}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    hidden={searchTerm ? !searchMatch() : hidden()}>
    {settingName &&
      <i
        className={[
          "fa fa-anchor",
          props.className,
          hovered ? "hovered" : "",
        ].join(" ")}
        onClick={() => {
          navigate(linkToSetting(settingName, props.pathPrefix));
        }} />}
    {props.children}
  </div>;
};

export const linkToSetting =
  (settingName: DeviceSetting, pathPrefix = Path.settings) =>
    pathPrefix(urlFriendly(stripUnits(settingName)).toLowerCase());
