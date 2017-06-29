import * as React from "react";
import { t } from "i18next";
import { devices } from "../../device";
import { Axis } from "../interfaces";
import { ToolTips } from "../../constants";
import { Row, Col } from "../../ui/index";

const zero = (axis: Axis) => devices.current.setZero(axis);
const AXES: Axis[] = ["x", "y", "z"];

export function ZeroButton({ axis }: { axis: Axis }) {
  return <button
    className="fb-button yellow"
    onClick={() => zero(axis)}
  >
    {t("zero {{axis}}", { axis })}
  </button>;
}

export function ZeroRow() {
  return <Row>
    <Col xs={6}>
      <label>
        {t("SET ZERO POSITION")}
      </label>
      <div className="help">
        <i className="fa fa-question-circle help-icon" />
        <div className="help-text">
          {t(ToolTips.SET_ZERO_POSITION)}
        </div>
      </div>
    </Col>
    {AXES.map((axis) => {
      return <Col xs={2} key={axis}>
        <ZeroButton axis={axis} />
      </Col>
    })}
  </Row>;
}
