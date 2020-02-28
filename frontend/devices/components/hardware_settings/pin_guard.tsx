import * as React from "react";
import { PinGuardMCUInputGroup } from "../pin_guard_input_group";
import { PinGuardProps } from "../interfaces";
import { Header } from "./header";
import { Collapse, Position } from "@blueprintjs/core";
import { Row, Col, Help } from "../../../ui/index";
import { ToolTips, DeviceSetting } from "../../../constants";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export function PinGuard(props: PinGuardProps) {

  const { pin_guard } = props.controlPanelState;
  const { dispatch, sourceFwConfig, resources } = props;

  return <Highlight className={"section"}
    settingName={DeviceSetting.pinGuard}>
    <Header
      expanded={pin_guard}
      title={DeviceSetting.pinGuard}
      panel={"pin_guard"}
      dispatch={dispatch} />
    <Collapse isOpen={!!pin_guard}>
      <Row>
        <Col xs={3} xsOffset={3} className={"widget-body-tooltips"}>
          <label>
            {t("Pin Number")}
          </label>
          <Help text={ToolTips.PIN_GUARD_PIN_NUMBER} requireClick={true}
            position={Position.RIGHT} />
        </Col>
        <Col xs={4}>
          <label>
            {t("Timeout (sec)")}
          </label>
        </Col>
        <Col xs={2} className={"centered-button-div"}>
          <label>
            {t("To State")}
          </label>
        </Col>
      </Row>
      <PinGuardMCUInputGroup
        label={t("Pin Guard {{ num }}", { num: 1 })}
        pinNumKey={"pin_guard_1_pin_nr"}
        timeoutKey={"pin_guard_1_time_out"}
        activeStateKey={"pin_guard_1_active_state"}
        dispatch={dispatch}
        resources={resources}
        sourceFwConfig={sourceFwConfig} />
      <PinGuardMCUInputGroup
        label={t("Pin Guard {{ num }}", { num: 2 })}
        pinNumKey={"pin_guard_2_pin_nr"}
        timeoutKey={"pin_guard_2_time_out"}
        activeStateKey={"pin_guard_2_active_state"}
        dispatch={dispatch}
        resources={resources}
        sourceFwConfig={sourceFwConfig} />
      <PinGuardMCUInputGroup
        label={t("Pin Guard {{ num }}", { num: 3 })}
        pinNumKey={"pin_guard_3_pin_nr"}
        timeoutKey={"pin_guard_3_time_out"}
        activeStateKey={"pin_guard_3_active_state"}
        dispatch={dispatch}
        resources={resources}
        sourceFwConfig={sourceFwConfig} />
      <PinGuardMCUInputGroup
        label={t("Pin Guard {{ num }}", { num: 4 })}
        pinNumKey={"pin_guard_4_pin_nr"}
        timeoutKey={"pin_guard_4_time_out"}
        activeStateKey={"pin_guard_4_active_state"}
        dispatch={dispatch}
        resources={resources}
        sourceFwConfig={sourceFwConfig} />
      <PinGuardMCUInputGroup
        label={t("Pin Guard {{ num }}", { num: 5 })}
        pinNumKey={"pin_guard_5_pin_nr"}
        timeoutKey={"pin_guard_5_time_out"}
        activeStateKey={"pin_guard_5_active_state"}
        dispatch={dispatch}
        resources={resources}
        sourceFwConfig={sourceFwConfig} />
    </Collapse>
  </Highlight>;
}
