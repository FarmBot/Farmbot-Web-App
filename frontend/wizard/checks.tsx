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
  getDeviceAccountSettings, selectAllAlerts, selectAllFarmwareEnvs,
  selectAllImages, selectAllLogs, selectAllPeripherals, selectAllSensors,
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
import {
  isExpress, isFwHardwareValue,
} from "../settings/firmware/firmware_hardware_support";
import { t } from "../i18next_wrapper";
import { docLinkClick, FBSelect, ToggleButton } from "../ui";
import {
  changeFirmwareHardware, SEED_DATA_OPTIONS, SEED_DATA_OPTIONS_DDI,
} from "../messages/cards";
import { seedAccount } from "../messages/actions";
import { FirmwareHardware, TaggedLog, Xyz } from "farmbot";
import { ConnectivityDiagram } from "../devices/connectivity/diagram";
import { Diagnosis } from "../devices/connectivity/diagnosis";
import { connectivityData } from "../devices/connectivity/generate_data";
import { sourceFwConfigValue } from "../settings/source_config_value";
import { settingToggle } from "../devices/actions";
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
import { toggleWebAppBool } from "../config_storage/actions";

const recentErrorLog = (
  logs: TaggedLog[],
  prevLogTime: number | undefined,
  errorMessage: string,
) =>
  some(logs
    .filter(log => prevLogTime && (log.body.created_at || 0) > prevLogTime)
    .map(log => log.body.message.toLowerCase()
      .includes(errorMessage.toLowerCase())));

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
  if (!error && recentErrorLog(logs, prevLogTime, "USB Camera not detected.")) {
    props.setStepSuccess(false, "error")();
    setError(true);
  }

  return <div className={"camera-check"}
    onClick={() => {
      setPrevImageId(getLastImageId());
      setPrevLogTime(getLastLogTimestamp());
      setError(false);
    }}>
    <props.component {...props} />
    {imageUrl && <img src={imageUrl} />}
  </div>;
};

const TakePhotoButtonComponent = (props: CameraCheckBaseProps) => {
  const env = getEnv(props.resources);
  const botOnline = isBotOnlineFromState(props.bot);
  return <TakePhotoButton env={env} disabled={!botOnline} />;
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
  const camDisabled = cameraBtnProps(env);
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
    : <p>{t("Missing dependency")}</p>;
};

export const SoilHeightMeasurementCheck = (props: WizardStepComponentProps) =>
  <CameraCheckBase {...props} component={MeasureSoilHeight} />;

export const lowVoltageProblemStatus = () => {
  const { throttled } = store.getState().bot.hardware.informational_settings;
  const voltageColor =
    colorFromThrottle(throttled || "0x0", ThrottleType.UnderVoltage);
  return !["red", "yellow"].includes(voltageColor);
};

export const ControlsCheck = (axis: Xyz) => () =>
  <div className={"controls-check"}>
    <MoveControls {...mapStateToProps(store.getState())}
      highlightAxis={axis} />
  </div>;

export const AssemblyDocs = (props: WizardOutcomeComponentProps) => {
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources));
  const value = fbosConfig?.firmware_hardware;
  const fwHardware = isFwHardwareValue(value) ? value : undefined;

  return <a href={isExpress(fwHardware)
    ? ExternalUrl.expressAssembly
    : ExternalUrl.genesisAssembly} target={"_blank"} rel={"noreferrer"}>
    {t("Assembly documentation")}
  </a>;
};

export const FirmwareHardwareSelection = (props: WizardStepComponentProps) => {
  const FW_HARDWARE_TO_SEED_DATA_OPTION: Record<string, FirmwareHardware> = {
    "genesis_1.2": "arduino",
    "genesis_1.3": "farmduino",
    "genesis_1.4": "farmduino_k14",
    "genesis_1.5": "farmduino_k15",
    "genesis_xl_1.4": "farmduino_k14",
    "genesis_xl_1.5": "farmduino_k15",
    "express_1.0": "express_k10",
    "express_xl_1.0": "express_k10",
    "none": "none",
  };

  const [selection, setSelection] = React.useState("");
  const alerts = selectAllAlerts(props.resources);
  const notSeeded = alerts
    .filter(alert => alert.body.problem_tag == "api.seed_data.missing")
    .length > 0;
  return <div className={"farmbot-model-selection"}>
    <FBSelect
      key={selection}
      list={SEED_DATA_OPTIONS()}
      selectedItem={SEED_DATA_OPTIONS_DDI[selection]}
      onChange={ddi => {
        setSelection("" + ddi.value);
        changeFirmwareHardware(props.dispatch)({
          label: "",
          value: FW_HARDWARE_TO_SEED_DATA_OPTION["" + ddi.value]
        });
      }} />
    {notSeeded && selection &&
      <button className={"fb-button green"}
        onClick={() => seedAccount()({ label: "", value: selection })}>
        {t("Add pre-made resources to account")}
      </button>}
  </div>;
};

export const ConfiguratorDocs = () => {
  return <a onClick={docLinkClick("farmbot-os")}>
    {t("Installing FarmBot OS documentation")}
  </a>;
};

export const Connectivity = (props: WizardStepComponentProps) => {
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources));
  const value = fbosConfig?.firmware_hardware;
  const data = connectivityData({
    bot: props.bot,
    device: getDeviceAccountSettings(props.resources),
    apiFirmwareValue: isFwHardwareValue(value) ? value : undefined,
  });
  return <div className={"connectivity"}>
    <ConnectivityDiagram rowData={data.rowData} />
    <Diagnosis statusFlags={data.flags} hideGraphic={true} />
  </div>;
};

export const InvertMotor = (axis: Xyz) => {
  const setting: Record<Xyz, { key: NumberConfigKey, label: string }> = {
    x: { key: "movement_invert_motor_x", label: t("Invert x-axis motor") },
    y: { key: "movement_invert_motor_y", label: t("Invert y-axis motor") },
    z: { key: "movement_invert_motor_z", label: t("Invert z-axis motor") },
  };
  return FirmwareSettingToggle(setting[axis]);
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

const FirmwareSettingToggle = (setting: { key: NumberConfigKey, label: string }) =>
  (props: WizardOutcomeComponentProps) => {
    const sourceFwConfig = sourceFwConfigValue(validFwConfig(getFirmwareConfig(
      props.resources)), props.bot.hardware.mcu_params);
    const param = sourceFwConfig(setting.key);
    return <fieldset>
      <label>{t(setting.label)}</label>
      <ToggleButton
        dim={!param.consistent}
        toggleValue={param.value}
        toggleAction={() =>
          props.dispatch(settingToggle(setting.key, sourceFwConfig))} />
    </fieldset>;
  };

export const DisableStallDetection = (axis: Xyz) => {
  const setting: Record<Xyz, { key: NumberConfigKey, label: string }> = {
    x: { key: "encoder_enabled_x", label: t("x-axis stall detection") },
    y: { key: "encoder_enabled_y", label: t("y-axis stall detection") },
    z: { key: "encoder_enabled_z", label: t("z-axis stall detection") },
  };
  return FirmwareSettingToggle(setting[axis]);
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

export const PeripheralsCheck = (props: WizardStepComponentProps) => {
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources));
  const value = fbosConfig?.firmware_hardware;
  const fwHardware = isFwHardwareValue(value) ? value : undefined;
  const peripherals = uniq(selectAllPeripherals(props.resources));
  return <div className={"peripherals-check"}>
    <Peripherals
      firmwareHardware={fwHardware}
      bot={props.bot}
      peripherals={peripherals}
      dispatch={props.dispatch} />
  </div>;
};

export const ToolCheck = (props: WizardStepComponentProps) => {
  const sensors = selectAllSensors(props.resources);
  return <ToolVerification sensors={sensors} bot={props.bot} />;
};
