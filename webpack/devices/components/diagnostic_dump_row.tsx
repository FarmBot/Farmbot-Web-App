import * as React from "react";
import { Row, Col } from "../../ui";
import { TaggedDiagnosticDump } from "../../resources/tagged_resources";
import { jsonDownload } from "../../account/request_account_export";
import { destroy } from "../../api/crud";
import { ago } from "../connectivity/status_checks";

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
      <Col xs={1}>
        <span>
          <button
            className="red fb-button del-button"
            onClick={this.destroy}>
            <i className="fa fa-times" />
          </button>
        </span>
      </Col>
      <Col xs={11}>
        <a onClick={this.download} className="panel-link">
          Download diagnostic report {this.ticket} (Saved {this.age})
        </a>
      </Col>
    </Row >;
  }
}
