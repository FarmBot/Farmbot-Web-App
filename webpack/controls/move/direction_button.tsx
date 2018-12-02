import * as React from "react";
import { moveRelative } from "../../devices/actions";
import { DirectionButtonProps, Payl } from "./interfaces";
import { CONFIG_DEFAULTS } from "farmbot/dist/config";
import { t } from "i18next";

export function directionDisabled(props: DirectionButtonProps): boolean {
  const {
    stopAtHome, stopAtMax, axisLength, position, isInverted, negativeOnly
  } = props.directionAxisProps;
  const { direction } = props;
  const loc = position || 0;
  const jog = calculateDistance(props);
  const directionDisableHome = stopAtHome && loc === 0 &&
    (negativeOnly ? jog > 0 : jog < 0);
  const directionDisableEnd = stopAtMax && axisLength > 0 &&
    Math.abs(loc) === axisLength && Math.abs(loc + jog) > axisLength;
  switch (direction) {
    case "left":
    case "down":
      return (isInverted === negativeOnly)
        ? directionDisableHome
        : directionDisableEnd;
    case "right":
    case "up":
      return (isInverted === !negativeOnly)
        ? directionDisableHome
        : directionDisableEnd;
  }
}

export function calculateDistance(props: DirectionButtonProps) {
  const { direction } = props;
  const { isInverted } = props.directionAxisProps;
  const isNegative = (direction === "down") || (direction === "left");
  const inverter = isInverted ? -1 : 1;
  const multiplier = isNegative ? -1 : 1;
  const distance = props.steps * multiplier * inverter;
  return distance;
}

export class DirectionButton extends React.Component<DirectionButtonProps, {}> {
  sendCommand = () => {
    const payload: Payl = { speed: CONFIG_DEFAULTS.speed, x: 0, y: 0, z: 0 };
    payload[this.props.axis] = calculateDistance(this.props);
    moveRelative(payload);
  }

  render() {
    const { direction, axis, disabled } = this.props;
    const klass = `fb-button fa fa-2x arrow-button radius fa-arrow-${direction}`;
    const distance = calculateDistance(this.props);
    const title = `${t("move {{axis}} axis", { axis })} (${distance})`;
    return <button
      onClick={this.sendCommand}
      className={klass}
      title={title}
      disabled={disabled || directionDisabled(this.props)} />;
  }
}
