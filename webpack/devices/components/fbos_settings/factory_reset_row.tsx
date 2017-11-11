import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { Content } from "../../../constants";
import { factoryReset } from "../../actions";

export function FactoryResetRow() {
  return <Row>
    <Col xs={2}>
      <label>
        {t("Factory Reset")}
      </label>
    </Col>
    <Col xs={7}>
      <p>
        {t(Content.FACTORY_RESET_WARNING)}
      </p>
    </Col>
    <Col xs={3}>
      <button
        className="fb-button red"
        type="button"
        onClick={factoryReset}>
        {t("FACTORY RESET")}
      </button>
    </Col>
  </Row>;
}
