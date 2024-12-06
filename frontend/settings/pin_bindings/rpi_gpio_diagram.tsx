import React from "react";
import { Color } from "../../ui/colors";
import { reservedPiGPIO } from "./list_and_label_support";
import { range, isNumber, includes, noop } from "lodash";

export interface RpiGpioDiagramProps {
  boundPins: number[] | undefined;
  setSelectedPin(pin: number | undefined): void;
  selectedPin: number | undefined;
}

interface RpiGpioDiagramState {
  hoveredPin: string | number | undefined;
}

export const gpio = [
  ["3.3v", "5v"],
  [2, "5v"],
  [3, "GND"],
  [4, 14],
  ["GND", 15],
  [17, 18],
  [27, "GND"],
  [22, 23],
  ["3.3v", 24],
  [10, "GND"],
  [9, 25],
  [11, 8],
  ["GND", 7],
  [0, 1],
  [5, "GND"],
  [6, 12],
  [13, "GND"],
  [19, 16],
  [26, 20],
  ["GND", 21],
];

export class RpiGpioDiagram
  extends React.Component<RpiGpioDiagramProps, RpiGpioDiagramState> {
  state: RpiGpioDiagramState = { hoveredPin: undefined };

  hover = (hovered: number | string | undefined) =>
    () => this.setState({ hoveredPin: hovered });

  render() {
    return <svg
      id="rpi-gpio"
      width="100%"
      height="100%"
      style={{ maxHeight: "300px", maxWidth: "50px" }}
      viewBox="0 0 10 62">
      <rect strokeWidth={1} stroke={"green"} fill={"green"}
        x={-7} y={1} width={15} height={60} rx={3} ry={3} />
      <circle fill={Color.gray} strokeWidth={1.5} stroke={"yellow"}
        cx={5} cy={4} r={2} />
      {[3, 5.5].map((x, xi) => {
        return range(8, 56, 2.5).map((y, yi) => {
          const pin = gpio[yi][xi];
          const normalColor = () => {
            switch (pin) {
              case "GND":
                return Color.black;
              case "5v":
                return Color.red;
              case "3.3v":
                return Color.orange;
              case this.state.hoveredPin:
              case this.props.selectedPin:
                return Color.white;
              default:
                return Color.green;
            }
          };
          const color = isNumber(pin) && reservedPiGPIO.includes(pin)
            ? Color.magenta
            : normalColor();
          const pinColor = includes(this.props.boundPins, pin)
            ? Color.darkGray
            : color;
          return <rect strokeWidth={0.5} key={`gpio_${pin}_${xi}_${yi}`}
            stroke={pinColor} fill={pinColor}
            x={x} y={y} width={1.5} height={1.5}
            onMouseEnter={this.hover(pin)}
            onMouseLeave={this.hover(undefined)}
            onClick={() =>
              isNumber(pin) ? this.props.setSelectedPin(pin) : noop} />;
        });
      })}
      <rect fill={Color.white}
        x={-1} y={58} width={10} height={10} />
      <text x={4.5} y={62} textAnchor={"middle"} fontSize={3}>
        {this.state.hoveredPin}
      </text>
    </svg>;
  }
}
