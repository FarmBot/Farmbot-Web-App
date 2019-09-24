import * as React from "react";
import { getDevice } from "../../../device";
import { Axis } from "../../interfaces";
import { ToolTips } from "../../../constants";
import { Row, Col } from "../../../ui/index";
import { ZeroRowProps } from "../interfaces";
import { commandErr } from "../../actions";
import { t } from "../../../i18next_wrapper";

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
      return <Col xs={2} key={axis} className={"centered-button-div"}>
        <ZeroButton axis={axis} disabled={botDisconnected} />
      </Col>;
    })}
  </Row>;
}
