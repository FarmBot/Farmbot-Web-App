import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { Content } from "../../../constants";
import { reboot } from "../../actions";

export function RestartRow() {
  return <Row>
    <Col xs={2}>
      <label>
        {t("RESTART FARMBOT")}
      </label>
    </Col>
    <Col xs={7}>
      <p>
        {t(Content.RESTART_FARMBOT)}
      </p>
    </Col>
    <Col xs={3}>
      <button
        className="fb-button yellow"
        type="button"
        onClick={reboot}>
        {t("RESTART")}
      </button>
    </Col>
  </Row>;
}
