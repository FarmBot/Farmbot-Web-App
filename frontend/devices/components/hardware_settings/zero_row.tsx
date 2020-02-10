import * as React from "react";
import { getDevice } from "../../../device";
import { Axis } from "../../interfaces";
import { ToolTips } from "../../../constants";
import { Row, Col, Help } from "../../../ui/index";
import { ZeroRowProps } from "../interfaces";
import { commandErr } from "../../actions";
import { t } from "../../../i18next_wrapper";
import { Position } from "@blueprintjs/core";

const zero =
  (axis: Axis) => getDevice().setZero(axis).catch(commandErr("Zeroing"));
const AXES: Axis[] = ["x", "y", "z"];

export function ZeroButton(props: { axis: Axis; disabled: boolean; }) {
  const { axis, disabled } = props;
  return <button
    className="fb-button yellow"
    disabled={disabled}
    onClick={() => zero(axis)}>
    {t("zero {{axis}}", { axis })}
  </button>;
}

export function ZeroRow({ botDisconnected }: ZeroRowProps) {
  return <Row>
    <Col xs={6} className={"widget-body-tooltips"}>
      <label>
        {t("SET ZERO POSITION")}
      </label>
      <Help text={ToolTips.SET_ZERO_POSITION} requireClick={true}
        position={Position.RIGHT} />
    </Col>
    {AXES.map((axis) => {
      return <Col xs={2} key={axis} className={"centered-button-div"}>
        <ZeroButton axis={axis} disabled={botDisconnected} />
      </Col>;
    })}
  </Row>;
}
