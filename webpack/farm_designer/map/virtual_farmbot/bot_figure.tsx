import * as React from "react";
import { AxisNumberProperty, MapTransformProps } from "../interfaces";
import { getMapSize, getXYFromQuadrant } from "../util";
import { BotPosition } from "../../../devices/interfaces";
import { Color } from "../../../ui/index";

export interface BotFigureProps {
  name: string;
  position: BotPosition;
  mapTransformProps: MapTransformProps;
  plantAreaOffset: AxisNumberProperty;
  eStopStatus?: boolean;
}

interface BotFigureState {
  hovered: boolean;
}

export class BotFigure extends
  React.Component<BotFigureProps, BotFigureState> {
  state: BotFigureState = { hovered: false };

  setHover = (state: boolean) => { this.setState({ hovered: state }); };

  render() {
    const { name, position, plantAreaOffset, eStopStatus } = this.props;
    const { quadrant, gridSize } = this.props.mapTransformProps;
    const mapSize = getMapSize(gridSize, plantAreaOffset);
    const positionQ = getXYFromQuadrant(
      (position.x || 0), (position.y || 0), quadrant, gridSize);
    const color = eStopStatus ? Color.virtualRed : Color.darkGray;
    const opacity = name.includes("encoder") ? 0.25 : 0.75;
    return <g id={name}>
      <rect id="gantry"
        x={positionQ.qx - 10}
        y={-plantAreaOffset.y
        }
        width={20}
        height={mapSize.y}
        fillOpacity={opacity}
        fill={color} />
      <circle id="UTM"
        onMouseOver={() => this.setHover(true)}
        onMouseLeave={() => this.setHover(false)}
        cx={positionQ.qx}
        cy={positionQ.qy}
        r={35}
        fillOpacity={opacity}
        fill={color} />
      <text
        visibility={this.state.hovered ? "visible" : "hidden"}
        x={positionQ.qx}
        y={positionQ.qy}
        dx={35}
        dy={0}
        fontSize={24}
        fill={Color.darkGray}>
        {`(${position.x}, ${position.y}, ${position.z})`}
      </text>
    </g>;
  }
}
