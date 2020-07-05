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
import { MountedToolInfo, CameraCalibrationData } from "../../../interfaces";
import { mapImagePositionData, cropAmount, largeCrop } from "../images/map_image";

export interface BotFigureProps {
  figureName: string;
  position: BotPosition;
  mapTransformProps: MapTransformProps;
  plantAreaOffset: AxisNumberProperty;
  eStopStatus?: boolean;
  mountedToolInfo?: MountedToolInfo;
  cameraCalibrationData?: CameraCalibrationData;
  cameraViewArea?: boolean;
  cropPhotos?: boolean;
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
      {this.props.cameraViewArea && this.props.cameraCalibrationData &&
        <CameraViewArea
          position={this.props.position}
          cropPhotos={this.props.cropPhotos}
          cameraCalibrationData={this.props.cameraCalibrationData}
          mapTransformProps={mapTransformProps} />}
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

const parseEnv = (value: string | undefined): number => parseFloat(value || "0");

interface CameraViewAreaProps {
  position: BotPosition;
  cameraCalibrationData: CameraCalibrationData;
  mapTransformProps: MapTransformProps;
  cropPhotos: boolean | undefined;
}

export const rotated90degrees = (angle: number) =>
  (Math.abs(angle) + 45) % 180 > 90;

const CameraViewArea = (props: CameraViewAreaProps) => {
  const { cameraCalibrationData, mapTransformProps, cropPhotos } = props;
  const { x, y } = props.position;
  const { center, scale, rotation } = props.cameraCalibrationData;
  const parsedScale = parseEnv(scale);
  const rotationAngle = Math.abs(parseEnv(rotation));
  const rotated = rotated90degrees(rotationAngle);
  const width = parseEnv(center[rotated ? "y" : "x"]) * 2;
  const height = parseEnv(center[rotated ? "x" : "y"]) * 2;
  const scaledCenter = {
    x: width / 2 * parsedScale,
    y: height / 2 * parsedScale,
  };
  const scaledShortEdge = Math.min(width, height) * parsedScale;
  const crop = cropAmount(rotationAngle, { width, height });
  const cameraViewPosition = mapImagePositionData({
    x, y, width, height, cameraCalibrationData, mapTransformProps,
  });
  const cropPosition = mapImagePositionData({
    x, y,
    width: width - crop, height: height - crop,
    cameraCalibrationData, mapTransformProps,
  });
  if (cameraViewPosition) {
    return <g id="camera-view-area-wrapper" fill={"none"}
      stroke={Color.darkGray} strokeWidth={2} strokeOpacity={0.75}>
      <circle id="camera-photo-center"
        cx={scaledCenter.x}
        cy={scaledCenter.y}
        r={5} transform={cameraViewPosition.transform} />
      <rect id="camera-view-area"
        strokeDasharray={cropPhotos ? "4 5" : "none"}
        x={0}
        y={0}
        width={cameraViewPosition.width}
        height={cameraViewPosition.height}
        transform={cameraViewPosition.transform} />
      {cropPhotos && (largeCrop(rotationAngle)
        ? <circle id="cropped-camera-view-area"
          cx={scaledCenter.x}
          cy={scaledCenter.y}
          r={scaledShortEdge / 2}
          transform={cameraViewPosition.transform} />
        : <rect id="cropped-camera-view-area"
          x={0}
          y={0}
          width={cropPosition?.width}
          height={cropPosition?.height}
          transform={cropPosition?.transform} />)}
    </g>;
  }
  return <g />;
};
