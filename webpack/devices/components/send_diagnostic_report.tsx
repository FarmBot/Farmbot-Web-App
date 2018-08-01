import * as React from "react";
import { Row, Col } from "../../ui";
import { ColWidth } from "./farmbot_os_settings";
import { t } from "i18next";
import { Collapse } from "@blueprintjs/core";
import { Header } from "./hardware_settings/header";
import { ShouldDisplay, Feature } from "../interfaces";
import { TaggedDiagnosticDump } from "farmbot";
import { DiagnosticDumpRow } from "./diagnostic_dump_row";
import { requestDiagnostic } from "../actions";
import { Content } from "../../constants";

export interface DiagReportProps {
  dispatch: Function;
  expanded: boolean;
  shouldDisplay: ShouldDisplay;
  diagnostics: TaggedDiagnosticDump[];
}

export class SendDiagnosticReport extends React.Component<DiagReportProps, {}> {
  show = () => {
    return <section>
      <div style={{ fontSize: "1px" }}>
        <Header
          expanded={this.props.expanded}
          title={t("Diagnostic Reports")}
          name={Feature.diagnostic_dumps}
          dispatch={this.props.dispatch} />
      </div>
      <Collapse isOpen={this.props.expanded}>
        <Row>
          <Col xs={ColWidth.label}>
            <label>
              {t("DIAGNOSTIC CHECK")}
            </label>
          </Col>
          <Col xs={6}>
            <p>{t(Content.DIAGNOSTIC_CHECK)}</p>
          </Col>
          <Col xs={3}>
            <button
              className="fb-button yellow"
              onClick={requestDiagnostic}>
              {t("Record Diagnostic")}
            </button>
          </Col>
        </Row>
        <hr />
        {this.props.diagnostics.map(d => {
          return <DiagnosticDumpRow
            key={d.uuid}
            diag={d}
            dispatch={this.props.dispatch} />;
        })}
      </Collapse>
    </section>;
  }

  noShow = () => <div />;

  render() {
    const show = this.props.shouldDisplay(Feature.diagnostic_dumps);
    return (show ? this.show : this.noShow)();
  }
}
