import {
  TaggedPlantPointer,
  TaggedGenericPointer,
  TaggedPlantTemplate,
  TaggedWeedPointer,
  TaggedPoint,
  Xyz,
  McuParams,
} from "farmbot";
import {
  State, BotOriginQuadrant, MountedToolInfo, CameraCalibrationData,
} from "../interfaces";
import {
  BotPosition, BotLocationData, SourceFbosConfig,
} from "../../devices/interfaces";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { TimeSettings } from "../../interfaces";
import { UUID } from "../../resources/interfaces";
import { PeripheralValues } from "./layers/farmbot/bot_trail";

export type TaggedPlant = TaggedPlantPointer | TaggedPlantTemplate;

export interface PlantLayerProps {
  plants: TaggedPlant[];
  currentPlant: TaggedPlant | undefined;
  hoveredPlant: TaggedPlant | undefined;
  dragging: boolean;
  editing: boolean;
  visible: boolean;
  dispatch: Function;
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  boxSelected: UUID[] | undefined;
  groupSelected: UUID[];
  animate: boolean;
  interactions: boolean;
  hoveredSpread: number | undefined;
}

export interface GardenMapLegendProps {
  zoom: (value: number) => () => void;
  toggle: (property: keyof State) => () => void;
  legendMenuOpen: boolean;
  showPlants: boolean;
  showPoints: boolean;
  showSoilInterpolationMap: boolean;
  showWeeds: boolean;
  showSpread: boolean;
  showFarmbot: boolean;
  showImages: boolean;
  showZones: boolean;
  showSensorReadings: boolean;
  showMoistureInterpolationMap: boolean;
  hasSensorReadings: boolean;
  dispatch: Function;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  imageAgeInfo: { newestDate: string, toOldest: number };
  gardenId?: number;
  className?: string;
  allPoints: TaggedPoint[];
  sourceFbosConfig: SourceFbosConfig;
  firmwareConfig: McuParams;
  botLocationData: BotLocationData;
  botSize: BotSize;
}

export type MapTransformProps = {
  quadrant: BotOriginQuadrant,
  gridSize: AxisNumberProperty
  xySwap: boolean;
};

export interface GardenPlantProps {
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  plant: Readonly<TaggedPlant>;
  selected: boolean;
  current: boolean;
  editing: boolean;
  dragging: boolean;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  uuid: string;
  animate: boolean;
  hovered: boolean;
  hoveredSpread: number | undefined;
}

export interface GardenPlantState {
  hover: boolean;
}

export interface GardenPointProps {
  mapTransformProps: MapTransformProps;
  point: TaggedGenericPointer;
  cameraViewGridId: string | undefined;
  cameraCalibrationData: CameraCalibrationData;
  cropPhotos: boolean;
  showUncroppedArea: boolean;
  current: boolean;
  hovered: boolean;
  dispatch: Function;
  soilHeightLabels: boolean;
  getSoilHeightColor(z: number): string;
  animate: boolean;
}

export interface GardenWeedProps {
  mapTransformProps: MapTransformProps;
  weed: TaggedWeedPointer;
  hovered: boolean;
  current: boolean;
  selected: boolean;
  animate: boolean;
  radiusVisible: boolean;
  dispatch: Function;
}

interface DragHelpersBaseProps {
  dragging: boolean;
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  plantAreaOffset: AxisNumberProperty;
}

export interface ActivePlantDragHelperProps extends DragHelpersBaseProps {
  currentPlant: TaggedPlant | undefined;
  editing: boolean;
}

export interface DragHelpersProps extends DragHelpersBaseProps {
  plant: Readonly<TaggedPlant>;
}

export type AxisNumberProperty = Record<"x" | "y", number>;
export type CheckedAxisLength = { value: number, isDefault: boolean };
export type BotSize = Record<Xyz, CheckedAxisLength>;

export interface BotExtentsProps {
  mapTransformProps: MapTransformProps;
  stopAtHome: Record<"x" | "y", boolean>;
  botSize: BotSize;
}

export interface MapBackgroundProps {
  mapTransformProps: MapTransformProps;
  plantAreaOffset: AxisNumberProperty;
  templateView: boolean;
}

export interface GridProps {
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
  onClick(e: React.MouseEvent<SVGElement>): void;
  onMouseDown(e: React.MouseEvent<SVGElement>): void;
  templateView: boolean;
}

export interface VirtualFarmBotProps {
  mapTransformProps: MapTransformProps;
  botLocationData: BotLocationData;
  plantAreaOffset: AxisNumberProperty;
  peripheralValues: PeripheralValues;
  eStopStatus: boolean;
  getConfigValue: GetWebAppConfigValue;
  mountedToolInfo: MountedToolInfo;
  cameraCalibrationData: CameraCalibrationData;
}

export interface FarmBotLayerProps extends VirtualFarmBotProps, BotExtentsProps {
  visible: boolean;
}

export interface SpreadOverlapHelperProps {
  dragging: boolean;
  plant: Readonly<TaggedPlant>;
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  activeDragSpread: number | undefined;
  showOverlapValues?: boolean;
  inactiveSpread: number;
}

/** Garden map interaction modes. */
export enum Mode {
  none = "none",
  boxSelect = "boxSelect",
  clickToAdd = "clickToAdd",
  editPlant = "editPlant",
  addPlant = "addPlant",
  locationInfo = "locationInfo",
  points = "points",
  weeds = "weeds",
  createPoint = "createPoint",
  createWeed = "createWeed",
  templateView = "templateView",
  editGroup = "editGroup",
  profile = "profile",
}
