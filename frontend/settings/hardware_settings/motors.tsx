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
import { isTMCBoard, hasZ2Params } from "../firmware/firmware_hardware_support";
import { SingleSettingRow } from "./single_setting_row";
import { Highlight } from "../maybe_highlight";
import { SpacePanelHeader } from "./space_panel_header";
import { Col, Help, Row, ToggleButton } from "../../ui";
import { t } from "../../i18next_wrapper";
import { McuInputBox } from "./mcu_input_box";
import { getDefaultFwConfigValue, getModifiedClassName } from "./default_values";

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

export function Motors(props: MotorsProps) {
  const {
    dispatch, controlPanelState, sourceFwConfig, firmwareHardware, arduinoBusy,
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
  const z2Params = hasZ2Params(firmwareHardware, props.shouldDisplay);

  return <Highlight className={"section"}
    settingName={DeviceSetting.motors}>
    <Header
      expanded={controlPanelState.motors}
      title={DeviceSetting.motors}
      panel={"motors"}
      dispatch={dispatch} />
    {controlPanelState.motors &&
      <Help customClass={"hw-warn"} text={ToolTips.HW_SETTINGS}
        customIcon={"exclamation-triangle"} />}
    <Collapse isOpen={!!controlPanelState.motors}>
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
      {z2Params &&
        <Highlight settingName={DeviceSetting.maxSpeedTowardHome}>
          <Row>
            <Col xs={8} className={"z-param-label"}>
              <label>
                {t(DeviceSetting.maxSpeedTowardHome)}
              </label>
              <Help
                text={t(ToolTips.MAX_SPEED_Z_TOWARD_HOME, {
                  z: getDefault("movement_max_spd_z2") / scale.z
                })} />
            </Col>
            <Col xs={4} className={"z-param-input"}>
              <McuInputBox {...commonProps}
                setting={"movement_max_spd_z2"}
                scale={scale.z} />
            </Col>
          </Row>
        </Highlight>}
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.homingSpeed}
        tooltip={ToolTips.HOME_SPEED}
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
      {z2Params &&
        <Highlight settingName={DeviceSetting.minimumSpeedTowardHome}>
          <Row>
            <Col xs={8} className={"z-param-label"}>
              <label>
                {t(DeviceSetting.minimumSpeedTowardHome)}
              </label>
              <Help
                text={t(ToolTips.MIN_SPEED_Z_TOWARD_HOME, {
                  z: getDefault("movement_min_spd_z2") / scale.z
                })} />
            </Col>
            <Col xs={4} className={"z-param-input"}>
              <McuInputBox {...commonProps}
                setting={"movement_min_spd_z2"}
                scale={scale.z} />
            </Col>
          </Row>
        </Highlight>}
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.accelerateFor}
        tooltip={ToolTips.ACCELERATE_FOR}
        x={"movement_steps_acc_dec_x"}
        y={"movement_steps_acc_dec_y"}
        z={"movement_steps_acc_dec_z"}
        xScale={scale.x}
        yScale={scale.y}
        zScale={scale.z} />
      {z2Params &&
        <Highlight settingName={DeviceSetting.accelerateForTowardHome}>
          <Row>
            <Col xs={8} className={"z-param-label"}>
              <label>
                {t(DeviceSetting.accelerateForTowardHome)}
              </label>
              <Help
                text={t(ToolTips.ACCELERATE_FOR_Z_TOWARD_HOME, {
                  z: getDefault("movement_steps_acc_dec_z2") / scale.z
                })} />
            </Col>
            <Col xs={4} className={"z-param-input"}>
              <McuInputBox {...commonProps}
                setting={"movement_steps_acc_dec_z2"}
                scale={scale.z} />
            </Col>
          </Row>
        </Highlight>}
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
          z={"movement_motor_current_z"} />}
      <SingleSettingRow settingType="button"
        label={DeviceSetting.enable2ndXMotor}
        tooltip={t(ToolTips.ENABLE_X2_MOTOR, {
          x2Motor: getDefault("movement_secondary_motor_x")
            ? t("enabled")
            : t("disabled")
        })}>
        <ToggleButton
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
        tooltip={t(ToolTips.INVERT_X2_MOTOR, {
          x: getDefault("movement_secondary_motor_invert_x")
            ? t("enabled")
            : t("disabled")
        })}>
        <ToggleButton
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
}
