import React from "react";
import { t } from "../../i18next_wrapper";
import { Color } from "../../ui/colors";
import { FirmwareHardware } from "farmbot";
import { hasExtraButtons } from "../firmware/firmware_hardware_support";

export interface BoxTopGpioDiagramProps {
  boundPins: number[] | undefined;
  setSelectedPin(pin: number | undefined): void;
  selectedPin: number | undefined;
  firmwareHardware: FirmwareHardware | undefined;
}

interface BoxTopGpioDiagramState {
  hoveredPin: number | undefined;
}

export const CIRCLES = (firmwareHardware: FirmwareHardware | undefined) => [
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 20, cy: 20, r: 7, pin: 20, label: t("Button 5"), color: Color.white }]
    : []),
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 40, cy: 20, r: 7, pin: 5, label: t("Button 4"), color: Color.white }]
    : []),
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 60, cy: 20, r: 7, pin: 26, label: t("Button 3"), color: Color.white }]
    : []),
  { cx: 80, cy: 20, r: 7, pin: 22, label: t("Button 2"), color: Color.yellow },
  { cx: 100, cy: 20, r: 7, pin: 16, label: t("Button 1"), color: Color.red },
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 30, cy: 38, r: 4, pin: 0, label: t("LED 4"), color: Color.white }]
    : []),
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 50, cy: 38, r: 4, pin: 0, label: t("LED 3"), color: Color.white }]
    : []),
  { cx: 70, cy: 38, r: 4, pin: 0, label: t("Connection"), color: Color.blue },
  { cx: 90, cy: 38, r: 4, pin: 0, label: t("Sync LED"), color: Color.green },
];

interface ButtonProps {
  cx: number;
  cy: number;
  r: number;
  pin: number;
  label: string;
  color: Color;
  hover(hovered: number | undefined): () => void;
  hovered: boolean;
  bound: boolean;
  setSelectedPin(pin: number | undefined): void;
}

const Button = (props: ButtonProps) => {
  const { pin, color, cx, cy, r } = props;
  const hovered = props.hovered && !props.bound;
  return <g id={"button"} style={{ cursor: "pointer" }}
    onMouseEnter={props.hover(pin)}
    onMouseLeave={props.hover(undefined)}
    onClick={() => pin && props.setSelectedPin(pin)}>
    <text x={cx} y={r > 4 ? 5 : 50}
      textAnchor={"middle"} fontSize={3}
      fontWeight={hovered ? "bold" : "normal"}>
      {props.label}
    </text>
    {r > 4 &&
      <text x={cx} y={8} textAnchor={"middle"} fontSize={2}>
        {props.bound ? t("IN USE") : t("AVAILABLE")}
      </text>}
    <circle fill={"none"} strokeWidth={4}
      stroke={hovered ? Color.darkGray : Color.gray}
      cx={cx} cy={cy} r={r} />
    {r > 4
      ? <circle fill={hovered ? Color.darkGray : Color.gray}
        strokeWidth={2} stroke={color}
        cx={cx} cy={cy} r={r - 1} />
      : <circle fill={color} strokeWidth={0}
        cx={cx} cy={cy} r={r - 1} />}
  </g>;
};

export class BoxTopGpioDiagram
  extends React.Component<BoxTopGpioDiagramProps, BoxTopGpioDiagramState> {
  state: BoxTopGpioDiagramState = { hoveredPin: undefined };

  hover = (hovered: number | undefined) =>
    () => hovered && this.setState({ hoveredPin: hovered });

  render() {
    return <svg id={"box-top-gpio"}
      width={"100%"} height={"100%"} viewBox={"0 0 120 52"}
      style={{ maxHeight: "300px", maxWidth: "500px" }}>
      {CIRCLES(this.props.firmwareHardware).map(circle =>
        <Button key={circle.cx}
          cx={circle.cx} cy={circle.cy} r={circle.r} color={circle.color}
          hover={this.hover} hovered={(this.state.hoveredPin == circle.pin)
            || (this.props.selectedPin == circle.pin)}
          pin={circle.pin} label={circle.label}
          bound={!!this.props.boundPins?.includes(circle.pin)}
          setSelectedPin={this.props.setSelectedPin} />)}
    </svg>;
  }
}
