import * as React from "react";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips } from "../../../constants";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { EncodersProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { Feature } from "../../interfaces";
import { t } from "../../../i18next_wrapper";

export function EncodersAndEndStops(props: EncodersProps) {

  const { encoders_and_endstops } = props.controlPanelState;
  const { dispatch, sourceFwConfig, shouldDisplay } = props;

  const encodersDisabled = {
    x: !sourceFwConfig("encoder_enabled_x").value,
    y: !sourceFwConfig("encoder_enabled_y").value,
    z: !sourceFwConfig("encoder_enabled_z").value
  };

  return <section>
    <Header
      expanded={encoders_and_endstops}
      title={t("Encoders and Endstops")}
      name={"encoders_and_endstops"}
      dispatch={dispatch} />
    <Collapse isOpen={!!encoders_and_endstops}>
      <BooleanMCUInputGroup
        name={t("Enable Encoders")}
        tooltip={ToolTips.ENABLE_ENCODERS}
        x={"encoder_enabled_x"}
        y={"encoder_enabled_y"}
        z={"encoder_enabled_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        name={t("Use Encoders for Positioning")}
        tooltip={ToolTips.ENCODER_POSITIONING}
        x={"encoder_use_for_pos_x"}
        y={"encoder_use_for_pos_y"}
        z={"encoder_use_for_pos_z"}
        grayscale={encodersDisabled}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        name={t("Invert Encoders")}
        tooltip={ToolTips.INVERT_ENCODERS}
        x={"encoder_invert_x"}
        y={"encoder_invert_y"}
        z={"encoder_invert_z"}
        grayscale={encodersDisabled}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <NumericMCUInputGroup
        name={t("Max Missed Steps")}
        tooltip={ToolTips.MAX_MISSED_STEPS}
        x={"encoder_missed_steps_max_x"}
        y={"encoder_missed_steps_max_y"}
        z={"encoder_missed_steps_max_z"}
        gray={encodersDisabled}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <NumericMCUInputGroup
        name={t("Encoder Missed Step Decay")}
        tooltip={ToolTips.ENCODER_MISSED_STEP_DECAY}
        x={"encoder_missed_steps_decay_x"}
        y={"encoder_missed_steps_decay_y"}
        z={"encoder_missed_steps_decay_z"}
        gray={encodersDisabled}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <NumericMCUInputGroup
        name={t("Encoder Scaling")}
        tooltip={ToolTips.ENCODER_SCALING}
        x={"encoder_scaling_x"}
        y={"encoder_scaling_y"}
        z={"encoder_scaling_z"}
        xScale={sourceFwConfig("movement_microsteps_x").value}
        yScale={sourceFwConfig("movement_microsteps_y").value}
        zScale={sourceFwConfig("movement_microsteps_z").value}
        intSize={shouldDisplay(Feature.long_scaling_factor) ? "long" : "short"}
        gray={encodersDisabled}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <BooleanMCUInputGroup
        name={t("Enable Endstops")}
        tooltip={ToolTips.ENABLE_ENDSTOPS}
        x={"movement_enable_endpoints_x"}
        y={"movement_enable_endpoints_y"}
        z={"movement_enable_endpoints_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        name={t("Swap Endstops")}
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
        name={t("Invert Endstops")}
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
  </section>;
}
