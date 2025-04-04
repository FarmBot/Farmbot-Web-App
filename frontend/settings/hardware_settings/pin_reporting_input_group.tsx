import React from "react";
import { PinReportingMCUInputGroupProps } from "./interfaces";
import { Row, Help } from "../../ui";
import { t } from "../../i18next_wrapper";
import { PinNumberDropdown } from "./pin_number_dropdown";
import { ToolTips } from "../../constants";
import { Highlight } from "../maybe_highlight";

export const PinReportingMCUInputGroup = (props: PinReportingMCUInputGroupProps) =>
  <Highlight settingName={props.label}>
    <Row className="grid-2-col">
      <div className="row grid-exp-2">
        <label>
          {t(props.label)}
        </label>
        <Help text={ToolTips.PIN_REPORTING_PIN_NUMBER} />
      </div>
      <PinNumberDropdown
        pinNumKey={props.pinNumKey}
        dispatch={props.dispatch}
        resources={props.resources}
        disabled={props.disabled}
        sourceFwConfig={props.sourceFwConfig} />
    </Row>
  </Highlight>;
