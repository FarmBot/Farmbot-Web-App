import * as React from "react";
import { t } from "i18next";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToolTips } from "../../../constants";
import { SpacePanelToolTip } from "../space_panel_tool_tip";
import { ToggleButton } from "../../../controls/toggle_button";
import { settingToggle } from "../../actions";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { BotConfigInputBox } from "../step_per_mm_box";
import { MotorsProps } from "../interfaces";
import { Row, Col } from "../../../ui/index";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";

export function Motors({ dispatch, bot }: MotorsProps) {

  let { mcu_params } = bot.hardware;
  let { motors } = bot.controlPanelState;

  return <section>
    <Header
      bool={motors}
      title={"Motors"}
      name={"motors"}
      dispatch={dispatch}
    />
    <Collapse isOpen={!!motors}>
      <Row>
        <Col xs={6}>
          <label>
            {t("Max Retries")}
          </label>
          <SpacePanelToolTip tooltip={t(ToolTips.MAX_MOVEMENT_RETRIES)} />
        </Col>
        <Col xs={6}>
          <BotConfigInputBox
            setting="max_movement_retries"
            bot={bot}
            dispatch={dispatch} />
        </Col>
      </Row>
      <NumericMCUInputGroup
        name={t("Max Speed (steps/s)")}
        tooltip={t(ToolTips.MAX_SPEED)}
        x={"movement_max_spd_x"}
        y={"movement_max_spd_y"}
        z={"movement_max_spd_z"}
        bot={bot}
        dispatch={dispatch}
      />
      <NumericMCUInputGroup
        name={t("Minimum Speed (steps/s)")}
        tooltip={t(ToolTips.MIN_SPEED)}
        x={"movement_min_spd_x"}
        y={"movement_min_spd_y"}
        z={"movement_min_spd_z"}
        bot={bot}
        dispatch={dispatch}
      />
      <NumericMCUInputGroup
        name={t("Accelerate for (steps)")}
        tooltip={t(ToolTips.ACCELERATE_FOR)}
        x={"movement_steps_acc_dec_x"}
        y={"movement_steps_acc_dec_y"}
        z={"movement_steps_acc_dec_z"}
        bot={bot}
        dispatch={dispatch}
      />
      <Row>
        <Col xs={6}>
          <label>
            {t("Steps per MM")}
          </label>
          <SpacePanelToolTip tooltip={t(ToolTips.STEPS_PER_MM)} />
        </Col>
        <Col xs={2}>
          <BotConfigInputBox
            setting="steps_per_mm_x"
            bot={bot}
            dispatch={dispatch}
          />
        </Col>
        <Col xs={2}>
          <BotConfigInputBox
            setting="steps_per_mm_y"
            bot={bot}
            dispatch={dispatch}
          />
        </Col>
        <Col xs={2}>
          <BotConfigInputBox
            setting="steps_per_mm_z"
            bot={bot}
            dispatch={dispatch}
          />
        </Col>
      </Row>
      <BooleanMCUInputGroup
        name={t("Always Power Motors")}
        tooltip={t(ToolTips.ALWAYS_POWER_MOTORS)}
        x={"movement_keep_active_x"}
        y={"movement_keep_active_y"}
        z={"movement_keep_active_z"}
        dispatch={dispatch}
        bot={bot}
      />
      <BooleanMCUInputGroup
        name={t("Invert Motors")}
        tooltip={t(ToolTips.INVERT_MOTORS)}
        x={"movement_invert_motor_x"}
        y={"movement_invert_motor_y"}
        z={"movement_invert_motor_z"}
        dispatch={dispatch}
        bot={bot}
      />
      <Row>
        <Col xs={6}>
          <label>
            {t("Enable 2nd X Motor")}
          </label>
          <SpacePanelToolTip tooltip={t(ToolTips.ENABLE_X2_MOTOR)} />
        </Col>
        <Col xs={2}>
          <ToggleButton
            toggleval={mcu_params.movement_secondary_motor_x}
            toggleAction={() =>
              settingToggle("movement_secondary_motor_x", bot)}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <label>
            {t("Invert 2nd X Motor")}
          </label>
          <SpacePanelToolTip tooltip={t(ToolTips.INVERT_MOTORS)} />
        </Col>
        <Col xs={2}>
          <ToggleButton
            toggleval={mcu_params.movement_secondary_motor_invert_x}
            toggleAction={() =>
              settingToggle("movement_secondary_motor_invert_x", bot)}
          />
        </Col>
      </Row>
    </Collapse>
  </section>;
}
