import * as React from "react";
import { ToggleButton } from "../../controls/toggle_button";
import { SpacePanelToolTip } from "./space_panel_tool_tip";
import { settingToggle } from "../actions";
import { Row, Col } from "../../ui/index";
import { BooleanMCUInputGroupProps } from "./interfaces";

export function BooleanMCUInputGroup(props: BooleanMCUInputGroupProps) {

  const {
    bot,
    tooltip,
    name,
    x,
    y,
    z,
    disable,
    grayscale,
    caution,
    displayAlert
  } = props;

  const { mcu_params } = bot.hardware;

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
        toggleValue={mcu_params[x]}
        toggleAction={() => settingToggle(x, bot, displayAlert)} />
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <ToggleButton
        grayscale={grayscale && grayscale.y}
        disabled={disable && disable.y}
        toggleValue={mcu_params[y]}
        toggleAction={() => settingToggle(y, bot, displayAlert)} />
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <ToggleButton
        grayscale={grayscale && grayscale.z}
        disabled={disable && disable.z}
        toggleValue={mcu_params[z]}
        toggleAction={() => settingToggle(z, bot, displayAlert)} />
    </Col>
  </Row>;
}
