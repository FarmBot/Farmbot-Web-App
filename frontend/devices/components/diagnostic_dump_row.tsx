import * as React from "react";
import { Row, Col } from "../../ui";
import { TaggedDiagnosticDump } from "farmbot";
import { destroy } from "../../api/crud";
import { ago } from "../connectivity/status_checks";
import { t } from "../../i18next_wrapper";

export interface Props {
  diag: TaggedDiagnosticDump;
  dispatch: Function;
}

export class DiagnosticDumpRow extends React.Component<Props, {}> {
  get ticket() { return this.props.diag.body.ticket_identifier; }

  get age() { return ago(new Date(this.props.diag.body.created_at).getTime()); }

  destroy = () => this.props.dispatch(destroy(this.props.diag.uuid));

  render() {
    return <Row>
      <Col xsOffset={3} xs={8}>
        {t("Report {{ticket}} (Saved {{age}})", {
          ticket: this.ticket, age: this.age
        })}
      </Col>
      <Col xs={1}>
        <button
          className="red fb-button del-button"
          title={t("Delete")}
          onClick={this.destroy}>
          <i className="fa fa-times" />
        </button>
      </Col>
    </Row>;
  }
}
