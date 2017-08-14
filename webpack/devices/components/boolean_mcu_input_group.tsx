import * as React from "react";
import { ToggleButton } from "../../controls/toggle_button";
import { SpacePanelToolTip } from "./space_panel_tool_tip";
import { settingToggle } from "../actions";
import { Row, Col } from "../../ui/index";
import { BooleanMCUInputGroupProps } from "./interfaces";

export function BooleanMCUInputGroup(props: BooleanMCUInputGroupProps) {

  let {
    bot,
    tooltip,
    name,
    x,
    y,
    z,
    disableX,
    disableY,
    disableZ,
    caution,
    displayAlert
  } = props;

  let { mcu_params } = bot.hardware;

  return (
    <Row>
      <Col xs={6}>
        <label>
          {name}
          {caution &&
            <i className="fa fa-exclamation-triangle caution-icon" />}
        </label>
        <SpacePanelToolTip tooltip={tooltip} />
      </Col>
      <Col xs={2}>
        <ToggleButton
          disabled={disableX}
          toggleValue={mcu_params[x]}
          toggleAction={() => settingToggle(x, bot, displayAlert)}
        />
      </Col>
      <Col xs={2}>
        <ToggleButton
          disabled={disableY}
          toggleValue={mcu_params[y]}
          toggleAction={() => settingToggle(y, bot, displayAlert)}
        />
      </Col>
      <Col xs={2}>
        <ToggleButton
          disabled={disableZ}
          toggleValue={mcu_params[z]}
          toggleAction={() => settingToggle(z, bot, displayAlert)}
        />
      </Col>
    </Row>
  );
}
