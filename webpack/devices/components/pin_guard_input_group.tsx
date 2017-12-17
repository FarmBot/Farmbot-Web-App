import * as React from "react";
import { McuInputBox } from "./mcu_input_box";
import { PinGuardMCUInputGroupProps } from "./interfaces";
import { Row } from "../../ui/row";
import { Col } from "../../ui/index";
import { settingToggle } from "../actions";
import { ToggleButton } from "../../controls/toggle_button";

export function PinGuardMCUInputGroup(props: PinGuardMCUInputGroupProps) {

  const { bot, dispatch, name, pinNumber, timeout, activeState } = props;
  const { mcu_params } = bot.hardware;
  return <Row>
    <Col xs={3}>
      <label>
        {name}
      </label>
    </Col>
    <Col xs={3}>
      <McuInputBox
        setting={pinNumber}
        bot={bot}
        dispatch={dispatch} />
    </Col>
    <Col xs={4}>
      <McuInputBox
        setting={timeout}
        bot={bot}
        dispatch={dispatch} />
    </Col>
    <Col xs={2}>
      <ToggleButton
        noYes={false}
        toggleValue={mcu_params[activeState]}
        toggleAction={() => settingToggle(activeState, bot)} />
    </Col>
  </Row>;
}
