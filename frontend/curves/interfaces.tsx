import {
  TaggedCurve, TaggedFarmwareEnv, TaggedGenericPointer, TaggedPlantPointer,
} from "farmbot";
import { SourceFbosConfig } from "../devices/interfaces";
import { BotSize } from "../farm_designer/map/interfaces";
import { CurvesPanelState } from "../interfaces";
import { FormattedPlantInfo } from "../plants/map_state_to_props";
import { UpdatePlant } from "../plants/plant_info";
import { UUID } from "../resources/interfaces";
import { CurveType } from "./templates";

export interface CurvesProps {
  dispatch: Function;
  curves: TaggedCurve[];
  curvesPanelState: CurvesPanelState;
}

export interface CurvesState {
  searchTerm: string;
}

export interface CurveInventoryItemProps {
  curve: TaggedCurve;
  onClick(): void;
}

export interface EditCurveProps {
  dispatch: Function;
  findCurve(id: number): TaggedCurve | undefined;
  sourceFbosConfig: SourceFbosConfig;
  botSize: BotSize;
  resourceUsage: Record<UUID, boolean | undefined>;
}

export interface EditCurveState {
  templates: boolean;
  scale: boolean;
  hovered: string | undefined;
}

export interface CurveSvgProps {
  dispatch: Function;
  curve: TaggedCurve;
  sourceFbosConfig: SourceFbosConfig;
  botSize: BotSize;
  editable: boolean;
  hovered: string | undefined;
  setHovered(day: string | undefined): void;
  x?: number;
  y?: number;
  farmwareEnvs?: TaggedFarmwareEnv[];
  soilHeightPoints?: TaggedGenericPointer[];
}

export interface CurveIconProps {
  curve: TaggedCurve;
}

export interface CurveInfoProps {
  curveType: CurveType;
  dispatch: Function;
  curve: TaggedCurve | undefined;
  sourceFbosConfig: SourceFbosConfig;
  botSize: BotSize;
  updatePlant?: UpdatePlant;
  plant?: FormattedPlantInfo;
  curves: TaggedCurve[];
  farmwareEnvs?: TaggedFarmwareEnv[];
  soilHeightPoints?: TaggedGenericPointer[];
}

export interface AllCurveInfoProps {
  curves: TaggedCurve[];
  openfarmSlug: string;
  plants: TaggedPlantPointer[];
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  botSize: BotSize;
}

export interface EditableAllCurveInfoProps {
  updatePlant: UpdatePlant;
  plant: FormattedPlantInfo;
  curves: TaggedCurve[];
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  botSize: BotSize;
  farmwareEnvs: TaggedFarmwareEnv[];
  soilHeightPoints: TaggedGenericPointer[];
}

export interface PlotTools {
  normX(day: string | number): number;
  normY(value: number): number;
  xMax: number;
  yMax: number;
  xZero: number;
  yZero: number;
}

export interface ActionMenuProps {
  dispatch: Function;
  curve: TaggedCurve;
  click(): void;
}

export interface CurveDataTableRowProps {
  dispatch: Function;
  curve: TaggedCurve;
  hovered: string | undefined;
  setHovered(day: string | undefined): void;
}

export interface PercentChangeProps {
  curve: TaggedCurve;
  index: number;
  value: number;
}

export interface ValueInputProps {
  day: string;
  value: number;
  dispatch: Function;
  curve: TaggedCurve;
}

export interface DataProps {
  curve: TaggedCurve;
  plotTools: PlotTools;
  showHoverEffect(day: string | undefined): boolean;
  setHovered(day: string | undefined): void;
  dragging: string | undefined;
  setDragging(day: string | undefined): void;
  dispatch: Function;
  editable: boolean;
}

export interface DataLabelsProps {
  curve: TaggedCurve;
  plotTools: PlotTools;
  showHoverEffect(day: string | undefined): boolean;
}

export interface XAxisProps {
  curve: TaggedCurve;
  plotTools: PlotTools;
}

export interface YAxisProps {
  curve: TaggedCurve;
  plotTools: PlotTools;
}

export interface WarningLinesProps {
  curve: TaggedCurve;
  plotTools: PlotTools;
  sourceFbosConfig: SourceFbosConfig;
  botSize: BotSize;
  x?: number;
  y?: number;
  farmwareEnvs?: TaggedFarmwareEnv[];
  soilHeightPoints?: TaggedGenericPointer[];
}
