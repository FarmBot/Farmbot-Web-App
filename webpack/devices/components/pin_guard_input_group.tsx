import * as React from "react";
import { McuInputBox } from "./mcu_input_box";
import { PinGuardMCUInputGroupProps } from "./interfaces";
import { Row, Col } from "../../ui/index";
import { settingToggle } from "../actions";
import { ToggleButton } from "../../controls/toggle_button";
import { isUndefined } from "util";

export function PinGuardMCUInputGroup(props: PinGuardMCUInputGroupProps) {

  const { bot, dispatch, name, pinNumber, timeout, activeState } = props;
  const { mcu_params } = bot.hardware;
  const inactiveState = isUndefined(mcu_params[activeState])
    ? undefined
    : !mcu_params[activeState];
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
        dispatch={dispatch}
        filter={32000} />
    </Col>
    <Col xs={4}>
      <McuInputBox
        setting={timeout}
        bot={bot}
        dispatch={dispatch}
        filter={32000} />
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <ToggleButton
        customText={{ textFalse: "low", textTrue: "high" }}
        toggleValue={inactiveState}
        toggleAction={() => settingToggle(activeState, bot)} />
    </Col>
  </Row>;
}
