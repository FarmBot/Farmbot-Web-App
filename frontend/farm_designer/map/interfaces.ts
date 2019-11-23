import {
  TaggedPlantPointer,
  TaggedGenericPointer,
  TaggedPlantTemplate
} from "farmbot";
import { State, BotOriginQuadrant } from "../interfaces";
import { BotPosition, BotLocationData } from "../../devices/interfaces";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { TimeSettings } from "../../interfaces";

export type TaggedPlant = TaggedPlantPointer | TaggedPlantTemplate;

export interface PlantLayerProps {
  plants: TaggedPlant[];
  currentPlant: TaggedPlant | undefined;
  dragging: boolean;
  editing: boolean;
  visible: boolean;
  dispatch: Function;
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  selectedForDel: string[] | undefined;
  animate: boolean;
}

export interface GardenMapLegendProps {
  zoom: (value: number) => () => void;
  toggle: (property: keyof State) => () => void;
  legendMenuOpen: boolean;
  showPlants: boolean;
  showPoints: boolean;
  showSpread: boolean;
  showFarmbot: boolean;
  showImages: boolean;
  showSensorReadings: boolean;
  hasSensorReadings: boolean;
  dispatch: Function;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  imageAgeInfo: { newestDate: string, toOldest: number };
  gardenId?: number;
  className?: string;
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
  editing: boolean;
  dragging: boolean;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  uuid: string;
  multiselected: boolean;
  animate: boolean;
}

export interface GardenPlantState {
  icon: string;
  hover: boolean;
}

export interface GardenPointProps {
  mapTransformProps: MapTransformProps;
  point: TaggedGenericPointer;
  hovered: boolean;
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
export type BotSize = Record<"x" | "y", CheckedAxisLength>;

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
  onClick(): void;
}

export interface VirtualFarmBotProps {
  mapTransformProps: MapTransformProps;
  botLocationData: BotLocationData;
  plantAreaOffset: AxisNumberProperty;
  peripherals: { label: string, value: boolean }[];
  eStopStatus: boolean;
  getConfigValue: GetWebAppConfigValue;
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
}

/** Garden map interaction modes. */
export enum Mode {
  none = "none",
  boxSelect = "boxSelect",
  clickToAdd = "clickToAdd",
  editPlant = "editPlant",
  addPlant = "addPlant",
  moveTo = "moveTo",
  points = "points",
  createPoint = "createPoint",
  templateView = "templateView",
  editGroup = "editGroup",
}
