import * as React from "react";
import { Col } from "../ui/index";
import { t } from "i18next";

export function SequenceEditorMiddleInactive(props: {}) {
  return (
    <Col xs={12}>
      <h4>
        <i>{t("No sequence selected.")}</i>
      </h4>
    </Col>
  );
}
