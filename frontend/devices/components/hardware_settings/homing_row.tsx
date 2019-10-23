import * as React from "react";
import { HomingRowProps } from "../interfaces";
import { LockableButton } from "../lockable_button";
import { axisTrackingStatus } from "../axis_tracking_status";
import { ToolTips } from "../../../constants";
import { Row, Col, Help } from "../../../ui/index";
import { CONFIG_DEFAULTS } from "farmbot/dist/config";
import { commandErr } from "../../actions";
import { Axis } from "../../interfaces";
import { getDevice } from "../../../device";
import { t } from "../../../i18next_wrapper";
import { Position } from "@blueprintjs/core";

const speed = CONFIG_DEFAULTS.speed;
const findHome = (axis: Axis) => getDevice()
  .findHome({ speed, axis })
  .catch(commandErr("'Find Home' request"));

export function HomingRow(props: HomingRowProps) {
  const { hardware, botDisconnected } = props;

  return <Row>
    <Col xs={6} className={"widget-body-tooltips"}>
      <label>
        {t("HOMING")}
      </label>
      <Help text={ToolTips.HOMING} requireClick={true} position={Position.RIGHT}/>
    </Col>
    {axisTrackingStatus(hardware)
      .map((row) => {
        const { axis, disabled } = row;
        return <Col xs={2} key={axis} className={"centered-button-div"}>
          <LockableButton
            disabled={disabled || botDisconnected}
            onClick={() => findHome(axis)}>
            {t("FIND HOME {{axis}}", { axis })}
          </LockableButton>
        </Col>;
      })}
  </Row>;
}
