import * as React from "react";
import { Row, Col } from "../../ui";
import { TaggedDiagnosticDump } from "../../resources/tagged_resources";
import { ColWidth } from "./farmbot_os_settings";

export interface Props {
  diag: TaggedDiagnosticDump;
  dispatch: Function;
}

export class DiagnosticDumpRow extends React.Component<Props, {}> {
  render() {
    return <Row>
      <Col xs={ColWidth.label}>
        <button>destroy</button>
      </Col>
      <Col xs={6}>
        <p>Diagnostic #{this.props.diag.body.id}</p>
      </Col>
      <Col xs={3}>
        <button>download</button>
      </Col>
    </Row>;
  }
}
