import * as React from "react";
import { AxisInputBox } from "./axis_input_box";
import { t } from "i18next";
import { Row, Col } from "../ui/index";
import {
  AxisInputBoxGroupProps,
  AxisInputBoxGroupState,
  Vector
} from "./interfaces";
import * as _ from "lodash";

export class AxisInputBoxGroup extends
  React.Component<AxisInputBoxGroupProps, Partial<AxisInputBoxGroupState>> {
  constructor(props: AxisInputBoxGroupProps) {
    super(props);
    this.state = {};
  }

  change = (axis: keyof Vector, val: number) => {
    this.setState({ [axis]: val });
  }

  get vector() {
    const { x, y, z } = this.state;
    const p = this.props.position;
    const x2 = p.x,
      y2 = p.y,
      z2 = p.z;

    return {
      x: _.isNumber(x) ? x : (x2 || 0),
      y: _.isNumber(y) ? y : (y2 || 0),
      z: _.isNumber(z) ? z : (z2 || 0)
    };
  }

  clicked = () => {
    this.props.onCommit(this.vector);
    this.setState({ x: undefined, y: undefined, z: undefined });
  }

  render() {
    const { x, y, z } = this.state;

    return <Row>
      <AxisInputBox
        onChange={this.change}
        axis={"x"}
        value={x} />
      <AxisInputBox
        onChange={this.change}
        axis={"y"}
        value={y} />
      <AxisInputBox
        onChange={this.change}
        axis={"z"}
        value={z} />
      <Col xs={3}>
        <button
          onClick={this.clicked}
          disabled={this.props.disabled || false}
          title={t("Move to chosen location")}
          className="full-width green go fb-button" >
          {t("GO")}
        </button>
      </Col>
    </Row>;
  }
}
