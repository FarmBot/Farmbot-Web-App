import { TaggedPoint, TaggedTool } from "farmbot";
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
  width: number;
  followBot: boolean;
  expanded: boolean;
  setExpanded(expanded: boolean): void;
}

export interface ProfileSvgProps {
  allPoints: TaggedPoint[];
  axis: "x" | "y";
  width: number;
  position: AxisNumberProperty;
  expanded: boolean;
  botSize: BotSize;
  botPosition: BotPosition;
  negativeZ: boolean;
  sourceFbosConfig: SourceFbosConfig;
  mountedToolInfo: MountedToolInfo;
  tools: TaggedTool[];
}

export interface WithinRangeProps {
  axis: "x" | "y";
  width: number;
  profilePosition: AxisNumberProperty;
  location: AxisNumberProperty;
}

export interface SelectPointsProps {
  allPoints: TaggedPoint[];
  axis: "x" | "y";
  width: number;
  position: AxisNumberProperty;
  botPositionX: number | undefined;
}

export interface ProfileUtmProps {
  profileAxis: "x" | "y";
  expanded: boolean;
  width: number;
  position: AxisNumberProperty;
  botPosition: BotPosition;
  mountedToolInfo: MountedToolInfo;
}

export interface ProfilePointProps {
  point: TaggedPoint;
  profileAxis: "x" | "y";
  tools: TaggedTool[];
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
}
