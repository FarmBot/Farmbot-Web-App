import React from "react";
import { AxisNumberProperty, MapTransformProps } from "../../interfaces";
import { getMapSize, transformXY } from "../../util";
import { BotPosition } from "../../../../devices/interfaces";
import { Color } from "../../../../ui";
import { botPositionLabel } from "./bot_position_label";
import { RotatedTool } from "../tool_slots/tool_graphics";
import { ToolGraphicProps } from "../../tool_graphics/interfaces";
import { reduceToolName } from "../../tool_graphics/all_tools";
import { ThreeInOneToolHead } from "../../tool_graphics/three_in_one_toolhead";
import { noop, round } from "lodash";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { MountedToolInfo, CameraCalibrationData } from "../../../interfaces";
import {
  mapImagePositionData, cropAmount, largeCrop, MapImagePositionData,
  rotated90degrees,
} from "../images/map_image";

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
  showUncroppedArea?: boolean;
  color?: Color;
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
      toolName: this.props.mountedToolInfo?.name,
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
    if (this.props.color) { return this.props.color; }
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
    </g>;

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
        color={this.color} />;

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
          showUncroppedArea={this.props.showUncroppedArea}
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
  showUncroppedArea: boolean | undefined;
  logVisual?: boolean;
}

// eslint-disable-next-line complexity
export const CameraViewArea = (props: CameraViewAreaProps) => {
  const { cameraCalibrationData, mapTransformProps, cropPhotos } = props;
  const { xySwap } = mapTransformProps;
  const { x, y } = props.position;
  const { center, scale, rotation } = props.cameraCalibrationData;
  const parsedScale = parseEnv(scale);
  const rotationAngle = Math.abs(parseEnv(rotation));
  const cameraRotated = rotated90degrees(rotationAngle);
  const viewArea = {
    width: parseEnv(center.x) * 2,
    height: parseEnv(center.y) * 2,
  };
  const scaledCenter = {
    x: round(viewArea.width / 2 * parsedScale),
    y: round(viewArea.height / 2 * parsedScale),
  };
  const scaledShortEdge = Math.min(viewArea.width, viewArea.height) * parsedScale;
  const crop = cropAmount(rotationAngle, viewArea);
  const snappedViewArea = {
    width: parseEnv(center[cameraRotated && !xySwap ? "y" : "x"]) * 2,
    height: parseEnv(center[cameraRotated && !xySwap ? "x" : "y"]) * 2
  };
  const common = { x, y, cameraCalibrationData, mapTransformProps };
  const angledView = mapImagePositionData({
    ...common,
    width: viewArea.width,
    height: viewArea.height,
    alreadyRotated: false,
  });
  const snappedView = mapImagePositionData({
    ...common,
    width: snappedViewArea.width,
    height: snappedViewArea.height,
    alreadyRotated: true,
    noRotation: xySwap && cameraRotated,
  });
  const croppedView = mapImagePositionData({
    ...common,
    width: snappedViewArea.width - crop,
    height: snappedViewArea.height - crop,
    alreadyRotated: true,
    noRotation: xySwap && cameraRotated,
  });
  const croppedLogVisual = props.logVisual && cropPhotos;
  const showCroppedArea = !cropPhotos || props.showUncroppedArea;
  return <g id="camera-view-area-wrapper" fill={"none"}
    stroke={Color.darkGray} strokeWidth={2} strokeOpacity={0.75}>
    <clipPath id={`snapped-camera-view-area-clip-path-${x}-${y}`}>
      <ViewRectangle position={snappedView} />
    </clipPath>
    {angledView && <ViewCircle id={"camera-photo-center"}
      center={scaledCenter} radius={5} position={angledView} />}
    {props.logVisual &&
      <ImageLogVisuals position={cropPhotos ? croppedView : angledView} />}
    {!props.logVisual && showCroppedArea &&
      <ViewRectangle id={"snapped-camera-view-area"}
        dashed={cropPhotos} position={snappedView} />}
    {!croppedLogVisual && showCroppedArea &&
      <g id={"angled-camera-view-area-wrapper"}
        clipPath={props.logVisual
          ? undefined
          : `url(#snapped-camera-view-area-clip-path-${x}-${y})`}>
        <ViewRectangle id={"angled-camera-view-area"}
          dashed={cropPhotos} position={angledView} />
      </g>}
    {cropPhotos && croppedView && (largeCrop(rotationAngle) && angledView
      ? <ViewCircle id={"cropped-camera-view-area"}
        center={scaledCenter}
        radius={scaledShortEdge / 2}
        position={angledView} />
      : <ViewRectangle id={"cropped-camera-view-area"}
        position={croppedView} />)}
  </g>;
};

interface ViewRectangleProps {
  id?: string;
  position: MapImagePositionData | undefined;
  dashed?: boolean;
}

const ViewRectangle = (props: ViewRectangleProps) =>
  <rect id={props.id}
    strokeDasharray={props.dashed ? "4 5" : "none"}
    x={0}
    y={0}
    width={props.position?.width}
    height={props.position?.height}
    data-comment={props.position?.comment}
    style={{
      transformOrigin: props.position?.transformOrigin,
      transform: props.position?.transform,
    }} />;

interface ViewCircleProps {
  id: string;
  center: Record<"x" | "y", number>;
  radius: number;
  position: MapImagePositionData;
}

const ViewCircle = (props: ViewCircleProps) =>
  <circle id={props.id}
    cx={props.center.x}
    cy={props.center.y}
    r={props.radius}
    data-comment={props.position.comment}
    style={{
      transformOrigin: props.position.transformOrigin,
      transform: props.position.transform,
    }} />;

interface ImageLogVisualsProps {
  position: MapImagePositionData | undefined;
}

const ImageLogVisuals = (props: ImageLogVisualsProps) => {
  if (!props.position) { return <g />; }
  const { width, height, transform, transformOrigin } = props.position;
  return <svg id={"image-log-visuals"} width={width} height={height}>
    <defs>
      <linearGradient id={"camera-scan-fill"}
        x1={0} y1={0} x2={"100%"} y2={0}>
        <stop offset={"0%"} stopColor={Color.cyan} stopOpacity={0} />
        <stop offset={"50%"} stopColor={Color.cyan} stopOpacity={0.7} />
        <stop offset={"100%"} stopColor={Color.cyan} stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect className={"img-full"} style={{ transformOrigin, transform }} />
    <g id={"scan-wrapper"} style={{ transformOrigin, transform }}>
      <rect className={"img-scan"}
        height={height} fill={"url(#camera-scan-fill)"} />
    </g>
  </svg>;
};
