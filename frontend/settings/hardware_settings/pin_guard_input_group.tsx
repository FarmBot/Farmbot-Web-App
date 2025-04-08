import React from "react";
import { McuInputBox } from "./mcu_input_box";
import { PinGuardMCUInputGroupProps } from "./interfaces";
import { Row, ToggleButton } from "../../ui";
import { settingToggle } from "../../devices/actions";
import { isUndefined } from "lodash";
import { t } from "../../i18next_wrapper";
import { PinNumberDropdown } from "./pin_number_dropdown";
import { Highlight } from "../maybe_highlight";
import { getModifiedClassName } from "./default_values";

export const PinGuardMCUInputGroup = (props: PinGuardMCUInputGroupProps) => {
  const { sourceFwConfig, dispatch, activeStateKey } = props;
  const activeStateValue = sourceFwConfig(activeStateKey).value;
  const inactiveState = isUndefined(activeStateValue)
    ? undefined
    : !activeStateValue;

  const { label } = props;
  return <Highlight settingName={label}>
    <div className={"pin-guard-input-row"}>
      <Row className="pin-guard-grid">
        <PinNumberDropdown
          pinNumKey={props.pinNumKey}
          dispatch={props.dispatch}
          resources={props.resources}
          disabled={props.disabled}
          sourceFwConfig={props.sourceFwConfig} />
        <McuInputBox
          setting={props.timeoutKey}
          sourceFwConfig={props.sourceFwConfig}
          firmwareHardware={props.firmwareHardware}
          dispatch={props.dispatch}
          disabled={props.disabled}
          filter={32000} />
        <ToggleButton dispatch={dispatch}
          customText={{ textFalse: t("off"), textTrue: t("on") }}
          toggleValue={inactiveState}
          dim={!sourceFwConfig(activeStateKey).consistent}
          className={getModifiedClassName(
            activeStateKey,
            activeStateValue,
            props.firmwareHardware)}
          disabled={props.disabled}
          toggleAction={() =>
            dispatch(settingToggle(activeStateKey, sourceFwConfig))} />
      </Row>
    </div>
  </Highlight>;
};
