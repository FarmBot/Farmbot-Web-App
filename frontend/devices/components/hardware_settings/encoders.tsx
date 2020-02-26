import * as React from "react";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips, DeviceSetting } from "../../../constants";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { EncodersProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { hasEncoders } from "../firmware_hardware_support";
import { Highlight } from "../maybe_highlight";

export function Encoders(props: EncodersProps) {

  const { encoders } = props.controlPanelState;
  const { dispatch, sourceFwConfig, firmwareHardware } = props;

  const encodersDisabled = {
    x: !sourceFwConfig("encoder_enabled_x").value,
    y: !sourceFwConfig("encoder_enabled_y").value,
    z: !sourceFwConfig("encoder_enabled_z").value
  };
  const showEncoders = hasEncoders(firmwareHardware);

  return <Highlight className={"section"}
    settingName={DeviceSetting.encoders}>
    <Header
      expanded={encoders}
      title={!showEncoders
        ? DeviceSetting.stallDetection
        : DeviceSetting.encoders}
      panel={"encoders"}
      dispatch={dispatch} />
    <Collapse isOpen={!!encoders}>
      <BooleanMCUInputGroup
        label={!showEncoders
          ? DeviceSetting.enableStallDetection
          : DeviceSetting.enableEncoders}
        tooltip={!showEncoders
          ? ToolTips.ENABLE_STALL_DETECTION
          : ToolTips.ENABLE_ENCODERS}
        x={"encoder_enabled_x"}
        y={"encoder_enabled_y"}
        z={"encoder_enabled_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      {!showEncoders &&
        <NumericMCUInputGroup
          label={DeviceSetting.stallSensitivity}
          tooltip={ToolTips.STALL_SENSITIVITY}
          x={"movement_stall_sensitivity_x"}
          y={"movement_stall_sensitivity_y"}
          z={"movement_stall_sensitivity_z"}
          gray={encodersDisabled}
          dispatch={dispatch}
          sourceFwConfig={sourceFwConfig} />}
      {showEncoders &&
        <BooleanMCUInputGroup
          label={DeviceSetting.useEncodersForPositioning}
          tooltip={ToolTips.ENCODER_POSITIONING}
          x={"encoder_use_for_pos_x"}
          y={"encoder_use_for_pos_y"}
          z={"encoder_use_for_pos_z"}
          grayscale={encodersDisabled}
          dispatch={dispatch}
          sourceFwConfig={sourceFwConfig} />}
      {showEncoders &&
        <BooleanMCUInputGroup
          label={DeviceSetting.invertEncoders}
          tooltip={ToolTips.INVERT_ENCODERS}
          x={"encoder_invert_x"}
          y={"encoder_invert_y"}
          z={"encoder_invert_z"}
          grayscale={encodersDisabled}
          dispatch={dispatch}
          sourceFwConfig={sourceFwConfig} />}
      <NumericMCUInputGroup
        label={DeviceSetting.maxMissedSteps}
        tooltip={!showEncoders
          ? ToolTips.MAX_MISSED_STEPS_STALL_DETECTION
          : ToolTips.MAX_MISSED_STEPS_ENCODERS}
        x={"encoder_missed_steps_max_x"}
        y={"encoder_missed_steps_max_y"}
        z={"encoder_missed_steps_max_z"}
        gray={encodersDisabled}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      <NumericMCUInputGroup
        label={DeviceSetting.missedStepDecay}
        tooltip={ToolTips.MISSED_STEP_DECAY}
        x={"encoder_missed_steps_decay_x"}
        y={"encoder_missed_steps_decay_y"}
        z={"encoder_missed_steps_decay_z"}
        gray={encodersDisabled}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
      {showEncoders &&
        <NumericMCUInputGroup
          label={DeviceSetting.encoderScaling}
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
  </Highlight>;
}
