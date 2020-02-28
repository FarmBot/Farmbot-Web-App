import * as React from "react";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { ToolTips, DeviceSetting } from "../../../constants";
import { ErrorHandlingProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { McuInputBox } from "../mcu_input_box";
import { settingToggle } from "../../actions";
import { SingleSettingRow } from "./single_setting_row";
import { ToggleButton } from "../../../controls/toggle_button";
import { Highlight } from "../maybe_highlight";
import { SpacePanelHeader } from "./space_panel_header";

export function ErrorHandling(props: ErrorHandlingProps) {

  const { error_handling } = props.controlPanelState;
  const { dispatch, sourceFwConfig } = props;
  const eStopOnMoveError = sourceFwConfig("param_e_stop_on_mov_err");

  return <Highlight className={"section"}
    settingName={DeviceSetting.errorHandling}>
    <Header
      expanded={error_handling}
      title={DeviceSetting.errorHandling}
      panel={"error_handling"}
      dispatch={dispatch} />
    <Collapse isOpen={!!error_handling}>
      <div className="label-headings">
        <SpacePanelHeader />
      </div>
      <NumericMCUInputGroup
        label={DeviceSetting.timeoutAfter}
        tooltip={ToolTips.TIMEOUT_AFTER}
        x={"movement_timeout_x"}
        y={"movement_timeout_y"}
        z={"movement_timeout_z"}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <SingleSettingRow settingType="input"
        label={DeviceSetting.maxRetries}
        tooltip={ToolTips.MAX_MOVEMENT_RETRIES}>
        <McuInputBox
          setting="param_mov_nr_retry"
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch} />
      </SingleSettingRow>
      <SingleSettingRow settingType="button"
        label={DeviceSetting.estopOnMovementError}
        tooltip={ToolTips.E_STOP_ON_MOV_ERR}>
        <ToggleButton
          toggleValue={eStopOnMoveError.value}
          dim={!eStopOnMoveError.consistent}
          toggleAction={() => dispatch(
            settingToggle("param_e_stop_on_mov_err", sourceFwConfig))} />
      </SingleSettingRow>
    </Collapse>
  </Highlight>;
}
