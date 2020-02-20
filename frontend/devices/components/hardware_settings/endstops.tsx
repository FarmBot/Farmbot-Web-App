import * as React from "react";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips, DeviceSetting } from "../../../constants";
import { EndStopsProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { Highlight } from "../maybe_highlight";

export function EndStops(props: EndStopsProps) {

  const { endstops } = props.controlPanelState;
  const { dispatch, sourceFwConfig } = props;

  return <Highlight className={"section"}
    settingName={DeviceSetting.endstops}>
    <Header
      expanded={endstops}
      title={DeviceSetting.endstops}
      panel={"endstops"}
      dispatch={dispatch} />
    <Collapse isOpen={!!endstops}>
      <BooleanMCUInputGroup
        label={DeviceSetting.enableEndstops}
        tooltip={ToolTips.ENABLE_ENDSTOPS}
        x={"movement_enable_endpoints_x"}
        y={"movement_enable_endpoints_y"}
        z={"movement_enable_endpoints_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        label={DeviceSetting.swapEndstops}
        tooltip={ToolTips.SWAP_ENDPOINTS}
        x={"movement_invert_endpoints_x"}
        y={"movement_invert_endpoints_y"}
        z={"movement_invert_endpoints_z"}
        grayscale={{
          x: !sourceFwConfig("movement_enable_endpoints_x").value,
          y: !sourceFwConfig("movement_enable_endpoints_y").value,
          z: !sourceFwConfig("movement_enable_endpoints_z").value
        }}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        label={DeviceSetting.invertEndstops}
        tooltip={ToolTips.INVERT_ENDPOINTS}
        x={"movement_invert_2_endpoints_x"}
        y={"movement_invert_2_endpoints_y"}
        z={"movement_invert_2_endpoints_z"}
        grayscale={{
          x: !sourceFwConfig("movement_enable_endpoints_x").value,
          y: !sourceFwConfig("movement_enable_endpoints_y").value,
          z: !sourceFwConfig("movement_enable_endpoints_z").value
        }}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
    </Collapse>
  </Highlight>;
}
