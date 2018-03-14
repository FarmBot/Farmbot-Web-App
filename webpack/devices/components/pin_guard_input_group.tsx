import * as React from "react";
import { McuInputBox } from "./mcu_input_box";
import { PinGuardMCUInputGroupProps } from "./interfaces";
import { Row, Col } from "../../ui/index";
import { settingToggle } from "../actions";
import { ToggleButton } from "../../controls/toggle_button";
import { isUndefined } from "util";
import { t } from "i18next";

export function PinGuardMCUInputGroup(props: PinGuardMCUInputGroupProps) {

  const { sourceFwConfig, dispatch, name, pinNumber, timeout, activeState
  } = props;
  const activeStateValue = sourceFwConfig(activeState).value;
  const inactiveState = isUndefined(activeStateValue)
    ? undefined
    : !activeStateValue;
  return <Row>
    <Col xs={3}>
      <label>
        {name}
      </label>
    </Col>
    <Col xs={3}>
      <McuInputBox
        setting={pinNumber}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch}
        filter={32000} />
    </Col>
    <Col xs={4}>
      <McuInputBox
        setting={timeout}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch}
        filter={32000} />
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <ToggleButton
        customText={{ textFalse: t("low"), textTrue: t("high") }}
        toggleValue={inactiveState}
        dim={!sourceFwConfig(activeState).consistent}
        toggleAction={() => dispatch(settingToggle(activeState, sourceFwConfig))} />
    </Col>
  </Row>;
}
