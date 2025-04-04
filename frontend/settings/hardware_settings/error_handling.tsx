import React from "react";
import { NumericMCUInputGroup } from "./numeric_mcu_input_group";
import { ToolTips, DeviceSetting } from "../../constants";
import { ErrorHandlingProps } from "./interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { McuInputBox } from "./mcu_input_box";
import { settingToggle } from "../../devices/actions";
import { SingleSettingRow } from "./single_setting_row";
import { ToggleButton } from "../../ui";
import { Highlight } from "../maybe_highlight";
import { SpacePanelHeader } from "./space_panel_header";
import { t } from "../../i18next_wrapper";
import {
  getDefaultFwConfigValue, getModifiedClassName,
} from "./default_values";
import { calculateScale } from "./motors";

export const ErrorHandling = (props: ErrorHandlingProps) => {

  const { error_handling } = props.settingsPanelState;
  const {
    dispatch, sourceFwConfig, arduinoBusy, firmwareHardware, showAdvanced,
  } = props;
  const eStopOnMoveError = sourceFwConfig("param_e_stop_on_mov_err");
  const scale = calculateScale(sourceFwConfig);

  const commonProps = {
    dispatch,
    sourceFwConfig,
    disabled: arduinoBusy,
    firmwareHardware,
    showAdvanced,
  };

  const getDefault = getDefaultFwConfigValue(firmwareHardware);

  return <Highlight className={"section"}
    settingName={DeviceSetting.errorHandling}>
    <Header
      expanded={error_handling}
      title={DeviceSetting.errorHandling}
      panel={"error_handling"}
      dispatch={dispatch} />
    <Collapse isOpen={!!error_handling}>
      <SingleSettingRow settingType="input"
        label={DeviceSetting.maxRetries}
        tooltip={t(ToolTips.MAX_MOVEMENT_RETRIES, {
          retries: getDefault("param_mov_nr_retry")
        })}>
        <McuInputBox
          setting={"param_mov_nr_retry"}
          sourceFwConfig={sourceFwConfig}
          firmwareHardware={firmwareHardware}
          disabled={arduinoBusy}
          dispatch={dispatch} />
      </SingleSettingRow>
      <SingleSettingRow settingType="button"
        label={DeviceSetting.estopOnMovementError}
        tooltip={t(ToolTips.E_STOP_ON_MOV_ERR, {
          eStopOnError: getDefault("param_e_stop_on_mov_err")
        })}>
        <ToggleButton dispatch={dispatch}
          toggleValue={eStopOnMoveError.value}
          dim={!eStopOnMoveError.consistent}
          className={getModifiedClassName(
            "param_e_stop_on_mov_err",
            eStopOnMoveError.value,
            firmwareHardware)}
          disabled={arduinoBusy}
          toggleAction={() => dispatch(
            settingToggle("param_e_stop_on_mov_err", sourceFwConfig))} />
      </SingleSettingRow>
      <SpacePanelHeader />
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.timeoutAfter}
        tooltip={ToolTips.TIMEOUT_AFTER}
        advanced={true}
        x={"movement_timeout_x"}
        y={"movement_timeout_y"}
        z={"movement_timeout_z"} />
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.calibrationRetries}
        tooltip={ToolTips.CALIBRATION_RETRIES}
        x={"movement_calibration_retry_x"}
        y={"movement_calibration_retry_y"}
        z={"movement_calibration_retry_z"} />
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.calibrationTotalRetries}
        tooltip={ToolTips.CALIBRATION_TOTAL_RETRIES}
        advanced={true}
        x={"movement_calibration_retry_total_x"}
        y={"movement_calibration_retry_total_y"}
        z={"movement_calibration_retry_total_z"} />
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.calibrationRetryResetDistance}
        tooltip={ToolTips.CALIBRATION_RETRY_RESET_DISTANCE}
        advanced={true}
        x={"movement_calibration_deadzone_x"}
        y={"movement_calibration_deadzone_y"}
        z={"movement_calibration_deadzone_z"}
        xScale={scale.x}
        yScale={scale.y}
        zScale={scale.z} />
    </Collapse>
  </Highlight>;
};
