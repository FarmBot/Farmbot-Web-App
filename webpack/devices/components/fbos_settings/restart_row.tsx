import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { Content } from "../../../constants";
import { reboot } from "../../actions";
import { ColWidth } from "../farmbot_os_settings";

export function RestartRow({ botOnline }: { botOnline: boolean }) {
  return <Row>
    <Col xs={ColWidth.label}>
      <label>
        {t("RESTART FARMBOT")}
      </label>
    </Col>
    <Col xs={ColWidth.description}>
      <p>
        {t(Content.RESTART_FARMBOT)}
      </p>
    </Col>
    <Col xs={ColWidth.button}>
      <button
        className="fb-button yellow"
        type="button"
        onClick={reboot}
        disabled={!botOnline}>
        {t("RESTART")}
      </button>
    </Col>
  </Row>;
}
