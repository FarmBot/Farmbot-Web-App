import * as React from "react";
import { t } from "i18next";
import { getDevice } from "../../../device";
import { Axis } from "../../interfaces";
import { LockableButton } from "../lockable_button";
import { axisTrackingStatus } from "../axis_tracking_status";
import { ToolTips } from "../../../constants";
import { Row, Col } from "../../../ui/index";
import { CalibrationRowProps } from "../interfaces";

const calibrate =
  (axis: Axis) => getDevice().calibrate({ axis }).catch(() => { });

export function CalibrationRow(props: CalibrationRowProps) {

  const { hardware, botDisconnected } = props;

  return <Row>
    <Col xs={6}>
      <label>
        {t("CALIBRATION")}
      </label>
      <div className="help">
        <i className="fa fa-question-circle help-icon" />
        <div className="help-text">
          {t(ToolTips.CALIBRATION)}
        </div>
      </div>
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
