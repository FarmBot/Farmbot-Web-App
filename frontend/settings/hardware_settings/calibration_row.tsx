import React from "react";
import { LockableButton } from "./lockable_button";
import { axisTrackingStatus } from "./axis_tracking_status";
import { Row, Help } from "../../ui";
import { CalibrationRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { lockedClass } from "../../controls/locked_class";

export const CalibrationRow = (props: CalibrationRowProps) => {
  const {
    type, botOnline, axisTitle, mcuParams, action, arduinoBusy, locked,
  } = props;
  return <Highlight settingName={props.title}>
    <Row className="axes-grid">
      <div>
        <label>
          {t(props.title)}
        </label>
        <Help text={t(props.toolTip)} />
      </div>
      <div className="calibration-row-axes row no-gap">
        {axisTrackingStatus(mcuParams, props.stallUseDisabled)
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
      </div>
    </Row>
  </Highlight>;
};
