import * as React from "react";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips } from "../../../constants";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { EncodersProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { t } from "../../../i18next_wrapper";
import { isExpressBoard } from "../firmware_hardware_support";

export function Encoders(props: EncodersProps) {

  const { encoders } = props.controlPanelState;
  const { dispatch, sourceFwConfig, firmwareHardware } = props;

  const encodersDisabled = {
    x: !sourceFwConfig("encoder_enabled_x").value,
    y: !sourceFwConfig("encoder_enabled_y").value,
    z: !sourceFwConfig("encoder_enabled_z").value
  };
  const isExpress = isExpressBoard(firmwareHardware);

  return <section>
    <Header
      expanded={encoders}
      title={isExpress
        ? t("Stall Detection")
        : t("Encoders")}
      name={"encoders"}
      dispatch={dispatch} />
    <Collapse isOpen={!!encoders}>
      <BooleanMCUInputGroup
        name={isExpress
          ? t("Enable Stall Detection")
          : t("Enable Encoders")}
        tooltip={isExpress
          ? ToolTips.ENABLE_STALL_DETECTION
          : ToolTips.ENABLE_ENCODERS}
        x={"encoder_enabled_x"}
        y={"encoder_enabled_y"}
        z={"encoder_enabled_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      {isExpress &&
        <NumericMCUInputGroup
          name={t("Stall Sensitivity")}
          tooltip={ToolTips.STALL_SENSITIVITY}
          x={"movement_stall_sensitivity_x"}
          y={"movement_stall_sensitivity_y"}
          z={"movement_stall_sensitivity_z"}
          gray={encodersDisabled}
          dispatch={dispatch}
          sourceFwConfig={sourceFwConfig} />}
      {!isExpress &&
        <BooleanMCUInputGroup
          name={t("Use Encoders for Positioning")}
          tooltip={ToolTips.ENCODER_POSITIONING}
          x={"encoder_use_for_pos_x"}
          y={"encoder_use_for_pos_y"}
          z={"encoder_use_for_pos_z"}
          grayscale={encodersDisabled}
          dispatch={dispatch}
          sourceFwConfig={sourceFwConfig} />}
      {!isExpress &&
        <BooleanMCUInputGroup
          name={t("Invert Encoders")}
          tooltip={ToolTips.INVERT_ENCODERS}
          x={"encoder_invert_x"}
          y={"encoder_invert_y"}
          z={"encoder_invert_z"}
          grayscale={encodersDisabled}
          dispatch={dispatch}
          sourceFwConfig={sourceFwConfig} />}
      <NumericMCUInputGroup
        name={t("Max Missed Steps")}
        tooltip={isExpress
          ? ToolTips.MAX_MISSED_STEPS_STALL_DETECTION
          : ToolTips.MAX_MISSED_STEPS_ENCODERS}
        x={"encoder_missed_steps_max_x"}
        y={"encoder_missed_steps_max_y"}
        z={"encoder_missed_steps_max_z"}
        gray={encodersDisabled}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <NumericMCUInputGroup
        name={t("Missed Step Decay")}
        tooltip={ToolTips.MISSED_STEP_DECAY}
        x={"encoder_missed_steps_decay_x"}
        y={"encoder_missed_steps_decay_y"}
        z={"encoder_missed_steps_decay_z"}
        gray={encodersDisabled}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      {!isExpress &&
        <NumericMCUInputGroup
          name={t("Encoder Scaling")}
          tooltip={ToolTips.ENCODER_SCALING}
          x={"encoder_scaling_x"}
          y={"encoder_scaling_y"}
          z={"encoder_scaling_z"}
          xScale={sourceFwConfig("movement_microsteps_x").value}
          yScale={sourceFwConfig("movement_microsteps_y").value}
          zScale={sourceFwConfig("movement_microsteps_z").value}
          intSize={"long"}
          gray={encodersDisabled}
          sourceFwConfig={sourceFwConfig}
          dispatch={dispatch} />}
    </Collapse>
  </section>;
}
