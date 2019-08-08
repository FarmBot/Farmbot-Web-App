import * as React from "react";
import { Col, Row } from "../../ui";
import { t } from "../../i18next_wrapper";

export function ToolBayHeader() {
  return <Row>
    <Col xs={1}>
      <label>{t("Slot")}</label>
    </Col>
    <Col xs={2}>
      <label>{t("X")}</label>
    </Col>
    <Col xs={2}>
      <label>{t("Y")}</label>
    </Col>
    <Col xs={2}>
      <label>{t("Z")}</label>
    </Col>
    <Col xs={4}>
      <label>{t("Tool or Seed Container")}</label>
    </Col>
  </Row>;
}
