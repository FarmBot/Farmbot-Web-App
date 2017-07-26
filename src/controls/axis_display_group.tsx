import * as React from "react";
import { t } from "i18next";
import { Row, Col } from "../ui";
import { AxisDisplayGroupProps } from "./interfaces";

export let AxisDisplayGroup = ({ bot, label }: AxisDisplayGroupProps) => {
  let [x, y, z] = bot.hardware.location;
  return (
    <Row>
      <Col xs={3}>
        <input
          disabled
          value={x}
        />
      </Col>
      <Col xs={3}>
        <input
          disabled
          value={y}
        />
      </Col>
      <Col xs={3}>
        <input
          disabled
          value={z}
        />
      </Col>
      <Col xs={3}>
        <label>
          {t(label)}
        </label>
      </Col>
    </Row>
  );
};
