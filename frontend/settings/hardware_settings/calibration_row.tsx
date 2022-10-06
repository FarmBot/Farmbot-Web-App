import React from "react";
import { LockableButton } from "./lockable_button";
import { axisTrackingStatus } from "./axis_tracking_status";
import { Row, Col, Help } from "../../ui";
import { CalibrationRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { lockedClass } from "../../controls/locked_class";

export class CalibrationRow extends React.Component<CalibrationRowProps> {
  Axes = () => {
    const {
      type, botOnline, axisTitle, mcuParams, action, arduinoBusy, locked,
    } = this.props;
    return <div className="calibration-row-axes">
      {axisTrackingStatus(mcuParams, this.props.stallUseDisabled)
        .map(row => {
          const { axis } = row;
          const hardwareDisabled = type == "zero" ? false : row.disabled;
          return <Col xs={3} key={axis}
            className={"centered-button-div low-pad"}>
            <LockableButton
              disabled={arduinoBusy || hardwareDisabled || !botOnline}
              className={lockedClass(locked)}
              title={t(axisTitle)}
              onClick={() => action(axis)}>
              {`${t(axisTitle)} ${axis}`}
            </LockableButton>
          </Col>;
        })}
    </div>;
  };

  render() {
    return <Highlight settingName={this.props.title}>
      <Row>
        <Col xs={3} className={"widget-body-tooltips"}>
          <label>
            {t(this.props.title)}
          </label>
          <Help text={t(this.props.toolTip)} />
        </Col>
        <this.Axes />
      </Row>
    </Highlight>;
  }
}
