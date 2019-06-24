import * as React from "react";
import { McuInputBox } from "./mcu_input_box";
import { PinGuardMCUInputGroupProps } from "./interfaces";
import { Row, Col } from "../../ui/index";
import { settingToggle } from "../actions";
import { ToggleButton } from "../../controls/toggle_button";
import { isUndefined } from "lodash";
import { t } from "../../i18next_wrapper";
import { PinNumberDropdown } from "./pin_number_dropdown";

export function PinGuardMCUInputGroup(props: PinGuardMCUInputGroupProps) {

  const { sourceFwConfig, dispatch, name, pinNumKey, timeoutKey, activeStateKey
  } = props;
  const activeStateValue = sourceFwConfig(activeStateKey).value;
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
      <PinNumberDropdown
        pinNumKey={pinNumKey}
        dispatch={dispatch}
        resources={props.resources}
        sourceFwConfig={sourceFwConfig} />
    </Col>
    <Col xs={4}>
      <McuInputBox
        setting={timeoutKey}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch}
        filter={32000} />
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <ToggleButton
        customText={{ textFalse: t("low"), textTrue: t("high") }}
        toggleValue={inactiveState}
        dim={!sourceFwConfig(activeStateKey).consistent}
        toggleAction={() =>
          dispatch(settingToggle(activeStateKey, sourceFwConfig))} />
    </Col>
  </Row>;
}
