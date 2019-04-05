import * as React from "react";

import { Row, Col } from "../../../ui/index";
import { t } from "../../../i18next_wrapper";

export function SpacePanelHeader(_: {}) {
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
