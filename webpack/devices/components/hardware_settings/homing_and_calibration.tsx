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

  const { dispatch, bot } = props;
  const { mcu_params } = bot.hardware;
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
  const disabled = disabledAxisMap(mcu_params);

  return <section>
    <Header
      title={t("Homing and Calibration")}
      name={"homing_and_calibration"}
      dispatch={dispatch}
      bool={homing_and_calibration} />
    <Collapse isOpen={!!homing_and_calibration}>
      <HomingRow hardware={mcu_params} />
      <CalibrationRow hardware={mcu_params} />
      <ZeroRow />
      <BooleanMCUInputGroup
        name={t("Find Home on Boot")}
        tooltip={ToolTips.FIND_HOME_ON_BOOT}
        disable={disabled}
        x={"movement_home_at_boot_x"}
        y={"movement_home_at_boot_y"}
        z={"movement_home_at_boot_z"}
        dispatch={dispatch}
        bot={bot}
        caution={true} />
      <BooleanMCUInputGroup
        name={t("Stop at Home")}
        tooltip={ToolTips.STOP_AT_HOME}
        x={"movement_stop_at_home_x"}
        y={"movement_stop_at_home_y"}
        z={"movement_stop_at_home_z"}
        dispatch={dispatch}
        bot={bot} />
      <BooleanMCUInputGroup
        name={t("Stop at Max")}
        tooltip={ToolTips.STOP_AT_MAX}
        x={"movement_stop_at_max_x"}
        y={"movement_stop_at_max_y"}
        z={"movement_stop_at_max_z"}
        dispatch={dispatch}
        bot={bot} />
      <BooleanMCUInputGroup
        name={t("Negative Coordinates Only")}
        tooltip={ToolTips.NEGATIVE_COORDINATES_ONLY}
        x={"movement_home_up_x"}
        y={"movement_home_up_y"}
        z={"movement_home_up_z"}
        dispatch={dispatch}
        bot={bot} />
      <NumericMCUInputGroup
        name={t("Axis Length (steps)")}
        tooltip={ToolTips.LENGTH}
        x={"movement_axis_nr_steps_x"}
        y={"movement_axis_nr_steps_y"}
        z={"movement_axis_nr_steps_z"}
        gray={{
          x: !mcu_params["movement_stop_at_max_x"],
          y: !mcu_params["movement_stop_at_max_y"],
          z: !mcu_params["movement_stop_at_max_z"],
        }}
        bot={bot}
        dispatch={dispatch}
        intSize={axisLengthIntSize} />
      <NumericMCUInputGroup
        name={t("Timeout after (seconds)")}
        tooltip={ToolTips.TIMEOUT_AFTER}
        x={"movement_timeout_x"}
        y={"movement_timeout_y"}
        z={"movement_timeout_z"}
        bot={bot}
        dispatch={dispatch} />
    </Collapse>
  </section>;
}
