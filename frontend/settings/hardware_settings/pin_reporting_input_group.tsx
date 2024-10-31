import React from "react";
import { PinReportingMCUInputGroupProps } from "./interfaces";
import { Row, Help } from "../../ui";
import { t } from "../../i18next_wrapper";
import { PinNumberDropdown } from "./pin_number_dropdown";
import { ToolTips } from "../../constants";
import { Highlight } from "../maybe_highlight";

export class PinReportingMCUInputGroup
  extends React.Component<PinReportingMCUInputGroupProps> {

  Number = () =>
    <PinNumberDropdown
      pinNumKey={this.props.pinNumKey}
      dispatch={this.props.dispatch}
      resources={this.props.resources}
      disabled={this.props.disabled}
      sourceFwConfig={this.props.sourceFwConfig} />;

  render() {
    const { label } = this.props;
    return <Highlight settingName={label}>
      <Row className="grid-2-col">
        <div className="row grid-exp-2">
          <label>
            {t(label)}
          </label>
          <Help text={ToolTips.PIN_REPORTING_PIN_NUMBER} />
        </div>
        <this.Number />
      </Row>
    </Highlight>;
  }
}
