import * as React from "react";
import { Row, Col } from "../../ui";
import { ColWidth } from "./farmbot_os_settings";
import { t } from "i18next";
import { Collapse } from "@blueprintjs/core";
import { Header } from "./hardware_settings/header";
import { ShouldDisplay, Feature } from "../interfaces";

export interface DiagReportProps {
  dispatch: Function;
  expanded: boolean;
  shouldDisplay: ShouldDisplay;
}

export class SendDiagnosticReport extends React.Component<DiagReportProps, {}>{
  show = () => {
    return <section>
      <div style={{ fontSize: "1px" }}>
        <Header
          expanded={this.props.expanded}
          title={t("Diagnostic Reports")}
          name={"power_and_reset"}
          dispatch={this.props.dispatch} />
      </div>
      <Collapse isOpen={true}>
        <Row>
          <Col xs={ColWidth.label}>
            <label>
              {t("DIAGNOSTIC CHECK")}
            </label>
          </Col>
          <Col xs={6}>
            <p>...</p>
          </Col>
          <Col xs={3}>
            <button
              className="fb-button yellow"
              onClick={() => alert("TODO")}>
              {t("Record Diagnostic")}
            </button>
          </Col>
        </Row>
      </Collapse>
    </section>;
  }

  noShow = () => <div />;

  render() {
    const show = this.props.shouldDisplay(Feature.diagnostic_dumps);
    return (show ? this.show : this.noShow)();
  }
}
