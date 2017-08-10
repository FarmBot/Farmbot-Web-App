import * as React from "react";
import { t } from "i18next";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips } from "../../../constants";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { HomingRow } from "../homing_row";
import { CalibrationRow } from "../calibration_row";
import { ZeroRow } from "../zero_row";
import { enabledAxisMap } from "../axis_tracking_status";
import { HomingAndCalibrationProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";

export function HomingAndCalibration(props: HomingAndCalibrationProps) {

  let { dispatch, bot } = props;
  let { mcu_params } = bot.hardware;
  let { homing_and_calibration } = props.bot.controlPanelState;

  /**
   * Tells us if X/Y/Z have a means of checking their position.
   * FARMBOT WILL CRASH INTO WALLS IF THIS IS WRONG! BE CAREFUL.
   */
  let enabled = enabledAxisMap(mcu_params);

  return <section>
    <Header
      title={"Homing and Calibration"}
      name={"homing_and_calibration"}
      dispatch={dispatch}
      bool={homing_and_calibration}
    />
    <Collapse isOpen={!!homing_and_calibration}>
      <HomingRow hardware={mcu_params} />
      <CalibrationRow hardware={mcu_params} />
      <ZeroRow />
      <BooleanMCUInputGroup
        name={t("Find Home on Boot")}
        tooltip={t(ToolTips.FIND_HOME_ON_BOOT)}
        disableX={!enabled.x}
        disableY={!enabled.y}
        disableZ={!enabled.z}
        x={"movement_home_at_boot_x"}
        y={"movement_home_at_boot_y"}
        z={"movement_home_at_boot_z"}
        dispatch={dispatch}
        bot={bot}
      />
      <BooleanMCUInputGroup
        name={t("Stop at Home")}
        tooltip={t(ToolTips.STOP_AT_HOME)}
        x={"movement_stop_at_home_x"}
        y={"movement_stop_at_home_y"}
        z={"movement_stop_at_home_z"}
        dispatch={dispatch}
        bot={bot}
      />
      <BooleanMCUInputGroup
        name={t("Stop at Max")}
        tooltip={t(ToolTips.STOP_AT_MAX)}
        x={"movement_stop_at_max_x"}
        y={"movement_stop_at_max_y"}
        z={"movement_stop_at_max_z"}
        dispatch={dispatch}
        bot={bot}
      />
      <BooleanMCUInputGroup
        name={t("Negative Coordinates Only")}
        tooltip={t(ToolTips.NEGATIVE_COORDINATES_ONLY)}
        x={"movement_home_up_x"}
        y={"movement_home_up_y"}
        z={"movement_home_up_z"}
        dispatch={dispatch}
        bot={bot}
      />
      <NumericMCUInputGroup
        name={t("Axis Length (steps)")}
        tooltip={t(ToolTips.LENGTH)}
        x={"movement_axis_nr_steps_x"}
        y={"movement_axis_nr_steps_y"}
        z={"movement_axis_nr_steps_z"}
        bot={bot}
        dispatch={dispatch}
      />
      <NumericMCUInputGroup
        name={t("Timeout after (seconds)")}
        tooltip={t(ToolTips.TIMEOUT_AFTER)}
        x={"movement_timeout_x"}
        y={"movement_timeout_y"}
        z={"movement_timeout_z"}
        bot={bot}
        dispatch={dispatch}
      />
    </Collapse>
  </section>;
}
