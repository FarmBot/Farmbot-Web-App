import * as React from "react";
import { AxisNumberProperty, MapTransformProps } from "../../interfaces";
import { getMapSize, transformXY } from "../../util";
import { BotPosition } from "../../../../devices/interfaces";
import { Color } from "../../../../ui/index";
import { botPositionLabel } from "./bot_position_label";

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
    const { name, position, plantAreaOffset, eStopStatus, mapTransformProps
    } = this.props;
    const { xySwap } = mapTransformProps;
    const mapSize = getMapSize(mapTransformProps, plantAreaOffset);
    const positionQ = transformXY(
      (position.x || 0), (position.y || 0), mapTransformProps);
    const color = eStopStatus ? Color.virtualRed : Color.darkGray;
    const opacity = name.includes("encoder") ? 0.25 : 0.75;
    return <g id={name}>
      <rect id="gantry"
        x={xySwap ? -plantAreaOffset.x : positionQ.qx - 10}
        y={xySwap ? positionQ.qy - 10 : -plantAreaOffset.y}
        width={xySwap ? mapSize.w : 20}
        height={xySwap ? 20 : mapSize.h}
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
        dx={xySwap ? 0 : 40}
        dy={xySwap ? 55 : 0}
        dominantBaseline="central"
        textAnchor={xySwap ? "middle" : "start"}
        fontSize={24}
        fill={Color.darkGray}>
        {botPositionLabel(position)}
      </text>
    </g>;
  }
}
