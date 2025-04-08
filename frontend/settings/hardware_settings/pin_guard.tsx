import React from "react";
import { PinGuardMCUInputGroup } from "./pin_guard_input_group";
import { PinGuardProps } from "./interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { DeviceSetting, ToolTips } from "../../constants";
import { Highlight } from "../maybe_highlight";
import { Help, Row } from "../../ui";
import { t } from "../../i18next_wrapper";

export const PinGuard = (props: PinGuardProps) => {
  const commonProps = {
    dispatch: props.dispatch,
    resources: props.resources,
    disabled: props.arduinoBusy,
    sourceFwConfig: props.sourceFwConfig,
    firmwareHardware: props.firmwareHardware,
  };
  return <Highlight className={"section"}
    settingName={DeviceSetting.pinGuard}>
    <Header
      expanded={props.settingsPanelState.pin_guard}
      title={DeviceSetting.pinGuard}
      panel={"pin_guard"}
      dispatch={props.dispatch} />
    <Collapse isOpen={!!props.settingsPanelState.pin_guard}>
      <Highlight settingName={DeviceSetting.pinGuardLabels}>
        <Row className="pin-guard-grid">
          <div>
            <label>
              {t("Pin")}
            </label>
            <Help text={ToolTips.PIN_GUARD_PIN_NUMBER} />
          </div>
          <label>
            {t("Timeout (sec)")}
          </label>
          <label>
            {t("To State")}
          </label>
        </Row>
      </Highlight>
      <PinGuardMCUInputGroup {...commonProps}
        label={DeviceSetting.pinGuard1}
        pinNumKey={"pin_guard_1_pin_nr"}
        timeoutKey={"pin_guard_1_time_out"}
        activeStateKey={"pin_guard_1_active_state"} />
      <PinGuardMCUInputGroup {...commonProps}
        label={DeviceSetting.pinGuard2}
        pinNumKey={"pin_guard_2_pin_nr"}
        timeoutKey={"pin_guard_2_time_out"}
        activeStateKey={"pin_guard_2_active_state"} />
      <PinGuardMCUInputGroup {...commonProps}
        label={DeviceSetting.pinGuard3}
        pinNumKey={"pin_guard_3_pin_nr"}
        timeoutKey={"pin_guard_3_time_out"}
        activeStateKey={"pin_guard_3_active_state"} />
      <PinGuardMCUInputGroup {...commonProps}
        label={DeviceSetting.pinGuard4}
        pinNumKey={"pin_guard_4_pin_nr"}
        timeoutKey={"pin_guard_4_time_out"}
        activeStateKey={"pin_guard_4_active_state"} />
      <PinGuardMCUInputGroup {...commonProps}
        label={DeviceSetting.pinGuard5}
        pinNumKey={"pin_guard_5_pin_nr"}
        timeoutKey={"pin_guard_5_time_out"}
        activeStateKey={"pin_guard_5_active_state"} />
    </Collapse>
  </Highlight>;
};
