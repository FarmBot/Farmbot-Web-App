import * as React from "react";
import { PinGuardMCUInputGroup } from "./pin_guard_input_group";
import { PinGuardProps } from "./interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { DeviceSetting } from "../../constants";
import { Highlight } from "../maybe_highlight";

export function PinGuard(props: PinGuardProps) {

  const { pin_guard } = props.controlPanelState;
  const { dispatch, sourceFwConfig, resources, arduinoBusy } = props;
  return <Highlight className={"section"}
    settingName={DeviceSetting.pinGuard}>
    <Header
      expanded={pin_guard}
      title={DeviceSetting.pinGuard}
      panel={"pin_guard"}
      dispatch={dispatch} />
    <Collapse isOpen={!!pin_guard}>
      <PinGuardMCUInputGroup
        label={DeviceSetting.pinGuard1}
        pinNumKey={"pin_guard_1_pin_nr"}
        timeoutKey={"pin_guard_1_time_out"}
        activeStateKey={"pin_guard_1_active_state"}
        dispatch={dispatch}
        resources={resources}
        disabled={arduinoBusy}
        sourceFwConfig={sourceFwConfig} />
      <PinGuardMCUInputGroup
        label={DeviceSetting.pinGuard2}
        pinNumKey={"pin_guard_2_pin_nr"}
        timeoutKey={"pin_guard_2_time_out"}
        activeStateKey={"pin_guard_2_active_state"}
        dispatch={dispatch}
        resources={resources}
        disabled={arduinoBusy}
        sourceFwConfig={sourceFwConfig} />
      <PinGuardMCUInputGroup
        label={DeviceSetting.pinGuard3}
        pinNumKey={"pin_guard_3_pin_nr"}
        timeoutKey={"pin_guard_3_time_out"}
        activeStateKey={"pin_guard_3_active_state"}
        dispatch={dispatch}
        resources={resources}
        disabled={arduinoBusy}
        sourceFwConfig={sourceFwConfig} />
      <PinGuardMCUInputGroup
        label={DeviceSetting.pinGuard4}
        pinNumKey={"pin_guard_4_pin_nr"}
        timeoutKey={"pin_guard_4_time_out"}
        activeStateKey={"pin_guard_4_active_state"}
        dispatch={dispatch}
        resources={resources}
        disabled={arduinoBusy}
        sourceFwConfig={sourceFwConfig} />
      <PinGuardMCUInputGroup
        label={DeviceSetting.pinGuard5}
        pinNumKey={"pin_guard_5_pin_nr"}
        timeoutKey={"pin_guard_5_time_out"}
        activeStateKey={"pin_guard_5_active_state"}
        dispatch={dispatch}
        resources={resources}
        disabled={arduinoBusy}
        sourceFwConfig={sourceFwConfig} />
    </Collapse>
  </Highlight>;
}
