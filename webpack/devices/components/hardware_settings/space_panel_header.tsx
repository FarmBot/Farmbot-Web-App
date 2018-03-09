import * as React from "react";
import { t } from "i18next";
import { Row, Col } from "../../../ui/index";

export function SpacePanelHeader(props: {}) {
  return <Row>
    <Col xs={2} xsOffset={6} className={"centered-button-div"}>
      <label>
        {t("X AXIS")}
      </label>
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <label>
        {t("Y AXIS")}
      </label>
    </Col>
    <Col xs={2} className={"centered-button-div"}>
      <label>
        {t("Z AXIS")}
      </label>
    </Col>
  </Row>;
}
