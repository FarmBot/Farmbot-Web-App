import * as React from "react";
import { Row, Col } from "../../ui";
import { TaggedDiagnosticDump } from "farmbot";
import { jsonDownload } from "../../account/request_account_export";
import { destroy } from "../../api/crud";
import { ago } from "../connectivity/status_checks";
import { t } from "i18next";

export interface Props {
  diag: TaggedDiagnosticDump;
  dispatch: Function;
}

export class DiagnosticDumpRow extends React.Component<Props, {}> {
  get ticket() { return this.props.diag.body.ticket_identifier; }

  get age() { return ago(this.props.diag.body.created_at); }

  destroy = () => this.props.dispatch(destroy(this.props.diag.uuid));

  download = (e: React.MouseEvent<{}>) => {
    e.preventDefault();
    const { body } = this.props.diag;
    const { ticket_identifier } = body;
    const fileName = `farmbot_diagnostics_${ticket_identifier}.json`;
    jsonDownload(body, fileName);
  }

  render() {
    return <Row>
      <Col xs={3}>
        <button
          className="green fb-button"
          onClick={this.download}>
          {t("Download")}
        </button>
      </Col>
      <Col xs={8}>
        {t("Report {{ticket}} (Saved {{age}})",
          { ticket: this.ticket, age: this.age })}
      </Col>
      <Col xs={1}>
        <button
          className="red fb-button del-button"
          onClick={this.destroy}>
          <i className="fa fa-times" />
        </button>
      </Col>
    </Row >;
  }
}
