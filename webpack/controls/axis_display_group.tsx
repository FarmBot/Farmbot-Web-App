import * as React from "react";
import { t } from "i18next";
import { Row, Col } from "../ui/index";
import { AxisDisplayGroupProps } from "./interfaces";
import { isNumber } from "lodash";

const Axis = ({ val }: { val: number | undefined }) => <Col xs={3}>
  <input disabled value={isNumber(val) ? val : "---"} />
</Col>;

export let AxisDisplayGroup = ({ position, label }: AxisDisplayGroupProps) => {
  const { x, y, z } = position;
  return <Row>
    <Axis val={x} />
    <Axis val={y} />
    <Axis val={z} />
    <Col xs={3}>
      <label>
        {t(label)}
      </label>
    </Col>
  </Row>;
};
