import React from "react";
import { moveRelative } from "../../devices/actions";
import { ButtonDirection, DirectionButtonProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { MoveRelProps } from "../../devices/interfaces";
import { lockedClass } from "../locked_class";
import { isNumber } from "lodash";
import { Popover } from "../../ui";

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

export const calcBtnStyle = (
  direction: ButtonDirection,
  remaining: number | undefined,
): React.CSSProperties => ({
  [["left", "right"].includes(direction) ? "width" : "height"]: remaining + "%",
  [direction == "up" ? "bottom" : "top"]: 0,
  [direction == "left" ? "right" : "left"]: 0,
});

interface DirectionButtonState {
  start: number | undefined;
  distance: number;
  popoverOpen: boolean;
  popoverText: string;
}

export class DirectionButton
  extends React.Component<DirectionButtonProps, DirectionButtonState> {
  state: DirectionButtonState = {
    start: undefined,
    distance: 0,
    popoverOpen: false,
    popoverText: "",
  };

  get btnActive() {
    return this.props.active == this.props.axis + this.props.direction;
  }

  sendCommand = () => {
    const { botPosition, locked, axis, arduinoBusy, botOnline } = this.props;
    !arduinoBusy && this.props.click();
    const text = () => {
      if (locked) { return t("FarmBot is locked."); }
      if (arduinoBusy) { return t("FarmBot is busy."); }
      if (!botOnline) { return t("FarmBot is offline."); }
      if (directionDisabled(this.props) && this.distance > 0) {
        return t("Axis is already at maximum position.");
      }
      if (directionDisabled(this.props) && this.distance < 0) {
        return t("Axis is already at minimum position.");
      }
      return "";
    };
    if (arduinoBusy || !botOnline || locked || directionDisabled(this.props)) {
      this.setState({
        popoverOpen: !this.state.popoverOpen,
        popoverText: text(),
      });
      return;
    }
    this.setState({ popoverOpen: false, popoverText: text() });
    const payload: MoveRelProps = { x: 0, y: 0, z: 0 };
    payload[this.props.axis] = this.distance;
    moveRelative(payload);
    this.setState({ start: botPosition[axis], distance: this.distance });
  };

  get distance() { return calculateDistance(this.props); }

  get remaining() {
    const axisPosition = this.props.botPosition[this.props.axis];
    if (!isNumber(axisPosition) || !isNumber(this.state.start)) {
      return;
    }
    return (axisPosition - this.state.start) / this.state.distance * 100;
  }

  render() {
    const { direction, axis, locked, arduinoBusy, botOnline } = this.props;
    const title = `${t("move {{axis}} axis", { axis })} (${this.distance})`;
    const style = calcBtnStyle(direction, this.remaining);
    const disabled = arduinoBusy || !botOnline || directionDisabled(this.props);
    return <button
      onClick={this.sendCommand}
      className={[
        "fb-button arrow-button radius",
        `fa fa-2x fa-arrow-${direction}`,
        axis == "z" ? "z" : "",
        lockedClass(locked),
        disabled ? "pseudo-disabled" : "",
      ].join(" ")}
      title={title}>
      <p>{this.distance > 0 ? "+" : "-"}{axis}</p>
      {(this.btnActive && this.remaining && arduinoBusy)
        ? <div className={"movement-progress"} style={style} />
        : <i />}
      <Popover
        isOpen={this.btnActive && this.state.popoverOpen}
        popoverClassName={"help movement-message"}
        target={<i />}
        content={<div className={"help-text-content"}>
          {t(this.state.popoverText)}
        </div>} />
    </button>;
  }
}
