import * as React from "react";
import { Farmbot } from "farmbot";
import { moveRelative } from "../devices/actions";
import { DirectionButtonProps, Payl } from "./interfaces";

export class DirectionButton extends React.Component<DirectionButtonProps, {}> {
  sendCommand = () => {
    const { direction, isInverted } = this.props;
    const isNegative = (direction === "up") || (direction === "right");
    const inverter = isInverted ? -1 : 1;
    const multiplier = isNegative ? -1 : 1;
    const distance = (this.props.steps || 250) * multiplier * inverter;
    const payload: Payl = { speed: Farmbot.defaults.speed, x: 0, y: 0, z: 0 };
    payload[this.props.axis] = distance;
    moveRelative(payload);
  }

  render() {
    const { direction, axis, disabled } = this.props;
    const klass = `fb-button fa fa-2x arrow-button radius fa-arrow-${direction}`;
    const title = `move ${axis} axis`;
    return <button
      onClick={this.sendCommand}
      className={klass}
      title={title}
      disabled={disabled || false} />;
  }
}
