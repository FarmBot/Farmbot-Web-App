import * as React from "react";
import { Row, Col } from "../ui/index";
import { AxisDisplayGroupProps } from "./interfaces";
import { isNumber } from "lodash";
import { t } from "../i18next_wrapper";
import { Xyz } from "farmbot";

const Axis = ({ axis, val }: { val: number | undefined, axis: Xyz }) =>
  <Col xs={3}>
    <input disabled name={axis} value={isNumber(val) ? val : "---"} />
  </Col>;

export const AxisDisplayGroup = ({ position, label }: AxisDisplayGroupProps) => {
  const { x, y, z } = position;
  return <Row>
    <Axis axis={"x"} val={x} />
    <Axis axis={"y"} val={y} />
    <Axis axis={"z"} val={z} />
    <Col xs={3}>
      <label>
        {t(label)}
      </label>
    </Col>
  </Row>;
};
