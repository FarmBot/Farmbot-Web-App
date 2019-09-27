import * as React from "react";
import { getDevice } from "../../../device";
import { Axis } from "../../interfaces";
import { LockableButton } from "../lockable_button";
import { axisTrackingStatus } from "../axis_tracking_status";
import { ToolTips } from "../../../constants";
import { Row, Col, Help } from "../../../ui/index";
import { CalibrationRowProps } from "../interfaces";
import { commandErr } from "../../actions";
import { t } from "../../../i18next_wrapper";
import { Position } from "@blueprintjs/core";

const calibrate = (axis: Axis) => getDevice()
  .calibrate({ axis })
  .catch(commandErr("Calibration"));

export function CalibrationRow(props: CalibrationRowProps) {

  const { hardware, botDisconnected } = props;

  return <Row>
    <Col xs={6} className={"widget-body-tooltips"}>
      <label>
        {t("CALIBRATION")}
      </label>
      <Help text={ToolTips.CALIBRATION} requireClick={true} position={Position.RIGHT} />
    </Col>
    {axisTrackingStatus(hardware)
      .map(row => {
        const { axis, disabled } = row;
        return <Col xs={2} key={axis} className={"centered-button-div"}>
          <LockableButton
            disabled={disabled || botDisconnected}
            onClick={() => calibrate(axis)}>
            {t("CALIBRATE {{axis}}", { axis })}
          </LockableButton>
        </Col>;
      })}
  </Row>;
}
