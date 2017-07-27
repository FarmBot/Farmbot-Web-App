import * as React from "react";
import { t } from "i18next";
import { Row, Col } from "../ui";
import { AxisDisplayGroupProps } from "./interfaces";
import { isUndefined } from "lodash";

export let AxisDisplayGroup = ({ bot, label }: AxisDisplayGroupProps) => {
  let { x, y, z } = bot.hardware.location_data.position;
  return (
    <Row>
      <Col xs={3}>
        <input
          disabled
          value={isUndefined(x) ? "" : x} />
      </Col>
      <Col xs={3}>
        <input
          disabled
          value={isUndefined(y) ? "" : y} />
      </Col>
      <Col xs={3}>
        <input
          disabled
          value={isUndefined(z) ? "" : z} />
      </Col>
      <Col xs={3}>
        <label>
          {t(label)}
        </label>
      </Col>
    </Row>
  );
};
