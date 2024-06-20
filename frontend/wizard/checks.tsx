import React from "react";
import { TakePhotoButton } from "../controls/move/take_photo_button";
import { mapStateToProps } from "../controls/state_to_props";
import { store } from "../redux/store";
import { MoveControls } from "../controls/move/move_controls";
import {
  generateFarmwareDictionary, getEnv, saveOrEditFarmwareEnv,
} from "../farmware/state_to_props";
import { isBotOnlineFromState } from "../devices/must_be_online";
import {
  findUuid,
  getDeviceAccountSettings, getUserAccountSettings, selectAllAlerts,
  selectAllFarmwareEnvs,
  selectAllImages, selectAllLogs, selectAllPeripherals, selectAllSensors,
  selectAllTools,
  maybeGetTimeSettings,
} from "../resources/selectors";
import { last, some, uniq } from "lodash";
import {
  CameraCheckBaseProps,
  WizardOutcomeComponentProps,
  WizardStepComponentProps,
} from "./interfaces";
import {
  colorFromThrottle, ThrottleType,
} from "../settings/fbos_settings/fbos_details";
import { ExternalUrl } from "../external_urls";
import { getFbosConfig, getFirmwareConfig } from "../resources/getters";
import { validFbosConfig, validFwConfig } from "../util";
import { validBotLocationData } from "../util/location";
import {
  getFwHardwareValue, isExpress,
} from "../settings/firmware/firmware_hardware_support";
import { t } from "../i18next_wrapper";
import {
  BlurableInput,
  Checkbox, Col, docLink, DropDownItem, FBSelect, genesisDocLink, Row, ToggleButton,
} from "../ui";
import {
  changeFirmwareHardware, SEED_DATA_OPTIONS, SEED_DATA_OPTIONS_DDI,
} from "../messages/cards";
import { seedAccount } from "../messages/actions";
import { FirmwareHardware, TaggedLog, Xyz } from "farmbot";
import { ConnectivityDiagram } from "../devices/connectivity/diagram";
import { Diagnosis } from "../devices/connectivity/diagnosis";
import { connectivityData } from "../devices/connectivity/generate_data";
import {
  sourceFbosConfigValue, sourceFwConfigValue,
} from "../settings/source_config_value";
import {
  emergencyUnlock, findAxisLength, findHome, setHome, settingToggle,
} from "../devices/actions";
import { NumberConfigKey } from "farmbot/dist/resources/configs/firmware";
import { calibrate } from "../photos/camera_calibration/actions";
import { cameraBtnProps } from "../photos/capture_settings/camera_selection";
import {
  CalibrationCardSVG, CameraCalibrationMethodConfig,
} from "../photos/camera_calibration";
import { envGet, prepopulateEnv } from "../photos/remote_env/selectors";
import { formatEnvKey } from "../photos/remote_env/translators";
import { Peripherals } from "../controls/peripherals";
import { ToolVerification } from "../tools/tool_verification";
import { FarmwareForm } from "../farmware/farmware_forms";
import { FarmwareName } from "../sequences/step_tiles/tile_execute_script";
import { BooleanSetting } from "../session_keys";
import {
  BooleanConfigKey as BooleanWebAppConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { GetWebAppConfigValue, toggleWebAppBool } from "../config_storage/actions";
import { PLACEHOLDER_FARMBOT } from "../photos/images/image_flipper";
import { OriginSelector } from "../settings/farm_designer_settings";
import { Sensors } from "../sensors";
import {
  DropdownConfig,
  NumberBoxConfig, NumberBoxConfigProps,
} from "../photos/camera_calibration/config";
import { Actions, DeviceSetting, SetupWizardContent, ToolTips } from "../constants";
import { WD_KEY_DEFAULTS } from "../photos/remote_env/constants";
import { LockableButton } from "../settings/hardware_settings/lockable_button";
import {
  disabledAxisMap,
} from "../settings/hardware_settings/axis_tracking_status";
import { destroy, edit, initSave, save } from "../api/crud";
import { FlashFirmwareBtn } from "../settings/firmware/firmware_hardware_status";
import {
  ORIGIN_DROPDOWNS, SPECIAL_VALUE_DDI,
} from "../photos/camera_calibration/constants";
import { tourPath } from "../help/tours";
import { TOURS } from "../help/tours/data";
import { push } from "../history";
import { FilePath } from "../internal_urls";
import { BotPositionRows } from "../controls/move/bot_position_rows";
import {
  BootSequenceSelector,
} from "../settings/fbos_settings/boot_sequence_selector";
import { getImageJobs } from "../photos/state_to_props";
import { ResourceIndex } from "../resources/interfaces";
import { BotState } from "../devices/interfaces";
import {
  reduceToolName, ToolName,
} from "../farm_designer/map/tool_graphics/all_tools";
import { WaterFlowRateInput } from "../tools/edit_tool";
import { RPI_OPTIONS } from "../settings/fbos_settings/rpi_model";
import { BoxTop } from "../settings/pin_bindings/box_top";
import { OtaTimeSelector } from "../settings/fbos_settings/ota_time_selector";

export const Language = (props: WizardStepComponentProps) => {
  const user = getUserAccountSettings(props.resources);
  return <BlurableInput
    type="text"
    name="language"
    value={user.body.language || ""}
    onCommit={e => {
      props.dispatch(edit(
        user,
        { language: e.currentTarget.value }));
      props.dispatch(save(user.uuid));
    }} />;
};

const CAMERA_ERRORS = ["Camera not detected.", "Problem getting image."];

/** Check if an item's time is after the specified time, if provided. */
export const greaterThanTime = (
  itemTime: number | undefined,
  thresholdTime: number | undefined,
) =>
  thresholdTime && (itemTime || 0) > thresholdTime;

export const recentMsgLog = (
  logs: TaggedLog[],
  prevLogTime: number | undefined,
  messages: string[],
) =>
  some(logs
    .filter(log => greaterThanTime(log.body.created_at, prevLogTime))
    .map(log => some(messages.map(message =>
      log.body.message.toLowerCase().includes(message.toLowerCase())))));

const CameraCheckBase = (props: CameraCheckBaseProps) => {
  const images = selectAllImages(props.resources);
  const getLastImageId = () => last(images)?.body.id;
  const [prevImageId, setPrevImageId] = React.useState(getLastImageId());
  const newImageUrls = images
    .filter(image => prevImageId && (image.body.id || 0) > prevImageId)
    .map(image => image.body.attachment_url);
  const imageUrl = last(newImageUrls);

  const logs = selectAllLogs(props.resources);
  const getLastLogTimestamp = () => last(logs)?.body.created_at;
  const [prevLogTime, setPrevLogTime] = React.useState(getLastLogTimestamp());
  const [error, setError] = React.useState(false);
  if (!error && recentMsgLog(logs, prevLogTime, CAMERA_ERRORS)) {
    props.setStepSuccess(false, "cameraError")();
    setError(true);
  }

  return <div className={"camera-check"}
    onClick={() => {
      setPrevImageId(getLastImageId());
      setPrevLogTime(getLastLogTimestamp());
      setError(false);
    }}>
    <props.component {...props} />
    <p>{props.longDuration
      ? t("Images may take up to 3 minutes to appear.")
      : t("Images may take up to 30 seconds to appear.")}</p>
    <img src={imageUrl || PLACEHOLDER_FARMBOT} />
  </div>;
};

const TakePhotoButtonComponent = (props: CameraCheckBaseProps) => {
  const env = getEnv(props.resources);
  const botOnline = isBotOnlineFromState(props.bot);
  const logs = selectAllLogs(props.resources);
  return <TakePhotoButton env={env} botOnline={botOnline}
    imageJobs={getImageJobs(props.bot.hardware.jobs)} logs={logs} />;
};

export const CameraCheck = (props: WizardStepComponentProps) =>
  <CameraCheckBase {...props} component={TakePhotoButtonComponent} />;

export const CameraCalibrationCard = (props: WizardStepComponentProps) => {
  const env = getEnv(props.resources);
  const easyCalibration = !!envGet("CAMERA_CALIBRATION_easy_calibration",
    prepopulateEnv(env));
  return <div className={"camera-calibration-card"}>
    <CalibrationCardSVG grid={easyCalibration} />
  </div>;
};

export const SwitchCameraCalibrationMethod =
  (props: WizardOutcomeComponentProps) => {
    return <CameraCalibrationMethodConfig
      wdEnvGet={key => envGet(key, prepopulateEnv(getEnv(props.resources)))}
      saveEnvVar={(key, value) =>
        props.dispatch(saveOrEditFarmwareEnv(props.resources)(
          key, JSON.stringify(formatEnvKey(key, value))))} />;
  };

const CameraCalibrationButtonComponent = (props: CameraCheckBaseProps) => {
  const env = getEnv(props.resources);
  const botOnline = isBotOnlineFromState(props.bot);
  const camDisabled = cameraBtnProps(env, botOnline);
  const easyCalibration = !!envGet("CAMERA_CALIBRATION_easy_calibration",
    prepopulateEnv(env));
  return <button
    className={`fb-button green ${camDisabled.class}`}
    disabled={!botOnline}
    title={camDisabled.title}
    onClick={camDisabled.click || calibrate(easyCalibration)}>
    {t("Calibrate")}
  </button>;
};

export const CameraCalibrationCheck = (props: WizardStepComponentProps) =>
  <CameraCheckBase {...props} component={CameraCalibrationButtonComponent} />;

const MeasureSoilHeight = (props: CameraCheckBaseProps) => {
  const farmwares = generateFarmwareDictionary(props.bot, props.resources, true);
  const env = getEnv(props.resources);
  const botOnline = isBotOnlineFromState(props.bot);
  const userEnv = props.bot.hardware.user_env;
  const farmwareEnvs = selectAllFarmwareEnvs(props.resources);
  const soilHeightFarmware = farmwares[FarmwareName.MeasureSoilHeight];
  return soilHeightFarmware
    ? <FarmwareForm
      farmware={soilHeightFarmware}
      env={env}
      userEnv={userEnv}
      farmwareEnvs={farmwareEnvs}
      saveFarmwareEnv={saveOrEditFarmwareEnv(props.resources)}
      botOnline={botOnline}
      hideAdvanced={true}
      hideResets={true}
      dispatch={props.dispatch} />
    : <button className={"fb-button gray pseudo-disabled"} disabled={true}>
      {t("Missing dependency")}
    </button>;
};

export const SoilHeightMeasurementCheck = (props: WizardStepComponentProps) =>
  <CameraCheckBase {...props} component={MeasureSoilHeight} longDuration={true} />;

export const lowVoltageProblemStatus = () => {
  const { throttled } = store.getState().bot.hardware.informational_settings;
  const voltageColor =
    colorFromThrottle(throttled || "0x0", ThrottleType.UnderVoltage);
  return !["red", "yellow"].includes(voltageColor);
};

export interface ControlsCheckOptions {
  axis?: Xyz;
  home?: boolean;
  both?: boolean;
  up?: boolean;
}

export interface ControlsCheckProps {
  dispatch: Function;
  controlsCheckOptions: ControlsCheckOptions;
}

export const ControlsCheck = (props: ControlsCheckProps) => {
  const { axis, both, home, up } = props.controlsCheckOptions;
  const upDirection = up ? "up" : undefined;
  const highlightDirection = both ? "both" : upDirection;
  return <div className={"controls-check"}>
    <MoveControls {...mapStateToProps(store.getState())}
      dispatch={props.dispatch}
      highlightAxis={axis}
      highlightDirection={highlightDirection}
      highlightHome={home} />
  </div>;
};

export const AssemblyDocs = (props: WizardOutcomeComponentProps) => {
  const firmwareHardware = getFwHardwareValue(getFbosConfig(props.resources));

  return <a href={isExpress(firmwareHardware)
    ? ExternalUrl.expressAssembly
    : ExternalUrl.genesisAssembly} target={"_blank"} rel={"noreferrer"}>
    {t("Assembly documentation")}
  </a>;
};

export const DownloadOS = (props: WizardOutcomeComponentProps) => {
  const getRelease = (rpi: string | undefined) => {
    switch (rpi) {
      case "01": return {
        imageUrl: globalConfig.rpi_release_url,
        releaseTag: globalConfig.rpi_release_tag,
      };
      case "02":
      case "3": return {
        imageUrl: globalConfig.rpi3_release_url,
        releaseTag: globalConfig.rpi3_release_tag,
      };
      case "4": return {
        imageUrl: globalConfig.rpi4_release_url,
        releaseTag: globalConfig.rpi4_release_tag,
      };
    }
  };
  const rpi = getDeviceAccountSettings(props.resources).body.rpi;
  const release = getRelease(rpi);
  return release
    ? <a className={"download-os-link"} href={release.imageUrl}>
      {`${t("Download")} FBOS v${release.releaseTag}`}
    </a>
    : <p>{t("Please select a model")}</p>;
};

export const DownloadImager = () =>
  <a className={"download-imager-link"} href={ExternalUrl.rpiImager}
    target={"_blank"} rel={"noreferrer"}>
    {t("Download Raspberry Pi Imager")}
  </a>;

export const NetworkRequirementsLink = () =>
  <a href={docLink("for-it-security-professionals")}
    target={"_blank"} rel={"noreferrer"}>
    {t("FarmBot Network Requirements")}
  </a>;

export const FlashFirmware = (props: WizardStepComponentProps) => {
  const firmwareHardware = getFwHardwareValue(getFbosConfig(props.resources));
  const botOnline = isBotOnlineFromState(props.bot);
  return <FlashFirmwareBtn
    apiFirmwareValue={firmwareHardware}
    botOnline={botOnline} />;
};

const SEED_DATA_OPTION_TO_FW_HARDWARE: Record<string, FirmwareHardware> = {
  "genesis_1.2": "arduino",
  "genesis_1.3": "farmduino",
  "genesis_1.4": "farmduino_k14",
  "genesis_1.5": "farmduino_k15",
  "genesis_1.6": "farmduino_k16",
  "genesis_1.7": "farmduino_k17",
  "genesis_xl_1.4": "farmduino_k14",
  "genesis_xl_1.5": "farmduino_k15",
  "genesis_xl_1.6": "farmduino_k16",
  "genesis_xl_1.7": "farmduino_k17",
  "express_1.0": "express_k10",
  "express_1.1": "express_k11",
  "express_1.2": "express_k12",
  "express_xl_1.0": "express_k10",
  "express_xl_1.1": "express_k11",
  "express_xl_1.2": "express_k12",
  "none": "none",
};

const FW_HARDWARE_TO_RPI: Record<FirmwareHardware, string | undefined> = {
  "arduino": "3",
  "farmduino": "3",
  "farmduino_k14": "3",
  "farmduino_k15": "3",
  "farmduino_k16": undefined,
  "farmduino_k17": "4",
  "express_k10": "01",
  "express_k11": "02",
  "express_k12": "02",
  "none": "3",
};

interface FirmwareHardwareSelectionState {
  selection: string;
  autoSeed: boolean;
  seeded: boolean;
}

export class FirmwareHardwareSelection
  extends React.Component<WizardStepComponentProps,
    FirmwareHardwareSelectionState> {
  state: FirmwareHardwareSelectionState = {
    selection: "",
    autoSeed: this.seedAlerts.length > 0,
    seeded: false,
  };

  get seedAlerts() {
    return selectAllAlerts(this.props.resources)
      .filter(alert => alert.body.problem_tag == "api.seed_data.missing");
  }

  onChange = (ddi: DropDownItem) => {
    const { dispatch, resources } = this.props;

    this.setState({ selection: "" + ddi.value });
    const firmwareHardware = SEED_DATA_OPTION_TO_FW_HARDWARE["" + ddi.value];
    changeFirmwareHardware(dispatch)({ label: "", value: firmwareHardware });
    const rpi = FW_HARDWARE_TO_RPI[firmwareHardware];
    if (rpi) {
      const device = getDeviceAccountSettings(this.props.resources);
      dispatch(edit(device, { rpi }));
      dispatch(save(device.uuid));
    }

    const seedAlertId = this.seedAlerts[0]?.body.id;
    const dismiss = () => seedAlertId && dispatch(destroy(
      findUuid(resources, "Alert", seedAlertId)));
    if (this.state.autoSeed && !this.state.seeded) {
      this.setState({ seeded: true });
      seedAccount(dismiss)({ label: "", value: ddi.value });
    }
  };

  toggleAutoSeed = () => this.setState({ autoSeed: !this.state.autoSeed });

  render() {
    const { selection, autoSeed } = this.state;
    const notSeeded = this.seedAlerts.length > 0;
    return <div className={"farmbot-model-selection"}>
      <FBSelect
        key={selection}
        list={SEED_DATA_OPTIONS()}
        selectedItem={SEED_DATA_OPTIONS_DDI()[selection]}
        onChange={this.onChange} />
      {notSeeded &&
        <div className={"seed-checkbox"}>
          <Checkbox
            onChange={this.toggleAutoSeed}
            checked={autoSeed}
            title={t("Add pre-made resources upon selection")} />
          <p>{t("Add pre-made resources upon selection")}</p>
        </div>}
      {autoSeed && notSeeded &&
        <p>{t(SetupWizardContent.SEED_DATA)}</p>}
      {autoSeed && !notSeeded &&
        <p>{t("Resources added!")}</p>}
    </div>;
  }
}

export const RpiSelection = (props: WizardStepComponentProps) => {
  const device = getDeviceAccountSettings(props.resources);
  const selection = device.body.rpi;
  return <div className={"rpi-selection"}>
    <img style={{ width: "100%" }}
      src={FilePath.setupWizardImage("rpi_3_vs_4.jpg")} />
    <FBSelect
      key={selection}
      customNullLabel={t("Select one")}
      list={Object.values(RPI_OPTIONS)
        .filter(ddi => ["3", "4"].includes("" + ddi.value))}
      selectedItem={RPI_OPTIONS["" + selection]}
      onChange={ddi => {
        const device = getDeviceAccountSettings(props.resources);
        props.dispatch(edit(device, { rpi: "" + ddi.value }));
        props.dispatch(save(device.uuid));
      }} />
  </div>;
};

export const Connectivity = (props: WizardStepComponentProps) => {
  const data = connectivityData({
    bot: props.bot,
    device: getDeviceAccountSettings(props.resources),
    apiFirmwareValue: getFwHardwareValue(getFbosConfig(props.resources)),
  });
  return <div className={"connectivity"}>
    <ConnectivityDiagram rowData={data.rowData} />
    <Diagnosis statusFlags={data.flags} />
  </div>;
};

export const AutoUpdate = (props: WizardStepComponentProps) => {
  return <OtaTimeSelector
    dispatch={props.dispatch}
    device={getDeviceAccountSettings(props.resources)}
    timeSettings={maybeGetTimeSettings(props.resources)}
    sourceFbosConfig={sourceFbosConfigValue(
      validFbosConfig(getFbosConfig(props.resources)),
      props.bot.hardware.configuration)}
  />;
};

export const InvertJogButton = (axis: Xyz) =>
  (props: WizardOutcomeComponentProps) => {
    const setting: Record<Xyz, BooleanWebAppConfigKey> = {
      x: BooleanSetting.x_axis_inverted,
      y: BooleanSetting.y_axis_inverted,
      z: BooleanSetting.z_axis_inverted,
    };

    return <fieldset>
      <label>
        {t("Invert {{ axis }}-axis Jog Buttons", { axis })}
      </label>
      <ToggleButton
        toggleAction={() => props.dispatch(toggleWebAppBool(setting[axis]))}
        toggleValue={!!props.getConfigValue(setting[axis])} />
    </fieldset>;
  };

export const CheckForResistance = () =>
  <p>
    {t("Check hardware for resistance.")}&nbsp;
    {t("Refer to the")}&nbsp;
    <a href={genesisDocLink("why-is-my-farmbot-not-moving")}>
      {t("Why is my FarmBot not moving?")}
    </a>
    &nbsp;{t("documentation page for adjustment suggestions.")}
  </p>;

export const MotorCurrentContent = () =>
  <fieldset>
    <CheckForResistance />
    <p>{t("You may also try increasing motor current by 10%.")}</p>
  </fieldset>;

const FirmwareSettingToggle = (
  setting: { key: NumberConfigKey, label: string },
  showText: boolean,
) =>
  (props: WizardOutcomeComponentProps) => {
    const sourceFwConfig = sourceFwConfigValue(validFwConfig(getFirmwareConfig(
      props.resources)), props.bot.hardware.mcu_params);
    const param = sourceFwConfig(setting.key);
    return <fieldset>
      {showText && <CheckForResistance />}
      <label>{t(setting.label)}</label>
      <ToggleButton dispatch={props.dispatch}
        dim={!param.consistent}
        toggleValue={param.value}
        toggleAction={() =>
          props.dispatch(settingToggle(setting.key, sourceFwConfig))} />
    </fieldset>;
  };

export const DisableStallDetection = (axis: Xyz, showText = true) => {
  const setting: Record<Xyz, { key: NumberConfigKey, label: string }> = {
    x: { key: "encoder_enabled_x", label: t("x-axis stall detection") },
    y: { key: "encoder_enabled_y", label: t("y-axis stall detection") },
    z: { key: "encoder_enabled_z", label: t("z-axis stall detection") },
  };
  return FirmwareSettingToggle(setting[axis], showText);
};

export const SwapJogButton = (props: WizardOutcomeComponentProps) =>
  <fieldset>
    <label>
      {t("Swap jog buttons: x and y axes")}
    </label>
    <ToggleButton
      toggleAction={() => props.dispatch(toggleWebAppBool(BooleanSetting.xy_swap))}
      toggleValue={!!props.getConfigValue(BooleanSetting.xy_swap)} />
  </fieldset>;

export const RotateMapToggle = (props: WizardOutcomeComponentProps) =>
  <fieldset>
    <label>
      {t("Rotate map")}
    </label>
    <ToggleButton
      toggleAction={() => props.dispatch(toggleWebAppBool(BooleanSetting.xy_swap))}
      toggleValue={!!props.getConfigValue(BooleanSetting.xy_swap)} />
  </fieldset>;

export const DynamicMapToggle = (props: WizardOutcomeComponentProps) =>
  <fieldset>
    <label>
      {t("Dynamic map size")}
    </label>
    <ToggleButton
      toggleAction={() =>
        props.dispatch(toggleWebAppBool(BooleanSetting.dynamic_map))}
      toggleValue={!!props.getConfigValue(BooleanSetting.dynamic_map)} />
  </fieldset>;

export const SelectMapOrigin = (props: WizardOutcomeComponentProps) =>
  <fieldset>
    <label>
      {t("Origin")}
    </label>
    <OriginSelector
      dispatch={props.dispatch}
      getConfigValue={props.getConfigValue} />
  </fieldset>;

export const MapOrientation = (props: WizardOutcomeComponentProps) =>
  <div className={"map-orientation"}>
    <RotateMapToggle {...props} />
    <SelectMapOrigin {...props} />
  </div>;

export const PeripheralsCheck = (props: WizardStepComponentProps) => {
  const peripherals = uniq(selectAllPeripherals(props.resources));
  const firmwareHardware = getFwHardwareValue(getFbosConfig(props.resources));
  return <div className={"peripherals-check"}>
    <Peripherals
      getConfigValue={props.getConfigValue}
      firmwareHardware={firmwareHardware}
      bot={props.bot}
      peripherals={peripherals}
      resources={props.resources}
      hidePinBindings={true}
      dispatch={props.dispatch} />
  </div>;
};

export interface PinBindingOptions {
  editing: boolean;
  unlockOnly?: boolean;
}

interface PinBindingProps {
  dispatch: Function;
  pinBindingOptions: PinBindingOptions;
  resources: ResourceIndex;
  bot: BotState;
  getConfigValue: GetWebAppConfigValue;
}

export const PinBinding = (props: PinBindingProps) => {
  const firmwareHardware = getFwHardwareValue(getFbosConfig(props.resources));
  return props.pinBindingOptions.unlockOnly
    ? <button
      title={t("unlock device")}
      className={"fb-button yellow e-stop"}
      onClick={() => emergencyUnlock()}>
      {t("UNLOCK")}
    </button>
    : <BoxTop
      threeDimensions={!!props.getConfigValue(
        BooleanSetting.enable_3d_electronics_box_top)}
      firmwareHardware={firmwareHardware}
      resources={props.resources}
      dispatch={props.dispatch}
      botOnline={isBotOnlineFromState(props.bot)}
      bot={props.bot}
      isEditing={props.pinBindingOptions.editing} />;
};

export const FindHome = (axis: Xyz) => (props: WizardStepComponentProps) => {
  const botOnline = isBotOnlineFromState(props.bot);
  const firmwareSettings = getFirmwareConfig(props.resources);
  const hardwareDisabled = disabledAxisMap(firmwareSettings?.body
    || props.bot.hardware.mcu_params);
  return <LockableButton
    className={"wizard-find-home-btn"}
    disabled={hardwareDisabled[axis] || !botOnline}
    title={t("FIND HOME")}
    onClick={() => findHome(axis)}>
    {t("FIND HOME {{ axis }}", { axis })}
  </LockableButton>;
};

export const SetHome = (axis: Xyz) => (props: WizardStepComponentProps) => {
  const botOnline = isBotOnlineFromState(props.bot);
  return <LockableButton
    disabled={!botOnline}
    title={t("SET HOME")}
    onClick={() => setHome(axis)}>
    {t("SET HOME {{ axis }}", { axis })}
  </LockableButton>;
};

export const AxisActions = (props: WizardStepComponentProps) => {
  const locationData = validBotLocationData(props.bot.hardware.location_data);
  const firmwareSettings = getFirmwareConfig(props.resources)?.body;
  const sourceFwConfig = sourceFwConfigValue(validFwConfig(getFirmwareConfig(
    props.resources)), props.bot.hardware.mcu_params);
  if (!firmwareSettings) { return <div />; }
  const firmwareHardware = getFwHardwareValue(getFbosConfig(props.resources));
  const botOnline = isBotOnlineFromState(props.bot);
  const { busy, locked } = props.bot.hardware.informational_settings;
  return <BotPositionRows
    locationData={locationData}
    showCurrentPosition={true}
    getConfigValue={props.getConfigValue}
    sourceFwConfig={sourceFwConfig}
    arduinoBusy={busy}
    locked={locked}
    botOnline={botOnline}
    dispatch={props.dispatch}
    firmwareSettings={firmwareSettings}
    firmwareHardware={firmwareHardware} />;
};

export const FindAxisLength = (axis: Xyz) =>
  (props: WizardOutcomeComponentProps) => {
    const botOnline = isBotOnlineFromState(props.bot);
    const firmwareSettings = getFirmwareConfig(props.resources);
    const hardwareDisabled = disabledAxisMap(firmwareSettings?.body
      || props.bot.hardware.mcu_params);
    const { busy } = props.bot.hardware.informational_settings;
    return <fieldset>
      <p>{t("Then try finding the axis length again.")}</p>
      <LockableButton
        className={"wizard-find-length-btn"}
        disabled={busy || hardwareDisabled[axis] || !botOnline}
        title={t("FIND LENGTH")}
        onClick={() => findAxisLength(axis)}>
        {t("FIND LENGTH")}
      </LockableButton>
    </fieldset>;
  };

export const BootSequence = () => {
  return <BootSequenceSelector />;
};

export const CameraOffset = (props: WizardStepComponentProps) => {
  const helpText = t(ToolTips.CAMERA_OFFSET, {
    defaultX: WD_KEY_DEFAULTS["CAMERA_CALIBRATION_camera_offset_x"],
    defaultY: WD_KEY_DEFAULTS["CAMERA_CALIBRATION_camera_offset_y"],
  });
  const env = getEnv(props.resources);
  const wDEnv = prepopulateEnv(env);
  const common: Pick<NumberBoxConfigProps, "wdEnvGet" | "onChange"> = {
    wdEnvGet: key => envGet(key, wDEnv),
    onChange: (key, value) =>
      props.dispatch(saveOrEditFarmwareEnv(props.resources)(
        key, JSON.stringify(formatEnvKey(key, value)))),
  };
  return <Row>
    <Col xs={6}>
      <NumberBoxConfig {...common}
        settingName={DeviceSetting.cameraOffsetX}
        configKey={"CAMERA_CALIBRATION_camera_offset_x"}
        helpText={helpText} />
    </Col>
    <Col xs={6}>
      <NumberBoxConfig {...common}
        settingName={DeviceSetting.cameraOffsetY}
        configKey={"CAMERA_CALIBRATION_camera_offset_y"}
        helpText={helpText} />
    </Col>
  </Row>;
};

export const CameraImageOrigin = (props: WizardStepComponentProps) => {
  const env = getEnv(props.resources);
  const wDEnv = prepopulateEnv(env);
  return <Row>
    <Col xs={12}>
      <DropdownConfig
        settingName={DeviceSetting.originLocationInImage}
        wdEnvGet={key => envGet(key, wDEnv)}
        onChange={(key, value) =>
          props.dispatch(saveOrEditFarmwareEnv(props.resources)(
            key, JSON.stringify(formatEnvKey(key, value))))}
        list={ORIGIN_DROPDOWNS()}
        configKey={"CAMERA_CALIBRATION_image_bot_origin_location"}
        helpText={t(ToolTips.IMAGE_BOT_ORIGIN_LOCATION, {
          defaultOrigin: SPECIAL_VALUE_DDI()[WD_KEY_DEFAULTS[
            "CAMERA_CALIBRATION_image_bot_origin_location"]].label
        })} />
    </Col>
  </Row>;
};

export const FlowRateInput = (props: WizardStepComponentProps) => {
  const tool = selectAllTools(props.resources).filter(tool =>
    reduceToolName(tool.body.name) == ToolName.wateringNozzle)[0];
  return tool
    ? <WaterFlowRateInput
      value={tool.body.flow_rate_ml_per_s}
      hideTooltip={true}
      onChange={flowRate => {
        props.dispatch(edit(tool, {
          flow_rate_ml_per_s: flowRate,
        }));
        props.dispatch(save(tool.uuid));
      }} />
    : <button className={"fb-button green"}
      style={{ float: "none" }}
      title={t("Add new tool")}
      onClick={() =>
        props.dispatch(initSave("Tool", { name: "Watering Nozzle" }))}>
      {t("Add watering nozzle")}
    </button>;
};

export const ToolCheck = (props: WizardStepComponentProps) => {
  const sensors = selectAllSensors(props.resources);
  return <ToolVerification sensors={sensors} bot={props.bot} />;
};

export const SensorsCheck = (props: WizardStepComponentProps) => {
  const sensors = uniq(selectAllSensors(props.resources));
  const botOnline = isBotOnlineFromState(props.bot);
  const firmwareHardware = getFwHardwareValue(getFbosConfig(props.resources));
  return <div className={"sensors-check"}>
    <Sensors
      firmwareHardware={firmwareHardware}
      bot={props.bot}
      sensors={sensors}
      disabled={!botOnline}
      dispatch={props.dispatch} />
  </div>;
};

export const CameraReplacement = () =>
  <div className={"camera-replacement"}>
    <p></p>
    <p>
      {t(SetupWizardContent.CAMERA_REPLACEMENT)}
      <a href={ExternalUrl.Store.cameraReplacement}
        target="_blank" rel={"noreferrer"}>
        {t("here")}.
      </a>
    </p>
  </div>;

export const Tour = (tourSlug: string) =>
  (props: WizardStepComponentProps) =>
    <button className={"fb-button green tour-start"}
      title={t("Start tour")}
      onClick={() => {
        const firstStep = TOURS()[tourSlug].steps[0];
        props.dispatch({ type: Actions.SET_TOUR, payload: tourSlug });
        props.dispatch({ type: Actions.SET_TOUR_STEP, payload: firstStep.slug });
        push(tourPath(firstStep.url, tourSlug, firstStep.slug));
      }}>
      {t("Start tour")}
    </button>;
