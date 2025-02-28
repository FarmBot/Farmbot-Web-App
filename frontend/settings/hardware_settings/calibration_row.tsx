import React from "react";
import { LockableButton } from "./lockable_button";
import { axisTrackingStatus } from "./axis_tracking_status";
import { Row, Help } from "../../ui";
import { CalibrationRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { lockedClass } from "../../controls/locked_class";

export class CalibrationRow extends React.Component<CalibrationRowProps> {
  Axes = () => {
    const {
      type, botOnline, axisTitle, mcuParams, action, arduinoBusy, locked,
    } = this.props;
    return <div className="calibration-row-axes row no-gap">
      {axisTrackingStatus(mcuParams, this.props.stallUseDisabled)
        .map(row => {
          const { axis } = row;
          const hardwareDisabled = type == "zero" ? false : row.disabled;
          return <div key={axis}>
            <LockableButton
              disabled={arduinoBusy || hardwareDisabled || !botOnline}
              className={lockedClass(locked)}
              title={t(axisTitle)}
              onClick={() => action(axis)}>
              {`${t(axisTitle)} ${axis}`}
            </LockableButton>
          </div>;
        })}
    </div>;
  };

  render() {
    return <Highlight settingName={this.props.title}>
      <Row className="axes-grid">
        <div>
          <label>
            {t(this.props.title)}
          </label>
          <Help text={t(this.props.toolTip)} />
        </div>
        <this.Axes />
      </Row>
    </Highlight>;
  }
}
