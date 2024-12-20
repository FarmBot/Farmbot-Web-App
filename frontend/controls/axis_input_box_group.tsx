import React from "react";
import { AxisInputBox } from "./axis_input_box";
import { Row } from "../ui";
import { AxisInputBoxGroupProps, AxisInputBoxGroupState } from "./interfaces";
import { isNumber } from "lodash";
import { Vector3 } from "farmbot";
import { t } from "../i18next_wrapper";
import { lockedClass } from "./locked_class";
import { setMovementStateFromPosition } from "../connectivity/log_handlers";

/** Coordinate input and GO button for Move widget. */
export class AxisInputBoxGroup extends
  React.Component<AxisInputBoxGroupProps, Partial<AxisInputBoxGroupState>> {
  constructor(props: AxisInputBoxGroupProps) {
    super(props);
    this.state = {};
  }

  change = (axis: keyof Vector3, val: number) => {
    this.setState({ [axis]: val });
  };

  get vector() {
    const { x, y, z } = this.state;
    const p = this.props.position;
    const x2 = p.x,
      y2 = p.y,
      z2 = p.z;

    return {
      x: isNumber(x) ? x : (x2 || 0),
      y: isNumber(y) ? y : (y2 || 0),
      z: isNumber(z) ? z : (z2 || 0)
    };
  }

  clicked = () => {
    this.props.dispatch(setMovementStateFromPosition(
      this.props.position, this.vector));
    this.props.onCommit(this.vector);
    this.setState({ x: undefined, y: undefined, z: undefined });
  };

  render() {
    const { x, y, z } = this.state;

    return <Row className="grid-4-col">
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
      <button
        onClick={this.clicked}
        disabled={this.props.disabled || false}
        title={t("Move to chosen location")}
        className={[
          "full-width green go fb-button",
          lockedClass(this.props.locked),
        ].join(" ")}>
        {t("GO")}
      </button>
    </Row>;
  }
}
