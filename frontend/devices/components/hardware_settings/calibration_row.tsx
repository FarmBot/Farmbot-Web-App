import * as React from "react";
import { LockableButton } from "../lockable_button";
import { axisTrackingStatus } from "../axis_tracking_status";
import { Row, Col, Help } from "../../../ui/index";
import { CalibrationRowProps } from "../interfaces";
import { t } from "../../../i18next_wrapper";
import { Position } from "@blueprintjs/core";

export function CalibrationRow(props: CalibrationRowProps) {

  const { hardware, botDisconnected } = props;

  return <Row>
    <Col xs={6} className={"widget-body-tooltips"}>
      <label>
        {t(props.title)}
      </label>
      <Help text={t(props.toolTip)}
        requireClick={true} position={Position.RIGHT} />
    </Col>
    {axisTrackingStatus(hardware)
      .map(row => {
        const { axis } = row;
        const hardwareDisabled = props.type == "zero" ? false : row.disabled;
        return <Col xs={2} key={axis} className={"centered-button-div"}>
          <LockableButton
            disabled={hardwareDisabled || botDisconnected}
            onClick={() => props.action(axis)}>
            {`${t(props.axisTitle)} ${axis}`}
          </LockableButton>
        </Col>;
      })}
  </Row>;
}
