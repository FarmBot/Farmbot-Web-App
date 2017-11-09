import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { Content } from "../../../constants";
import { powerOff } from "../../actions";

export function ShutdownRow() {
  return <Row>
    <Col xs={2}>
      <label>
        {t("SHUTDOWN FARMBOT")}
      </label>
    </Col>
    <Col xs={7}>
      <p>
        {t(Content.SHUTDOWN_FARMBOT)}
      </p>
    </Col>
    <Col xs={3}>
      <button
        className="fb-button red"
        type="button"
        onClick={powerOff}>
        {t("SHUTDOWN")}
      </button>
    </Col>
  </Row>;
}
