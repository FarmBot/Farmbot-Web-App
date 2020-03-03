import * as React from "react";
import { ToggleButton } from "../../controls/toggle_button";
import { settingToggle } from "../actions";
import { Row, Col, Help } from "../../ui/index";
import { BooleanMCUInputGroupProps } from "./interfaces";
import { Position } from "@blueprintjs/core";
import { t } from "../../i18next_wrapper";
import { Highlight } from "./maybe_highlight";

export function BooleanMCUInputGroup(props: BooleanMCUInputGroupProps) {

  const {
    tooltip,
    label,
    x,
    y,
    z,
    disable,
    grayscale,
    caution,
    displayAlert,
    sourceFwConfig,
    dispatch,
  } = props;

  const xParam = sourceFwConfig(x);
  const yParam = sourceFwConfig(y);
  const zParam = sourceFwConfig(z);

  return <Row>
    <Highlight settingName={label}>
      <Col xs={6} className={"widget-body-tooltips"}>
        <label>
          {t(label)}
          {caution &&
            <i className="fa fa-exclamation-triangle caution-icon" />}
        </label>
        <Help text={tooltip} requireClick={true} position={Position.RIGHT} />
      </Col>
      <Col xs={2} className={"centered-button-div"}>
        <ToggleButton
          grayscale={grayscale?.x}
          disabled={disable?.x}
          dim={!xParam.consistent}
          toggleValue={xParam.value}
          toggleAction={() =>
            dispatch(settingToggle(x, sourceFwConfig, displayAlert))} />
      </Col>
      <Col xs={2} className={"centered-button-div"}>
        <ToggleButton
          grayscale={grayscale?.y}
          disabled={disable?.y}
          dim={!yParam.consistent}
          toggleValue={yParam.value}
          toggleAction={() =>
            dispatch(settingToggle(y, sourceFwConfig, displayAlert))} />
      </Col>
      <Col xs={2} className={"centered-button-div"}>
        <ToggleButton
          grayscale={grayscale?.z}
          disabled={disable?.z}
          dim={!zParam.consistent}
          toggleValue={zParam.value}
          toggleAction={() =>
            dispatch(settingToggle(z, sourceFwConfig, displayAlert))} />
      </Col>
    </Highlight>
  </Row>;
}
