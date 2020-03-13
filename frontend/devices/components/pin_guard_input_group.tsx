import * as React from "react";
import { McuInputBox } from "./mcu_input_box";
import { PinGuardMCUInputGroupProps } from "./interfaces";
import { Row, Col, Help } from "../../ui/index";
import { settingToggle } from "../actions";
import { ToggleButton } from "../../controls/toggle_button";
import { isUndefined } from "lodash";
import { t } from "../../i18next_wrapper";
import { PinNumberDropdown } from "./pin_number_dropdown";
import { DevSettings } from "../../account/dev/dev_support";
import { ToolTips } from "../../constants";
import { Position } from "@blueprintjs/core";

export class PinGuardMCUInputGroup
  extends React.Component<PinGuardMCUInputGroupProps> {

  get newFormat() { return DevSettings.futureFeaturesEnabled(); }

  Number = () =>
    <PinNumberDropdown
      pinNumKey={this.props.pinNumKey}
      dispatch={this.props.dispatch}
      resources={this.props.resources}
      sourceFwConfig={this.props.sourceFwConfig} />

  Timeout = () =>
    <McuInputBox
      setting={this.props.timeoutKey}
      sourceFwConfig={this.props.sourceFwConfig}
      dispatch={this.props.dispatch}
      filter={32000} />

  State = () => {
    const { sourceFwConfig, dispatch, activeStateKey } = this.props;
    const activeStateValue = sourceFwConfig(activeStateKey).value;
    const inactiveState = isUndefined(activeStateValue)
      ? undefined
      : !activeStateValue;
    return <ToggleButton
      customText={{ textFalse: t("low"), textTrue: t("high") }}
      toggleValue={inactiveState}
      dim={!sourceFwConfig(activeStateKey).consistent}
      toggleAction={() =>
        dispatch(settingToggle(activeStateKey, sourceFwConfig))} />;
  }

  render() {
    const { label } = this.props;
    return !this.newFormat
      ? <Row>
        <Col xs={3}>
          <label>
            {label}
          </label>
        </Col>
        <Col xs={3}>
          <this.Number />
        </Col>
        <Col xs={4}>
          <this.Timeout />
        </Col>
        <Col xs={2} className={"centered-button-div"}>
          <this.State />
        </Col>
      </Row>
      : <div className={"pin-guard-input-row"}>
        <Row>
          <Col xs={12}>
            <label>
              {label}
            </label>
          </Col>
        </Row>
        <Row>
          <Col xs={5} xsOffset={1} className="no-pad">
            <label>
              {t("Pin Number")}
            </label>
            <Help text={ToolTips.PIN_GUARD_PIN_NUMBER}
              position={Position.TOP_RIGHT} />
          </Col>
          <Col xs={5} className="no-pad">
            <this.Number />
          </Col>
        </Row>
        <Row>
          <Col xs={5} xsOffset={1} className="no-pad">
            <label>
              {t("Timeout (sec)")}
            </label>
          </Col>
          <Col xs={5} className="no-pad">
            <this.Timeout />
          </Col>
        </Row>
        <Row>
          <Col xs={5} xsOffset={1} className="no-pad">
            <label>
              {t("To State")}
            </label>
          </Col>
          <Col xs={5} className="no-pad">
            <this.State />
          </Col>
        </Row>
      </div>;
  }
}
