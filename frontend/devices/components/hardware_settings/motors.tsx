import * as React from "react";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips } from "../../../constants";
import { SpacePanelToolTip } from "../space_panel_tool_tip";
import { ToggleButton } from "../../../controls/toggle_button";
import { settingToggle } from "../../actions";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { MotorsProps } from "../interfaces";
import { Row, Col } from "../../../ui/index";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { McuInputBox } from "../mcu_input_box";
import { minFwVersionCheck } from "../../../util";
import { t } from "../../../i18next_wrapper";

const SingleSettingRow =
  ({ label, tooltip, settingType, children }: {
    label: string,
    tooltip: string,
    children: React.ReactChild,
    settingType: "button" | "input",
  }) =>
    <Row>
      <Col xs={6}>
        <label>{label}</label>
        <SpacePanelToolTip tooltip={tooltip} />
      </Col>
      {settingType === "button"
        ? <Col xs={2} className={"centered-button-div"}>{children}</Col>
        : <Col xs={6}>{children}</Col>}
    </Row>;

export function Motors(props: MotorsProps) {
  const {
    dispatch, firmwareVersion, controlPanelState,
    sourceFwConfig, isValidFwConfig
  } = props;
  const enable2ndXMotor = sourceFwConfig("movement_secondary_motor_x");
  const invert2ndXMotor = sourceFwConfig("movement_secondary_motor_invert_x");
  const eStopOnMoveError = sourceFwConfig("param_e_stop_on_mov_err");

  return <section>
    <Header
      expanded={controlPanelState.motors}
      title={t("Motors")}
      name={"motors"}
      dispatch={dispatch} />
    <Collapse isOpen={!!controlPanelState.motors}>
      <SingleSettingRow settingType="input"
        label={t("Max Retries")}
        tooltip={ToolTips.MAX_MOVEMENT_RETRIES}>
        <McuInputBox
          setting="param_mov_nr_retry"
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch} />
      </SingleSettingRow>
      <SingleSettingRow settingType="button"
        label={t("E-Stop on Movement Error")}
        tooltip={ToolTips.E_STOP_ON_MOV_ERR}>
        <ToggleButton
          toggleValue={eStopOnMoveError.value}
          dim={!eStopOnMoveError.consistent}
          toggleAction={() => dispatch(
            settingToggle("param_e_stop_on_mov_err", sourceFwConfig))} />
      </SingleSettingRow>
      <NumericMCUInputGroup
        name={t("Max Speed (mm/s)")}
        tooltip={ToolTips.MAX_SPEED}
        x={"movement_max_spd_x"}
        y={"movement_max_spd_y"}
        z={"movement_max_spd_z"}
        xScale={sourceFwConfig("movement_step_per_mm_x").value}
        yScale={sourceFwConfig("movement_step_per_mm_y").value}
        zScale={sourceFwConfig("movement_step_per_mm_z").value}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      {(minFwVersionCheck(firmwareVersion, "5.0.5") || isValidFwConfig) &&
        <NumericMCUInputGroup
          name={t("Homing Speed (mm/s)")}
          tooltip={ToolTips.HOME_SPEED}
          x={"movement_home_spd_x"}
          y={"movement_home_spd_y"}
          z={"movement_home_spd_z"}
          xScale={sourceFwConfig("movement_step_per_mm_x").value}
          yScale={sourceFwConfig("movement_step_per_mm_y").value}
          zScale={sourceFwConfig("movement_step_per_mm_z").value}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch} />}
      <NumericMCUInputGroup
        name={t("Minimum Speed (mm/s)")}
        tooltip={ToolTips.MIN_SPEED}
        x={"movement_min_spd_x"}
        y={"movement_min_spd_y"}
        z={"movement_min_spd_z"}
        xScale={sourceFwConfig("movement_step_per_mm_x").value}
        yScale={sourceFwConfig("movement_step_per_mm_y").value}
        zScale={sourceFwConfig("movement_step_per_mm_z").value}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <NumericMCUInputGroup
        name={t("Accelerate for (mm)")}
        tooltip={ToolTips.ACCELERATE_FOR}
        x={"movement_steps_acc_dec_x"}
        y={"movement_steps_acc_dec_y"}
        z={"movement_steps_acc_dec_z"}
        xScale={sourceFwConfig("movement_step_per_mm_x").value}
        yScale={sourceFwConfig("movement_step_per_mm_y").value}
        zScale={sourceFwConfig("movement_step_per_mm_z").value}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <NumericMCUInputGroup
        name={t("Steps per MM")}
        tooltip={ToolTips.STEPS_PER_MM}
        x={"movement_step_per_mm_x"}
        y={"movement_step_per_mm_y"}
        z={"movement_step_per_mm_z"}
        float={false}
        sourceFwConfig={props.sourceFwConfig}
        dispatch={props.dispatch} />
      <BooleanMCUInputGroup
        name={t("Always Power Motors")}
        tooltip={ToolTips.ALWAYS_POWER_MOTORS}
        x={"movement_keep_active_x"}
        y={"movement_keep_active_y"}
        z={"movement_keep_active_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        name={t("Invert Motors")}
        tooltip={ToolTips.INVERT_MOTORS}
        x={"movement_invert_motor_x"}
        y={"movement_invert_motor_y"}
        z={"movement_invert_motor_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <SingleSettingRow settingType="button"
        label={t("Enable 2nd X Motor")}
        tooltip={ToolTips.ENABLE_X2_MOTOR}>
        <ToggleButton
          toggleValue={enable2ndXMotor.value}
          dim={!enable2ndXMotor.consistent}
          toggleAction={() => dispatch(
            settingToggle("movement_secondary_motor_x", sourceFwConfig))} />
      </SingleSettingRow>
      <SingleSettingRow settingType="button"
        label={t("Invert 2nd X Motor")}
        tooltip={ToolTips.INVERT_MOTORS}>
        <ToggleButton
          grayscale={!enable2ndXMotor.value}
          toggleValue={invert2ndXMotor.value}
          dim={!invert2ndXMotor.consistent}
          toggleAction={() => dispatch(
            settingToggle("movement_secondary_motor_invert_x", sourceFwConfig))} />
      </SingleSettingRow>
    </Collapse>
  </section>;
}
