import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import { ReadPin } from "farmbot";

interface PeripheralSelectionProps {
  value: ReadPin
}

const CHECKBOX_ID = "peripheral";

export function PeripheralSelection(p: PeripheralSelectionProps) {
  return <Row>
    <Col xs={6} md={3}>
      <label htmlFor={CHECKBOX_ID}>
        <input type="checkbox"
          id={CHECKBOX_ID}
          onChange={() => console.log("OK")}
          checked={true} />
        {t(" Use peripheral value")}
      </label>
    </Col>
  </Row>;
}
