import * as React from "react";
import { AxisNumberProperty, MapTransformProps } from "../../interfaces";
import { getMapSize, transformXY } from "../../util";
import { BotPosition } from "../../../../devices/interfaces";
import { Color } from "../../../../ui/index";
import { botPositionLabel } from "./bot_position_label";
import {
  RotatedTool, ToolGraphicProps, ThreeInOneToolHead,
} from "../tool_slots/tool_graphics";
import { reduceToolName } from "../tool_slots/tool_slot_point";
import { noop } from "lodash";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { MountedToolInfo } from "../../../interfaces";

export interface BotFigureProps {
  figureName: string;
  position: BotPosition;
  mapTransformProps: MapTransformProps;
  plantAreaOffset: AxisNumberProperty;
  eStopStatus?: boolean;
  mountedToolInfo?: MountedToolInfo;
}

interface BotFigureState {
  hovered: boolean;
}

export class BotFigure extends
  React.Component<BotFigureProps, BotFigureState> {
  state: BotFigureState = { hovered: false };

  setHover = (state: boolean) => { this.setState({ hovered: state }); };

  getToolProps(positionQ: { qx: number, qy: number }): ToolGraphicProps {
    return {
      x: positionQ.qx,
      y: positionQ.qy,
      hovered: this.state.hovered,
      dispatch: noop,
      uuid: "utm",
      toolTransformProps: {
        xySwap: this.props.mapTransformProps.xySwap,
        quadrant: this.props.mapTransformProps.quadrant,
      },
      pulloutDirection: this.props.mountedToolInfo?.pulloutDirection
        || ToolPulloutDirection.POSITIVE_X,
      flipped: !!this.props.mountedToolInfo?.flipped,
    };
  }

  get color() {
    return this.props.eStopStatus ? Color.virtualRed : Color.darkGray;
  }

  get opacity() { return this.props.figureName.includes("encoder") ? 0.25 : 0.5; }

  get positionQ() {
    return transformXY(
      (this.props.position.x || 0),
      (this.props.position.y || 0),
      this.props.mapTransformProps);
  }

  MountedTool = ({ toolName }: { toolName: string | undefined }) =>
    <g id="mounted-tool">
      <RotatedTool
        tool={reduceToolName(toolName)}
        toolProps={this.getToolProps(this.positionQ)} />
      <circle
        cx={this.positionQ.qx}
        cy={this.positionQ.qy}
        r={32}
        stroke={this.color}
        strokeWidth={6}
        opacity={0.8}
        fill={"none"} />
    </g>

  UTM = () =>
    !this.props.mountedToolInfo?.noUTM
      ? <circle id="UTM"
        cx={this.positionQ.qx}
        cy={this.positionQ.qy}
        r={35}
        fillOpacity={this.opacity}
        fill={this.color} />
      : <ThreeInOneToolHead
        x={this.positionQ.qx}
        y={this.positionQ.qy}
        toolTransformProps={this.props.mapTransformProps}
        pulloutDirection={ToolPulloutDirection.POSITIVE_X}
        color={this.color} />

  render() {
    const { figureName, position, plantAreaOffset, mapTransformProps,
    } = this.props;
    const { xySwap } = mapTransformProps;
    const mapSize = getMapSize(mapTransformProps, plantAreaOffset);
    return <g id={figureName}>
      <rect id="gantry"
        x={xySwap ? -plantAreaOffset.x : this.positionQ.qx - 10}
        y={xySwap ? this.positionQ.qy - 10 : -plantAreaOffset.y}
        width={xySwap ? mapSize.w : 20}
        height={xySwap ? 20 : mapSize.h}
        fillOpacity={this.opacity}
        fill={this.color} />
      <g id="UTM-wrapper" style={{ pointerEvents: "all" }}
        onMouseOver={() => this.setHover(true)}
        onMouseLeave={() => this.setHover(false)}
        fillOpacity={this.opacity}
        fill={this.color}>
        {this.props.mountedToolInfo?.name
          ? <this.MountedTool toolName={this.props.mountedToolInfo.name} />
          : <this.UTM />}
      </g>
      <text
        visibility={this.state.hovered ? "visible" : "hidden"}
        x={this.positionQ.qx}
        y={this.positionQ.qy}
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
