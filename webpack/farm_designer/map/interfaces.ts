import {
  TaggedPlantPointer,
  TaggedCrop,
  TaggedGenericPointer
} from "../../resources/tagged_resources";
import { State, BotOriginQuadrant } from "../interfaces";
import { BotPosition } from "../../devices/interfaces";

export interface PlantLayerProps {
  plants: TaggedPlantPointer[];
  currentPlant: TaggedPlantPointer | undefined;
  dragging: boolean;
  editing: boolean;
  visible: boolean;
  crops: TaggedCrop[];
  dispatch: Function;
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  activeDragSpread: number | undefined;
  plantAreaOffset: AxisNumberProperty;
}

export interface CropSpreadDict {
  [key: string]: number | undefined;
}

export interface GardenMapLegendProps {
  zoom: (value: number) => () => void;
  toggle: (property: keyof State) => () => void;
  updateBotOriginQuadrant: (quadrant: number) => () => void;
  botOriginQuadrant: number;
  zoomLvl: number;
  legendMenuOpen: boolean;
  showPlants: boolean;
  showPoints: boolean;
  showSpread: boolean;
  showFarmbot: boolean;
}

export type MapTransformProps = {
  quadrant: BotOriginQuadrant,
  gridSize: AxisNumberProperty
};

export interface GardenPlantProps {
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  plant: Readonly<TaggedPlantPointer>;
  selected: boolean;
  dragging: boolean;
  onClick: (plant: Readonly<TaggedPlantPointer>) => void;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  activeDragSpread: number | undefined;
  plantAreaOffset: AxisNumberProperty;
}

export interface GardenPlantState {
  icon: string;
}

export interface GardenPointProps {
  mapTransformProps: MapTransformProps;
  point: TaggedGenericPointer;
}

export interface DragHelpersProps {
  dragging: boolean;
  plant: Readonly<TaggedPlantPointer>;
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  plantAreaOffset: AxisNumberProperty;
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
}

export interface GridProps {
  mapTransformProps: MapTransformProps;
}

export interface VirtualFarmBotProps {
  mapTransformProps: MapTransformProps;
  botPosition: BotPosition;
  plantAreaOffset: AxisNumberProperty;
}

export interface FarmBotLayerProps extends VirtualFarmBotProps, BotExtentsProps {
  visible: boolean;
}

export interface SpreadOverlapHelperProps {
  dragging: boolean;
  plant: Readonly<TaggedPlantPointer>;
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  activeDragSpread: number | undefined;
}
