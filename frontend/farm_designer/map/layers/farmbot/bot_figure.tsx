import * as React from "react";
import { AxisNumberProperty, MapTransformProps } from "../../interfaces";
import { getMapSize, transformXY } from "../../util";
import { BotPosition } from "../../../../devices/interfaces";
import { Color } from "../../../../ui/index";
import { botPositionLabel } from "./bot_position_label";
import { Tool } from "../tool_slots/tool_graphics";
import { reduceToolName } from "../tool_slots/tool_slot_point";
import { noop } from "lodash";

export interface BotFigureProps {
  name: string;
  position: BotPosition;
  mapTransformProps: MapTransformProps;
  plantAreaOffset: AxisNumberProperty;
  eStopStatus?: boolean;
  mountedToolName?: string | undefined;
}

interface BotFigureState {
  hovered: boolean;
}

export class BotFigure extends
  React.Component<BotFigureProps, BotFigureState> {
  state: BotFigureState = { hovered: false };

  setHover = (state: boolean) => { this.setState({ hovered: state }); };

  render() {
    const {
      name, position, plantAreaOffset, eStopStatus, mapTransformProps,
    } = this.props;
    const { xySwap } = mapTransformProps;
    const mapSize = getMapSize(mapTransformProps, plantAreaOffset);
    const positionQ = transformXY(
      (position.x || 0), (position.y || 0), mapTransformProps);
    const color = eStopStatus ? Color.virtualRed : Color.darkGray;
    const opacity = name.includes("encoder") ? 0.25 : 0.5;
    const toolProps = {
      x: positionQ.qx,
      y: positionQ.qy,
      hovered: this.state.hovered,
      dispatch: noop,
      uuid: "utm",
      xySwap,
    };
    return <g id={name}>
      <rect id="gantry"
        x={xySwap ? -plantAreaOffset.x : positionQ.qx - 10}
        y={xySwap ? positionQ.qy - 10 : -plantAreaOffset.y}
        width={xySwap ? mapSize.w : 20}
        height={xySwap ? 20 : mapSize.h}
        fillOpacity={opacity}
        fill={color} />
      <g id="UTM-wrapper" style={{ pointerEvents: "all" }}
        onMouseOver={() => this.setHover(true)}
        onMouseLeave={() => this.setHover(false)}
        fillOpacity={opacity}
        fill={color}>
        {this.props.mountedToolName
          ? <g id="mounted-tool">
            <circle
              cx={positionQ.qx}
              cy={positionQ.qy}
              r={32}
              stroke={Color.darkGray}
              strokeWidth={6}
              opacity={0.25}
              fill={"none"} />
            <Tool
              tool={reduceToolName(this.props.mountedToolName)}
              toolProps={toolProps} />
          </g>
          : <circle id="UTM"
            cx={positionQ.qx}
            cy={positionQ.qy}
            r={35}
            fillOpacity={opacity}
            fill={color} />}
      </g>
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
