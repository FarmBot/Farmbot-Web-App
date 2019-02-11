import * as React from "react";
import { t } from "i18next";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips } from "../../../constants";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { HomingRow } from "./homing_row";
import { CalibrationRow } from "./calibration_row";
import { ZeroRow } from "./zero_row";
import { disabledAxisMap } from "../axis_tracking_status";
import { HomingAndCalibrationProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { minFwVersionCheck } from "../../../util";

export function HomingAndCalibration(props: HomingAndCalibrationProps) {

  const { dispatch, bot, sourceFwConfig, firmwareConfig, botDisconnected
  } = props;
  const hardware = firmwareConfig ? firmwareConfig : bot.hardware.mcu_params;
  const { firmware_version } = bot.hardware.informational_settings;
  const { homing_and_calibration } = props.bot.controlPanelState;

  const axisLengthIntSize =
    minFwVersionCheck(firmware_version, "6.0.0")
      ? "long"
      : "short";

  /**
   * Tells us if X/Y/Z have a means of checking their position.
   * FARMBOT WILL CRASH INTO WALLS IF THIS IS WRONG! BE CAREFUL.
   */
  const disabled = disabledAxisMap(hardware);

  return <section>
    <Header
      title={t("Homing and Calibration")}
      name={"homing_and_calibration"}
      dispatch={dispatch}
      expanded={homing_and_calibration} />
    <Collapse isOpen={!!homing_and_calibration}>
      <HomingRow hardware={hardware} botDisconnected={botDisconnected} />
      <CalibrationRow hardware={hardware} botDisconnected={botDisconnected} />
      <ZeroRow botDisconnected={botDisconnected} />
      <BooleanMCUInputGroup
        name={t("Find Home on Boot")}
        tooltip={ToolTips.FIND_HOME_ON_BOOT}
        disable={disabled}
        x={"movement_home_at_boot_x"}
        y={"movement_home_at_boot_y"}
        z={"movement_home_at_boot_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig}
        caution={true} />
      <BooleanMCUInputGroup
        name={t("Stop at Home")}
        tooltip={ToolTips.STOP_AT_HOME}
        x={"movement_stop_at_home_x"}
        y={"movement_stop_at_home_y"}
        z={"movement_stop_at_home_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        name={t("Stop at Max")}
        tooltip={ToolTips.STOP_AT_MAX}
        x={"movement_stop_at_max_x"}
        y={"movement_stop_at_max_y"}
        z={"movement_stop_at_max_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        name={t("Negative Coordinates Only")}
        tooltip={ToolTips.NEGATIVE_COORDINATES_ONLY}
        x={"movement_home_up_x"}
        y={"movement_home_up_y"}
        z={"movement_home_up_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <NumericMCUInputGroup
        name={t("Axis Length (mm)")}
        tooltip={ToolTips.LENGTH}
        x={"movement_axis_nr_steps_x"}
        xScale={sourceFwConfig("movement_step_per_mm_x").value}
        y={"movement_axis_nr_steps_y"}
        yScale={sourceFwConfig("movement_step_per_mm_y").value}
        z={"movement_axis_nr_steps_z"}
        zScale={sourceFwConfig("movement_step_per_mm_z").value}
        gray={{
          x: !sourceFwConfig("movement_stop_at_max_x").value,
          y: !sourceFwConfig("movement_stop_at_max_y").value,
          z: !sourceFwConfig("movement_stop_at_max_z").value,
        }}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch}
        intSize={axisLengthIntSize} />
      <NumericMCUInputGroup
        name={t("Timeout after (seconds)")}
        tooltip={ToolTips.TIMEOUT_AFTER}
        x={"movement_timeout_x"}
        y={"movement_timeout_y"}
        z={"movement_timeout_z"}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch} />
    </Collapse>
  </section>;
}
