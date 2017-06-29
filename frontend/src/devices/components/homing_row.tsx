import * as React from "react";
import { t } from "i18next";
import { devices } from "../../device";
import { Axis } from "../interfaces";
import { HomingRowProps } from "./interfaces";
import { Farmbot } from "farmbot/dist";
import { LockableButton } from "./lockable_button";
import { axisTrackingStatus } from "./axis_tracking_status";
import { ToolTips } from "../../constants";
import { SpacePanelToolTip } from "./space_panel_tool_tip";
import { Row, Col } from "../../ui/index";

const speed = Farmbot.defaults.speed;
let findHome = (axis: Axis) => devices.current.findHome({ speed, axis });

export function HomingRow(props: HomingRowProps) {
  let { hardware } = props;

  return <Row>
    <Col xs={6}>
      <label>
        {t("HOMING")}
      </label>
      <SpacePanelToolTip tooltip={t(ToolTips.HOMING)} />
    </Col>
    {axisTrackingStatus(hardware)
      .map((row) => {
        let { axis, disabled } = row;
        return <Col xs={2} key={axis}>
          <LockableButton disabled={disabled} onClick={() => findHome(axis)}>
            {t("HOME {{axis}}", { axis })}
          </LockableButton>
        </Col>
      })}
  </Row>;
}
