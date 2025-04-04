import React from "react";
import { BooleanMCUInputGroup } from "./boolean_mcu_input_group";
import { ToolTips, DeviceSetting } from "../../constants";
import { settingToggle } from "../../devices/actions";
import { NumericMCUInputGroup } from "./numeric_mcu_input_group";
import { MotorsProps } from "./interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { Xyz, McuParamName } from "farmbot";
import { SourceFwConfig } from "../../devices/interfaces";
import { calcMicrostepsPerMm } from "../../controls/move/direction_axes_props";
import { isTMCBoard } from "../firmware/firmware_hardware_support";
import { SingleSettingRow } from "./single_setting_row";
import { Highlight } from "../maybe_highlight";
import { SpacePanelHeader } from "./space_panel_header";
import { Help, Row, ToggleButton } from "../../ui";
import { t } from "../../i18next_wrapper";
import { McuInputBox } from "./mcu_input_box";
import { getDefaultFwConfigValue, getModifiedClassName } from "./default_values";
import { floor, round } from "lodash";

export const calculateScale =
  (sourceFwConfig: SourceFwConfig): Record<Xyz, number> => {
    const getV = (key: McuParamName) => sourceFwConfig(key).value;
    return {
      x: calcMicrostepsPerMm(getV("movement_step_per_mm_x"),
        getV("movement_microsteps_x")),
      y: calcMicrostepsPerMm(getV("movement_step_per_mm_y"),
        getV("movement_microsteps_y")),
      z: calcMicrostepsPerMm(getV("movement_step_per_mm_z"),
        getV("movement_microsteps_z")),
    };
  };

export const Motors = (props: MotorsProps) => {
  const {
    dispatch, settingsPanelState, sourceFwConfig, firmwareHardware, arduinoBusy,
    showAdvanced,
  } = props;
  const enable2ndXMotor = sourceFwConfig("movement_secondary_motor_x");
  const invert2ndXMotor = sourceFwConfig("movement_secondary_motor_invert_x");
  const scale = calculateScale(sourceFwConfig);

  const commonProps = {
    dispatch,
    sourceFwConfig,
    arduinoBusy,
    firmwareHardware,
    showAdvanced,
  };

  const getDefault = getDefaultFwConfigValue(props.firmwareHardware);

  return <Highlight className={"section"}
    settingName={DeviceSetting.motors}>
    <Header
      expanded={settingsPanelState.motors}
      title={DeviceSetting.motors}
      panel={"motors"}
      dispatch={dispatch} />
    <Collapse isOpen={!!settingsPanelState.motors}>
      <div className="settings-warning-banner">
        <p>{t(ToolTips.HW_SETTINGS)}</p>
      </div>
      <SpacePanelHeader />
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.maxSpeed}
        tooltip={ToolTips.MAX_SPEED}
        x={"movement_max_spd_x"}
        y={"movement_max_spd_y"}
        z={"movement_max_spd_z"}
        xScale={scale.x}
        yScale={scale.y}
        zScale={scale.z} />
      <Highlight settingName={DeviceSetting.maxSpeedTowardHome}>
        <Row className="z-setting-grid">
          <div>
            <label>
              {t(DeviceSetting.maxSpeedTowardHome)}
            </label>
            <Help
              text={t(ToolTips.MAX_SPEED_Z_TOWARD_HOME, {
                z: getDefault("movement_max_spd_z2") / scale.z
              })} />
          </div>
          <McuInputBox {...commonProps}
            setting={"movement_max_spd_z2"}
            scale={scale.z} />
        </Row>
      </Highlight>
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.homingSpeed}
        tooltip={ToolTips.HOME_SPEED}
        advanced={true}
        x={"movement_home_spd_x"}
        y={"movement_home_spd_y"}
        z={"movement_home_spd_z"}
        xScale={scale.x}
        yScale={scale.y}
        zScale={scale.z} />
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.minimumSpeed}
        tooltip={ToolTips.MIN_SPEED}
        x={"movement_min_spd_x"}
        y={"movement_min_spd_y"}
        z={"movement_min_spd_z"}
        xScale={scale.x}
        yScale={scale.y}
        zScale={scale.z} />
      <Highlight settingName={DeviceSetting.minimumSpeedTowardHome}>
        <Row className="z-setting-grid">
          <div>
            <label>
              {t(DeviceSetting.minimumSpeedTowardHome)}
            </label>
            <Help
              text={t(ToolTips.MIN_SPEED_Z_TOWARD_HOME, {
                z: getDefault("movement_min_spd_z2") / scale.z
              })} />
          </div>
          <McuInputBox {...commonProps}
            setting={"movement_min_spd_z2"}
            scale={scale.z} />
        </Row>
      </Highlight>
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.accelerateFor}
        tooltip={ToolTips.ACCELERATE_FOR}
        x={"movement_steps_acc_dec_x"}
        y={"movement_steps_acc_dec_y"}
        z={"movement_steps_acc_dec_z"}
        xScale={scale.x}
        yScale={scale.y}
        zScale={scale.z} />
      <Highlight settingName={DeviceSetting.accelerateForTowardHome}>
        <Row className="z-setting-grid">
          <div>
            <label>
              {t(DeviceSetting.accelerateForTowardHome)}
            </label>
            <Help
              text={t(ToolTips.ACCELERATE_FOR_Z_TOWARD_HOME, {
                z: getDefault("movement_steps_acc_dec_z2") / scale.z
              })} />
          </div>
          <McuInputBox {...commonProps}
            setting={"movement_steps_acc_dec_z2"}
            scale={scale.z} />
        </Row>
      </Highlight>
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.stepsPerMm}
        tooltip={ToolTips.STEPS_PER_MM}
        x={"movement_step_per_mm_x"}
        y={"movement_step_per_mm_y"}
        z={"movement_step_per_mm_z"}
        xScale={sourceFwConfig("movement_microsteps_x").value}
        yScale={sourceFwConfig("movement_microsteps_y").value}
        zScale={sourceFwConfig("movement_microsteps_z").value}
        advanced={true}
        float={false} />
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.microstepsPerStep}
        tooltip={ToolTips.MICROSTEPS_PER_STEP}
        warning={microstepWarning(sourceFwConfig)}
        x={"movement_microsteps_x"}
        y={"movement_microsteps_y"}
        z={"movement_microsteps_z"}
        advanced={true} />
      <BooleanMCUInputGroup {...commonProps}
        label={DeviceSetting.alwaysPowerMotors}
        tooltip={ToolTips.ALWAYS_POWER_MOTORS}
        x={"movement_keep_active_x"}
        y={"movement_keep_active_y"}
        z={"movement_keep_active_z"} />
      <BooleanMCUInputGroup {...commonProps}
        label={DeviceSetting.invertMotors}
        tooltip={ToolTips.INVERT_MOTORS}
        x={"movement_invert_motor_x"}
        y={"movement_invert_motor_y"}
        z={"movement_invert_motor_z"} />
      {isTMCBoard(firmwareHardware) &&
        <NumericMCUInputGroup {...commonProps}
          label={DeviceSetting.motorCurrent}
          tooltip={ToolTips.MOTOR_CURRENT}
          x={"movement_motor_current_x"}
          y={"movement_motor_current_y"}
          z={"movement_motor_current_z"}
          advanced={true}
          inputMax={100}
          toInput={motorCurrentMaToPercent}
          fromInput={motorCurrentPercentToMa} />}
      {isTMCBoard(firmwareHardware) &&
        <BooleanMCUInputGroup {...commonProps}
          label={DeviceSetting.quietMode}
          tooltip={ToolTips.QUIET_MODE}
          advanced={true}
          x={"movement_axis_stealth_x"}
          y={"movement_axis_stealth_y"}
          z={"movement_axis_stealth_z"} />}
      <SingleSettingRow settingType="button"
        label={DeviceSetting.enable2ndXMotor}
        advanced={true}
        showAdvanced={showAdvanced}
        modified={
          getDefault("movement_secondary_motor_x") != enable2ndXMotor.value}
        tooltip={t(ToolTips.ENABLE_X2_MOTOR, {
          x2Motor: getDefault("movement_secondary_motor_x")
            ? t("enabled")
            : t("disabled")
        })}>
        <ToggleButton dispatch={dispatch}
          toggleValue={enable2ndXMotor.value}
          dim={!enable2ndXMotor.consistent}
          className={[
            "no-float",
            getModifiedClassName(
              "movement_secondary_motor_x",
              enable2ndXMotor.value,
              firmwareHardware)].join(" ")}
          disabled={arduinoBusy}
          toggleAction={() => dispatch(
            settingToggle("movement_secondary_motor_x", sourceFwConfig))} />
      </SingleSettingRow>
      <SingleSettingRow settingType="button"
        label={DeviceSetting.invert2ndXMotor}
        advanced={true}
        showAdvanced={showAdvanced}
        modified={
          getDefault("movement_secondary_motor_invert_x") != invert2ndXMotor.value}
        tooltip={t(ToolTips.INVERT_X2_MOTOR, {
          x: getDefault("movement_secondary_motor_invert_x")
            ? t("enabled")
            : t("disabled")
        })}>
        <ToggleButton dispatch={dispatch}
          grayscale={!enable2ndXMotor.value}
          toggleValue={invert2ndXMotor.value}
          dim={!invert2ndXMotor.consistent}
          className={[
            "no-float",
            getModifiedClassName(
              "movement_secondary_motor_invert_x",
              invert2ndXMotor.value,
              firmwareHardware)].join(" ")}
          disabled={arduinoBusy}
          toggleAction={() => dispatch(
            settingToggle("movement_secondary_motor_invert_x", sourceFwConfig))} />
      </SingleSettingRow>
    </Collapse>
  </Highlight>;
};

const microstepWarning = (sourceFwConfig: SourceFwConfig) => ({
  x: !!sourceFwConfig("movement_axis_stealth_x").value &&
    sourceFwConfig("movement_microsteps_x").value != 1
    ? t(ToolTips.MICROSTEP_WARNING)
    : undefined,
  y: !!sourceFwConfig("movement_axis_stealth_y").value &&
    sourceFwConfig("movement_microsteps_y").value != 1
    ? t(ToolTips.MICROSTEP_WARNING)
    : undefined,
  z: !!sourceFwConfig("movement_axis_stealth_z").value &&
    sourceFwConfig("movement_microsteps_z").value != 1
    ? t(ToolTips.MICROSTEP_WARNING)
    : undefined,
});

// calculated from L57 & L59 equations in `farmbot-arduino-firmware/src/TMC2130.cpp`
const EQ1_M = 0.032683964;
const EQ2_M = 0.018101888;

/** Convert an existing mA value to the percent of max current it will produce. */
export const motorCurrentMaToPercent = (mA: number) => {
  let CS = EQ2_M * mA - 1;
  if (CS < 16) { CS = EQ1_M * mA - 1; }
  CS = Math.max(CS, 0) % 32;
  const percent = round(CS / 32 * 100);
  return percent;
};

/** Convert a desired percent of max current to a mA value that will produce it. */
export const motorCurrentPercentToMa = (percent: number) => {
  const CS = percent / 100 * 32;
  let mA = (CS + 1) / EQ2_M;
  if (mA < 940) { mA = (CS + 1) / EQ1_M; }
  mA = floor(mA);
  return mA;
};
