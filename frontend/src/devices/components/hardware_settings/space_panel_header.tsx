import * as React from "react";
import { t } from "i18next";
import { Row, Col } from "../../../ui/index";
import { JSXChildren } from "../../../util";

interface SpacePanelHeaderProps {
  children?: JSXChildren;
}

export function SpacePanelHeader({ children }: SpacePanelHeaderProps) {
  return <Row>
    <Col xs={2} xsOffset={6}>
      <label>
        {t("X AXIS")}
      </label>
    </Col>
    <Col xs={2}>
      <label>
        {t("Y AXIS")}
      </label>
    </Col>
    <Col xs={2}>
      <label>
        {t("Z AXIS")}
      </label>
    </Col>
  </Row>
}
