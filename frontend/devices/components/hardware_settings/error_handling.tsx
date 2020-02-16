import * as React from "react";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { ToolTips } from "../../../constants";
import { ErrorHandlingProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { t } from "../../../i18next_wrapper";
import { McuInputBox } from "../mcu_input_box";
import { settingToggle } from "../../actions";
import { SingleSettingRow } from "./single_setting_row";
import { ToggleButton } from "../../../controls/toggle_button";

export function ErrorHandling(props: ErrorHandlingProps) {

  const { error_handling } = props.controlPanelState;
  const { dispatch, sourceFwConfig } = props;
  const eStopOnMoveError = sourceFwConfig("param_e_stop_on_mov_err");

  return <section>
    <Header
      expanded={error_handling}
      title={"Error Handling"}
      name={"error_handling"}
      dispatch={dispatch} />
    <Collapse isOpen={!!error_handling}>
      <NumericMCUInputGroup
        name={t("Timeout after (seconds)")}
        tooltip={ToolTips.TIMEOUT_AFTER}
        x={"movement_timeout_x"}
        y={"movement_timeout_y"}
        z={"movement_timeout_z"}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
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
    </Collapse>
  </section>;
}
