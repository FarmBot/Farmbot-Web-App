import * as React from "react";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips, DeviceSetting } from "../../../constants";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { CalibrationRow } from "./calibration_row";
import { disabledAxisMap } from "../axis_tracking_status";
import { HomingAndCalibrationProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { t } from "../../../i18next_wrapper";
import { calculateScale } from "./motors";
import { hasEncoders } from "../firmware_hardware_support";
import { getDevice } from "../../../device";
import { commandErr } from "../../actions";
import { CONFIG_DEFAULTS } from "farmbot/dist/config";
import { Highlight } from "../maybe_highlight";

export function HomingAndCalibration(props: HomingAndCalibrationProps) {

  const {
    dispatch, bot, sourceFwConfig, firmwareConfig, botDisconnected,
    firmwareHardware
  } = props;
  const hardware = firmwareConfig ? firmwareConfig : bot.hardware.mcu_params;
  const { homing_and_calibration } = props.bot.controlPanelState;

  /**
   * Tells us if X/Y/Z have a means of checking their position.
   * FARMBOT WILL CRASH INTO WALLS IF THIS IS WRONG! BE CAREFUL.
   */
  const disabled = disabledAxisMap(hardware);

  const scale = calculateScale(sourceFwConfig);

  return <Highlight className={"section"}
    settingName={DeviceSetting.homingAndCalibration}>
    <Header
      title={DeviceSetting.homingAndCalibration}
      panel={"homing_and_calibration"}
      dispatch={dispatch}
      expanded={homing_and_calibration} />
    <Collapse isOpen={!!homing_and_calibration}>
      <CalibrationRow
        type={"find_home"}
        title={DeviceSetting.homing}
        axisTitle={t("FIND HOME")}
        toolTip={!hasEncoders(firmwareHardware)
          ? ToolTips.HOMING_STALL_DETECTION
          : ToolTips.HOMING_ENCODERS}
        action={axis => getDevice()
          .findHome({ speed: CONFIG_DEFAULTS.speed, axis })
          .catch(commandErr("'Find Home' request"))}
        hardware={hardware}
        botDisconnected={botDisconnected} />
      <CalibrationRow
        type={"calibrate"}
        title={DeviceSetting.calibration}
        axisTitle={t("CALIBRATE")}
        toolTip={!hasEncoders(firmwareHardware)
          ? ToolTips.CALIBRATION_STALL_DETECTION
          : ToolTips.CALIBRATION_ENCODERS}
        action={axis => getDevice().calibrate({ axis })
          .catch(commandErr("Calibration"))}
        hardware={hardware}
        botDisconnected={botDisconnected} />
      <CalibrationRow
        type={"zero"}
        title={DeviceSetting.setZeroPosition}
        axisTitle={t("ZERO")}
        toolTip={ToolTips.SET_ZERO_POSITION}
        action={axis => getDevice().setZero(axis)
          .catch(commandErr("Zeroing"))}
        hardware={hardware}
        botDisconnected={botDisconnected} />
      <BooleanMCUInputGroup
        label={DeviceSetting.findHomeOnBoot}
        tooltip={!hasEncoders(firmwareHardware)
          ? ToolTips.FIND_HOME_ON_BOOT_STALL_DETECTION
          : ToolTips.FIND_HOME_ON_BOOT_ENCODERS}
        disable={disabled}
        x={"movement_home_at_boot_x"}
        y={"movement_home_at_boot_y"}
        z={"movement_home_at_boot_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig}
        caution={true} />
      <BooleanMCUInputGroup
        label={DeviceSetting.stopAtHome}
        tooltip={ToolTips.STOP_AT_HOME}
        x={"movement_stop_at_home_x"}
        y={"movement_stop_at_home_y"}
        z={"movement_stop_at_home_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        label={DeviceSetting.stopAtMax}
        tooltip={ToolTips.STOP_AT_MAX}
        x={"movement_stop_at_max_x"}
        y={"movement_stop_at_max_y"}
        z={"movement_stop_at_max_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        label={DeviceSetting.negativeCoordinatesOnly}
        tooltip={ToolTips.NEGATIVE_COORDINATES_ONLY}
        x={"movement_home_up_x"}
        y={"movement_home_up_y"}
        z={"movement_home_up_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <NumericMCUInputGroup
        label={DeviceSetting.axisLength}
        tooltip={ToolTips.LENGTH}
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
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch}
        intSize={"long"} />
    </Collapse>
  </Highlight>;
}
