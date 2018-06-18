import * as React from "react";
import { Row, Col } from "../../ui";
import { ColWidth } from "./farmbot_os_settings";
import { t } from "i18next";

export class SendDiagnosticReport extends React.Component<{}, {}>{
  render() {
    return <Row>
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
    </Row >;
  }
}
