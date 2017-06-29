import * as React from "react";
import { Farmbot } from "farmbot";
import { moveRelative } from "../devices/actions";
import { DirectionButtonProps, Payl } from "./interfaces";

export class DirectionButton extends React.Component<DirectionButtonProps, {}> {
  sendCommand = () => {
    let { direction, isInverted } = this.props;
    let isNegative = (direction === "up") || (direction === "right");
    let inverter = isInverted ? -1 : 1;
    let multiplier = isNegative ? -1 : 1;
    let distance = (this.props.steps || 250) * multiplier * inverter;
    let payload: Payl = { speed: Farmbot.defaults.speed, x: 0, y: 0, z: 0 };
    payload[this.props.axis] = distance;
    moveRelative(payload);
  }

  render() {
    let { direction, axis } = this.props;
    let klass = `fb-button fa fa-2x arrow-button radius fa-arrow-${direction}`;
    let title = `move ${axis} axis`;
    return <button
      onClick={this.sendCommand}
      className={klass}
      title={title}
    />
  }
}
