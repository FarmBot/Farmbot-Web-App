import * as React from "react";
import { Row, Col } from "../../ui/index";
import { t } from "i18next";

export interface BoardTypeProps {
  firmwareVersion: string | undefined;
}

export class BoardType
  extends React.Component<BoardTypeProps, {}> {

  getBoardType() {
    if (this.props.firmwareVersion) {
      const boardIdentifier = this.props.firmwareVersion.slice(-1);
      switch (boardIdentifier) {
        case "R":
          return "Arduino/RAMPS";
        case "F":
          return "Farmduino";
        default:
          return "Present";
      }
    } else {
      return "unknown";
    }
  }

  render() {
    return <Row>
      <Col xs={2}>
        <label>
          {t("FIRMWARE")}
        </label>
      </Col>
      <Col xs={7}>
        <p>
          {this.getBoardType()}
        </p>
      </Col>
    </Row>;
  }
}
