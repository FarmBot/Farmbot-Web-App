import * as React from "react";
import { ToggleButton } from "../../controls/toggle_button";
import { SpacePanelToolTip } from "./space_panel_tool_tip";
import { settingToggle } from "../actions";
import { Row, Col } from "../../ui/index";
import { BooleanMCUInputGroupProps } from "./interfaces";

export function BooleanMCUInputGroup(props: BooleanMCUInputGroupProps) {

  const {
    tooltip,
    name,
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
    <Col xs={6}>
      <label>
        {name}
        {caution &&
          <i className="fa fa-exclamation-triangle caution-icon" />}
      </label>
      <SpacePanelToolTip tooltip={tooltip} />
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <ToggleButton
        grayscale={grayscale && grayscale.x}
        disabled={disable && disable.x}
        dim={!xParam.consistent}
        toggleValue={xParam.value}
        toggleAction={() =>
          dispatch(settingToggle(x, sourceFwConfig, displayAlert))} />
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <ToggleButton
        grayscale={grayscale && grayscale.y}
        disabled={disable && disable.y}
        dim={!yParam.consistent}
        toggleValue={yParam.value}
        toggleAction={() =>
          dispatch(settingToggle(y, sourceFwConfig, displayAlert))} />
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <ToggleButton
        grayscale={grayscale && grayscale.z}
        disabled={disable && disable.z}
        dim={!zParam.consistent}
        toggleValue={zParam.value}
        toggleAction={() =>
          dispatch(settingToggle(z, sourceFwConfig, displayAlert))} />
    </Col>
  </Row>;
}
