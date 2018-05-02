import * as React from "react";
import { t } from "i18next";
import { getDevice } from "../../../device";
import { Axis } from "../../interfaces";
import { HomingRowProps } from "../interfaces";
import { LockableButton } from "../lockable_button";
import { axisTrackingStatus } from "../axis_tracking_status";
import { ToolTips } from "../../../constants";
import { SpacePanelToolTip } from "../space_panel_tool_tip";
import { Row, Col } from "../../../ui/index";
import { CONFIG_DEFAULTS } from "farmbot/dist/config";
import { commandErr } from "../../actions";

const speed = CONFIG_DEFAULTS.speed;
const findHome = (axis: Axis) => getDevice()
  .findHome({ speed, axis })
  .catch(commandErr("'Find Home' request"));

export function HomingRow(props: HomingRowProps) {
  const { hardware, botDisconnected } = props;

  return <Row>
    <Col xs={6}>
      <label>
        {t("HOMING")}
      </label>
      <SpacePanelToolTip tooltip={ToolTips.HOMING} />
    </Col>
    {axisTrackingStatus(hardware)
      .map((row) => {
        const { axis, disabled } = row;
        return <Col xs={2} key={axis} className={"centered-button-div"}>
          <LockableButton
            disabled={disabled || botDisconnected}
            onClick={() => findHome(axis)}>
            {t("HOME {{axis}}", { axis })}
          </LockableButton>
        </Col>;
      })}
  </Row>;
}
