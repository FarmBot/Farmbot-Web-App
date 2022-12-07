import React from "react";
import { t } from "../../i18next_wrapper";
import { BooleanMCUInputGroup } from "./boolean_mcu_input_group";
import { ToolTips, DeviceSetting } from "../../constants";
import { NumericMCUInputGroup } from "./numeric_mcu_input_group";
import { CalibrationRow } from "./calibration_row";
import { disabledAxisMap } from "./axis_tracking_status";
import { AxisSettingsProps } from "./interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { calculateScale } from "./motors";
import { hasEncoders } from "../firmware/firmware_hardware_support";
import { findAxisLength, findHome, setHome } from "../../devices/actions";
import { Highlight } from "../maybe_highlight";
import { SpacePanelHeader } from "./space_panel_header";
import {
  settingRequiredLabel, encodersOrLimitSwitchesRequired,
} from "./encoders_or_stall_detection";
import {
  GantryHeight, SafeHeight, SoilHeight,
} from "../fbos_settings/z_height_inputs";
import { setAxisLength } from "../../controls/move/bot_position_rows";
import { validBotLocationData } from "../../util/location";

export function AxisSettings(props: AxisSettingsProps) {

  const {
    dispatch, bot, sourceFwConfig, firmwareConfig, botOnline,
    firmwareHardware, showAdvanced,
  } = props;
  const mcuParams = firmwareConfig ? firmwareConfig : bot.hardware.mcu_params;
  const { axis_settings } = props.settingsPanelState;
  const { busy, locked } = bot.hardware.informational_settings;

  /**
   * Tells us if X/Y/Z have a means of checking their position.
   * FARMBOT WILL CRASH INTO WALLS IF THIS IS WRONG! BE CAREFUL.
   */
  const disabled = disabledAxisMap(mcuParams);

  const axisLengthDisabled = {
    x: !sourceFwConfig("movement_axis_nr_steps_x").value,
    y: !sourceFwConfig("movement_axis_nr_steps_y").value,
    z: !sourceFwConfig("movement_axis_nr_steps_z").value
  };

  const showEncoders = hasEncoders(firmwareHardware);

  const scale = calculateScale(sourceFwConfig);
  const botPosition = validBotLocationData(bot.hardware.location_data).position;

  const commonProps = {
    dispatch,
    sourceFwConfig,
    disabled: busy,
    firmwareHardware,
    showAdvanced,
  };

  return <Highlight className={"section"}
    settingName={DeviceSetting.axisSettings}>
    <Header
      title={DeviceSetting.axisSettings}
      panel={"axis_settings"}
      dispatch={dispatch}
      expanded={axis_settings} />
    <Collapse isOpen={!!axis_settings}>
      <SpacePanelHeader />
      <CalibrationRow
        type={"find_home"}
        title={DeviceSetting.findHome}
        axisTitle={t("FIND HOME")}
        toolTip={!showEncoders
          ? ToolTips.FIND_HOME_STALL_DETECTION
          : ToolTips.FIND_HOME_ENCODERS}
        action={findHome}
        mcuParams={mcuParams}
        arduinoBusy={busy}
        locked={locked}
        botOnline={botOnline} />
      <CalibrationRow
        type={"zero"}
        title={DeviceSetting.setHome}
        axisTitle={t("SET HOME")}
        toolTip={ToolTips.SET_HOME_POSITION}
        action={setHome}
        mcuParams={mcuParams}
        arduinoBusy={busy}
        botOnline={botOnline} />
      <BooleanMCUInputGroup {...commonProps}
        label={DeviceSetting.findHomeOnBoot}
        tooltip={!showEncoders
          ? ToolTips.FIND_HOME_ON_BOOT_STALL_DETECTION
          : ToolTips.FIND_HOME_ON_BOOT_ENCODERS}
        grayscale={disabled}
        disabledBy={encodersOrLimitSwitchesRequired(showEncoders)}
        x={"movement_home_at_boot_x"}
        y={"movement_home_at_boot_y"}
        z={"movement_home_at_boot_z"}
        advanced={true}
        caution={true} />
      <BooleanMCUInputGroup {...commonProps}
        label={DeviceSetting.stopAtHome}
        tooltip={ToolTips.STOP_AT_HOME}
        advanced={true}
        x={"movement_stop_at_home_x"}
        y={"movement_stop_at_home_y"}
        z={"movement_stop_at_home_z"} />
      <BooleanMCUInputGroup {...commonProps}
        label={DeviceSetting.stopAtMax}
        tooltip={ToolTips.STOP_AT_MAX}
        grayscale={axisLengthDisabled}
        disabledBy={settingRequiredLabel([DeviceSetting.axisLength])}
        advanced={true}
        x={"movement_stop_at_max_x"}
        y={"movement_stop_at_max_y"}
        z={"movement_stop_at_max_z"} />
      <BooleanMCUInputGroup {...commonProps}
        label={DeviceSetting.negativeCoordinatesOnly}
        tooltip={ToolTips.NEGATIVE_COORDINATES_ONLY}
        advanced={true}
        x={"movement_home_up_x"}
        y={"movement_home_up_y"}
        z={"movement_home_up_z"} />
      <CalibrationRow
        type={"calibrate"}
        title={DeviceSetting.findAxisLength}
        axisTitle={t("FIND LENGTH")}
        toolTip={!showEncoders
          ? ToolTips.FIND_LENGTH_STALL_DETECTION
          : ToolTips.FIND_LENGTH_ENCODERS}
        action={findAxisLength}
        mcuParams={mcuParams}
        arduinoBusy={busy}
        locked={locked}
        botOnline={botOnline} />
      <CalibrationRow
        type={"zero"}
        title={DeviceSetting.setAxisLength}
        axisTitle={t("SET LENGTH")}
        toolTip={ToolTips.SET_AXIS_LENGTH}
        action={axis => axis != "all"
          && setAxisLength({ axis, dispatch, botPosition, sourceFwConfig })()}
        mcuParams={
          { encoder_enabled_x: 1, encoder_enabled_y: 1, encoder_enabled_z: 1 }}
        arduinoBusy={false}
        locked={false}
        botOnline={true} />
      <NumericMCUInputGroup {...commonProps}
        label={DeviceSetting.axisLength}
        tooltip={ToolTips.AXIS_LENGTH}
        x={"movement_axis_nr_steps_x"}
        y={"movement_axis_nr_steps_y"}
        z={"movement_axis_nr_steps_z"}
        xScale={scale.x}
        yScale={scale.y}
        zScale={scale.z}
        gray={{
          x: !sourceFwConfig("movement_stop_at_max_x").value,
          y: !sourceFwConfig("movement_stop_at_max_y").value,
          z: !sourceFwConfig("movement_stop_at_max_z").value,
        }}
        warnMin={{
          x: 1000,
          y: 500,
          z: 250,
        }}
        disabledBy={settingRequiredLabel([DeviceSetting.stopAtMax])}
        intSize={"long"} />
      <GantryHeight
        dispatch={dispatch}
        sourceFbosConfig={props.sourceFbosConfig} />
      <SafeHeight
        dispatch={dispatch}
        sourceFbosConfig={props.sourceFbosConfig} />
      <SoilHeight
        dispatch={dispatch}
        sourceFbosConfig={props.sourceFbosConfig} />
    </Collapse>
  </Highlight>;
}
