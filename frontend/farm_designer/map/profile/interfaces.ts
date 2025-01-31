import { TaggedFarmwareEnv, TaggedPoint, TaggedTool } from "farmbot";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { GetWebAppConfigValue } from "../../../config_storage/actions";
import {
  BotLocationData, BotPosition, SourceFbosConfig,
} from "../../../devices/interfaces";
import { Color } from "../../../ui";
import { DesignerState, MountedToolInfo } from "../../interfaces";
import { BotSize, AxisNumberProperty, MapTransformProps } from "../interfaces";
import { PeripheralValues } from "../layers/farmbot/bot_trail";

export interface ProfileViewerProps {
  getConfigValue: GetWebAppConfigValue;
  dispatch: Function;
  designer: DesignerState;
  allPoints: TaggedPoint[];
  botSize: BotSize;
  botLocationData: BotLocationData;
  peripheralValues: PeripheralValues;
  negativeZ: boolean;
  sourceFbosConfig: SourceFbosConfig;
  mountedToolInfo: MountedToolInfo;
  tools: TaggedTool[];
  mapTransformProps: MapTransformProps;
  farmwareEnvs: TaggedFarmwareEnv[];
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
  designer: DesignerState;
  expanded: boolean;
  setExpanded(expanded: boolean): void;
}

export interface ProfileSvgProps {
  allPoints: TaggedPoint[];
  designer: DesignerState;
  position: AxisNumberProperty;
  expanded: boolean;
  botSize: BotSize;
  botLocationData: BotLocationData;
  negativeZ: boolean;
  sourceFbosConfig: SourceFbosConfig;
  mountedToolInfo: MountedToolInfo;
  tools: TaggedTool[];
  mapTransformProps: MapTransformProps;
  getConfigValue: GetWebAppConfigValue;
  farmwareEnvs: TaggedFarmwareEnv[];
  peripheralValues: PeripheralValues;
}

export interface LabeledHorizontalLineProps {
  id: string;
  label: string;
  y: number;
  width: number;
  color: Color;
  profileHeight?: number;
  expanded: boolean;
  dashed?: boolean;
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

export type GetProfileX = (coordinate: BotPosition) => number;
export type GetProfileXFromNumber = (number: number) => number;

export interface GetProfileXProps {
  profileAxis: "x" | "y";
  mapTransformProps: MapTransformProps;
  width: number;
}

export interface FlipProfileProps {
  profileAxis: "x" | "y";
  mapTransformProps: MapTransformProps;
}

export interface ProfileUtmProps {
  profileAxis: "x" | "y";
  expanded: boolean;
  selectionWidth: number;
  position: AxisNumberProperty;
  botPosition: BotPosition;
  mountedToolInfo: MountedToolInfo;
  getX: GetProfileX;
  reversed: boolean;
  hidePositionIndicator?: boolean;
  profileWidth?: number;
  gantryHeight: number;
}

export interface ProfilePointProps<T = TaggedPoint> {
  point: T;
  tools: TaggedTool[];
  soilHeight: number;
  getX: GetProfileX;
  profileAxis: "x" | "y";
  reversed: boolean;
  getConfigValue: GetWebAppConfigValue;
  designer: DesignerState;
}

export interface ProfileToolProps {
  toolName: string | undefined;
  /** tool start */
  x: number;
  /** tool top */
  y: number;
  width: number;
  height: number;
  sideView: boolean;
  slotDirection?: ToolPulloutDirection;
  reversed: boolean;
  toolFlipped: boolean;
  coordinate?: boolean;
  hidePositionIndicator?: boolean;
}

export interface SlotProfileProps {
  /** tool start */
  x: number;
  /** tool top */
  y: number;
  width: number;
  height: number;
  sideView: boolean;
  slotDirection?: ToolPulloutDirection;
  reversed: boolean;
}

export interface ProfileGridProps {
  height: number;
  width: number;
  negativeZ: boolean;
  getX: GetProfileX;
}

export interface InterpolatedSoilProps {
  axis: "x" | "y";
  selectionWidth: number;
  position: AxisNumberProperty;
  getX: GetProfileX;
  farmwareEnvs: TaggedFarmwareEnv[];
}
