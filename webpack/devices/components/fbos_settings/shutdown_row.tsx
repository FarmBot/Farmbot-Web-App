import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { Content } from "../../../constants";
import { powerOff } from "../../actions";
import { ColWidth } from "../farmbot_os_settings";

export function ShutdownRow() {
  return <Row>
    <Col xs={ColWidth.label}>
      <label>
        {t("SHUTDOWN FARMBOT")}
      </label>
    </Col>
    <Col xs={ColWidth.description}>
      <p>
        {t(Content.SHUTDOWN_FARMBOT)}
      </p>
    </Col>
    <Col xs={ColWidth.button}>
      <button
        className="fb-button red"
        type="button"
        onClick={powerOff}>
        {t("SHUTDOWN")}
      </button>
    </Col>
  </Row>;
}
