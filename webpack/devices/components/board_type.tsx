import * as React from "react";
import { Row, Col } from "../../ui/index";
import { t } from "i18next";

export interface BoardTypeProps {
  currentFWVersion: string | undefined;
}

export class BoardType
  extends React.Component<BoardTypeProps, {}> {

  getBoardType() {
    if (this.props.currentFWVersion) {
      const boardIdentifier = this.props.currentFWVersion.slice(-1);
      switch (boardIdentifier) {
        case "R":
          return "Arduino/RAMPS";
        case "F":
          return "Farmduino";
        default:
          return "unknown";
      }
    } else {
      return "unknown";
    }
  }

  render() {
    return <Row>
      <Col xs={2}>
        <label>
          {t("HARDWARE")}
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
