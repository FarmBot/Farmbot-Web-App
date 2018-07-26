import * as React from "react";
import { t } from "i18next";
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
import { StepsPerMmSettings } from "./steps_per_mm_settings";

export function Motors(props: MotorsProps) {
  const {
    dispatch, firmwareVersion, sourceFbosConfig, controlPanelState,
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
      <Row>
        <Col xs={6}>
          <label>
            {t("Max Retries")}
          </label>
          <SpacePanelToolTip tooltip={ToolTips.MAX_MOVEMENT_RETRIES} />
        </Col>
        <Col xs={6}>
          <McuInputBox
            setting="param_mov_nr_retry"
            sourceFwConfig={sourceFwConfig}
            dispatch={dispatch} />
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <label>
            {t("E-Stop on Movement Error")}
          </label>
          <SpacePanelToolTip tooltip={ToolTips.E_STOP_ON_MOV_ERR} />
        </Col>
        <Col xs={2} className={"centered-button-div"}>
          <ToggleButton
            toggleValue={eStopOnMoveError.value}
            dim={!eStopOnMoveError.consistent}
            toggleAction={() => dispatch(
              settingToggle("param_e_stop_on_mov_err", sourceFwConfig))} />
        </Col>
      </Row>
      <NumericMCUInputGroup
        name={t("Max Speed (steps/s)")}
        tooltip={ToolTips.MAX_SPEED}
        x={"movement_max_spd_x"}
        y={"movement_max_spd_y"}
        z={"movement_max_spd_z"}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      {(minFwVersionCheck(firmwareVersion, "5.0.5") || isValidFwConfig) &&
        <NumericMCUInputGroup
          name={t("Homing Speed (steps/s)")}
          tooltip={ToolTips.HOME_SPEED}
          x={"movement_home_spd_x"}
          y={"movement_home_spd_y"}
          z={"movement_home_spd_z"}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch} />}
      <NumericMCUInputGroup
        name={t("Minimum Speed (steps/s)")}
        tooltip={ToolTips.MIN_SPEED}
        x={"movement_min_spd_x"}
        y={"movement_min_spd_y"}
        z={"movement_min_spd_z"}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <NumericMCUInputGroup
        name={t("Accelerate for (steps)")}
        tooltip={ToolTips.ACCELERATE_FOR}
        x={"movement_steps_acc_dec_x"}
        y={"movement_steps_acc_dec_y"}
        z={"movement_steps_acc_dec_z"}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <StepsPerMmSettings
        dispatch={dispatch}
        firmwareVersion={firmwareVersion}
        controlPanelState={controlPanelState}
        sourceFwConfig={sourceFwConfig}
        sourceFbosConfig={sourceFbosConfig}
        isValidFwConfig={isValidFwConfig} />
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
      <Row>
        <Col xs={6}>
          <label>
            {t("Enable 2nd X Motor")}
          </label>
          <SpacePanelToolTip tooltip={ToolTips.ENABLE_X2_MOTOR} />
        </Col>
        <Col xs={2} className={"centered-button-div"}>
          <ToggleButton
            toggleValue={enable2ndXMotor.value}
            dim={!enable2ndXMotor.consistent}
            toggleAction={() => dispatch(
              settingToggle("movement_secondary_motor_x", sourceFwConfig))} />
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <label>
            {t("Invert 2nd X Motor")}
          </label>
          <SpacePanelToolTip tooltip={ToolTips.INVERT_MOTORS} />
        </Col>
        <Col xs={2} className={"centered-button-div"}>
          <ToggleButton
            grayscale={!enable2ndXMotor.value}
            toggleValue={invert2ndXMotor.value}
            dim={!invert2ndXMotor.consistent}
            toggleAction={() => dispatch(
              settingToggle("movement_secondary_motor_invert_x", sourceFwConfig))} />
        </Col>
      </Row>
    </Collapse>
  </section>;
}
