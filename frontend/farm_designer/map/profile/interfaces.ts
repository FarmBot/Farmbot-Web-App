import { TaggedPoint, TaggedTool, Xyz } from "farmbot";
import { BotPosition, SourceFbosConfig } from "../../../devices/interfaces";
import { DesignerState, MountedToolInfo } from "../../interfaces";
import { BotSize, AxisNumberProperty, MapTransformProps } from "../interfaces";

export interface ProfileViewerProps {
  dispatch: Function;
  designer: DesignerState;
  allPoints: TaggedPoint[];
  botSize: BotSize;
  botPosition: BotPosition;
  negativeZ: boolean;
  sourceFbosConfig: SourceFbosConfig;
  mountedToolInfo: MountedToolInfo;
  tools: TaggedTool[];
  mapTransformProps: MapTransformProps;
}

export interface HandleProps {
  isOpen: boolean;
  dispatch: Function;
  setExpanded(expanded: boolean): void;
}

export interface ProfileLineProps {
  designer: DesignerState;
  botPosition: BotPosition;
  plantAreaOffset: AxisNumberProperty;
  mapTransformProps: MapTransformProps;
}

export interface ProfileOptionsProps {
  dispatch: Function;
  axis: "x" | "y";
  selectionWidth: number;
  followBot: boolean;
  expanded: boolean;
  setExpanded(expanded: boolean): void;
}

export interface ProfileSvgProps {
  allPoints: TaggedPoint[];
  axis: "x" | "y";
  selectionWidth: number;
  position: AxisNumberProperty;
  expanded: boolean;
  botSize: BotSize;
  botPosition: BotPosition;
  negativeZ: boolean;
  sourceFbosConfig: SourceFbosConfig;
  mountedToolInfo: MountedToolInfo;
  tools: TaggedTool[];
  mapTransformProps: MapTransformProps;
}

export interface WithinRangeProps {
  axis: "x" | "y";
  selectionWidth: number;
  profilePosition: AxisNumberProperty;
  location: AxisNumberProperty;
}

export interface SelectPointsProps {
  allPoints: TaggedPoint[];
  axis: "x" | "y";
  selectionWidth: number;
  position: AxisNumberProperty;
  botPositionX: number | undefined;
}

export type GetProfileX = (coordinate: Record<Xyz, number | undefined>) => number;
export type GetProfileXFromNumber = (number: number) => number;

export interface GetProfileXProps {
  profileAxis: "x" | "y";
  mapTransformProps: MapTransformProps;
  width: number;
}

export interface ProfileUtmProps {
  profileAxis: "x" | "y";
  expanded: boolean;
  selectionWidth: number;
  position: AxisNumberProperty;
  botPosition: BotPosition;
  mountedToolInfo: MountedToolInfo;
  getX: GetProfileX;
}

export interface ProfilePointProps {
  point: TaggedPoint;
  tools: TaggedTool[];
  getX: GetProfileX;
}

export interface ProfileToolProps {
  toolName: string | undefined;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProfileGridProps {
  height: number;
  width: number;
  negativeZ: boolean;
  getX: GetProfileX;
}
