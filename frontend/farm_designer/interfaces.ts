import { DropDownItem } from "../ui";
import {
  TaggedFarmEvent,
  TaggedSequence,
  TaggedRegimen,
  TaggedGenericPointer,
  TaggedImage,
  TaggedSensorReading,
  TaggedSensor,
  TaggedPoint,
  TaggedPointGroup,
  TaggedWeedPointer,
  PointType,
  SequenceBodyItem,
  McuParams,
  TaggedCrop,
  TaggedLog,
  TaggedTool,
  Vector3,
  TaggedFarmwareEnv,
  TaggedPlantTemplate,
  TaggedPlantPointer,
  TaggedCurve,
  PlantStage,
} from "farmbot";
import { SlotWithTool, ResourceIndex, UUID } from "../resources/interfaces";
import {
  BotPosition, BotLocationData, SourceFbosConfig,
} from "../devices/interfaces";
import { isNumber } from "lodash";
import {
  AxisNumberProperty, BotSize, MapTransformProps, TaggedPlant,
} from "./map/interfaces";
import { SelectionBoxData } from "./map/background";
import { GetWebAppConfigValue } from "../config_storage/actions";
import {
  DeviceAccountSettings,
  ExecutableType, PlantPointer, ToolPulloutDirection,
} from "farmbot/dist/resources/api_resources";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { MovementState, TimeSettings } from "../interfaces";
import { ExtendedPointGroupSortType } from "../point_groups/paths";
import { PeripheralValues } from "./map/layers/farmbot/bot_trail";
import { NavigateFunction } from "react-router";

/* BotOriginQuadrant diagram

2 --- 1
|     |
3 --- 4

*/
export enum BotOriginQuadrant { ONE = 1, TWO = 2, THREE = 3, FOUR = 4 }

type Mystery = BotOriginQuadrant | number | string | boolean | undefined;
export function isBotOriginQuadrant(mystery: Mystery):
  mystery is BotOriginQuadrant {
  return isNumber(mystery) && [1, 2, 3, 4].includes(mystery);
}

type TypeCheckerHint = Partial<Record<BooleanConfigKey, boolean>>;

export interface State extends TypeCheckerHint {
  legend_menu_open: boolean;
  show_plants: boolean;
  show_points: boolean;
  show_soil_interpolation_map: boolean;
  show_weeds: boolean;
  show_spread: boolean;
  show_farmbot: boolean;
  show_images: boolean;
  show_zones: boolean;
  show_sensor_readings: boolean;
  show_moisture_interpolation_map: boolean;
  bot_origin_quadrant: BotOriginQuadrant;
  zoom_level: number;
}

export interface MountedToolInfo {
  name: string | undefined;
  pulloutDirection: ToolPulloutDirection | undefined;
  noUTM: boolean;
  flipped: boolean;
}

export interface FarmDesignerProps {
  dispatch: Function;
  device: DeviceAccountSettings;
  selectedPlant: TaggedPlant | undefined;
  designer: DesignerState;
  hoveredPlant: TaggedPlant | undefined;
  genericPoints: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  allPoints: TaggedPoint[];
  plants: TaggedPlant[];
  tools: TaggedTool[];
  toolSlots: SlotWithTool[];
  crops: TaggedCrop[];
  botLocationData: BotLocationData;
  botMcuParams: McuParams;
  botSize: BotSize;
  peripheralValues: PeripheralValues;
  eStopStatus: boolean;
  latestImages: TaggedImage[];
  cameraCalibrationData: CameraCalibrationData;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  sensorReadings: TaggedSensorReading[];
  sensors: TaggedSensor[];
  groups: TaggedPointGroup[];
  mountedToolInfo: MountedToolInfo;
  visualizedSequenceBody: SequenceBodyItem[];
  logs: TaggedLog[];
  deviceTarget: string;
  sourceFbosConfig: SourceFbosConfig;
  farmwareEnvs: TaggedFarmwareEnv[];
  children?: React.ReactNode;
  curves: TaggedCurve[];
}

export interface MovePointsProps {
  deltaX: number;
  deltaY: number;
  points: (TaggedPoint | TaggedPlantTemplate)[];
  gridSize: AxisNumberProperty;
}

export interface MovePointToProps {
  x: number;
  y: number;
  point: TaggedPoint | TaggedPlantTemplate;
  gridSize: AxisNumberProperty;
}

export interface DesignerState {
  selectedPoints: UUID[] | undefined;
  selectionPointType: PointType[] | undefined;
  hoveredPlant: HoveredPlantPayl;
  hoveredPoint: string | undefined;
  hoveredSpread: number | undefined;
  hoveredPlantListItem: string | undefined;
  hoveredToolSlot: string | undefined;
  hoveredSensorReading: string | undefined;
  hoveredImage: string | undefined;
  cropSearchQuery: string;
  companionIndex: number | undefined;
  plantTypeChangeId: number | undefined;
  bulkPlantSlug: string | undefined;
  chosenLocation: BotPosition;
  drawnPoint: DrawnPointPayl | undefined;
  openedSavedGarden: number | undefined;
  tryGroupSortType: ExtendedPointGroupSortType | undefined;
  editGroupAreaInMap: boolean;
  visualizedSequence: UUID | undefined;
  hoveredSequenceStep: string | undefined;
  hiddenImages: number[];
  shownImages: number[];
  hideUnShownImages: boolean;
  alwaysHighlightImage: boolean;
  showPhotoImages: boolean;
  showCalibrationImages: boolean;
  showDetectionImages: boolean;
  showHeightImages: boolean;
  hoveredMapImage: number | undefined;
  cameraViewGridId: string | undefined;
  gridIds: string[];
  gridStart: Record<"x" | "y", number>;
  soilHeightLabels: boolean;
  profileOpen: boolean;
  profileAxis: "x" | "y";
  profilePosition: Record<"x" | "y", number | undefined>;
  profileWidth: number;
  profileFollowBot: boolean;
  cropWaterCurveId: number | undefined;
  cropSpreadCurveId: number | undefined;
  cropHeightCurveId: number | undefined;
  cropStage: PlantStage | undefined;
  cropPlantedAt: string | undefined;
  cropRadius: number | undefined;
  distanceIndicator: string;
  panelOpen: boolean;
  threeDTopDownView: boolean;
  threeDExaggeratedZ: boolean;
  threeDTime: string | undefined;
}

export type TaggedExecutable = TaggedSequence | TaggedRegimen;
export type ExecutableQuery =
  (kind: ExecutableType, id: number) => TaggedExecutable;
export interface AddEditFarmEventProps {
  deviceTimezone: string | undefined;
  executableOptions: DropDownItem[];
  repeatOptions: DropDownItem[];
  farmEvents: TaggedFarmEvent[];
  regimensById: Record<string, TaggedRegimen | undefined>;
  sequencesById: Record<string, TaggedSequence | undefined>;
  farmEventsById: Record<string, TaggedFarmEvent | undefined>;
  getFarmEvent(navigate: NavigateFunction): TaggedFarmEvent | undefined;
  findFarmEventByUuid(uuid: string | undefined): TaggedFarmEvent | undefined;
  handleTime(e: React.SyntheticEvent<HTMLInputElement>, currentISO: string): string;
  dispatch: Function;
  findExecutable: ExecutableQuery;
  timeSettings: TimeSettings;
  resources: ResourceIndex;
}

/**
 * One CalendarDay has many CalendarOccurrences. For instance, a FarmEvent
 * that executes every 8 hours will create 3 CalendarOccurrences in a single
 * CalendarDay.
 */
export interface CalendarOccurrence {
  mmddyy: string;
  sortKey: number;
  timeStr: string;
  heading: string;
  subheading?: string | undefined;
  variables: string[];
  executableId: number;
  executableType: ExecutableType;
  id: number;
  color?: string;
}

/** A group of FarmEvents for a particular day on the calendar. */
export interface CalendarDay {
  /** Unix timestamp. Used as a unique key in JSX and for sorting. */
  sortKey: number;
  year: number;
  month: string;
  day: number;
  /** Every event that will execute on that day. */
  items: CalendarOccurrence[];
}

export interface FarmEventProps {
  timezoneIsSet: boolean;
  /** Sorted list of the first (100?) events due on the calendar. */
  calendarRows: CalendarDay[];
}

export interface FarmEventState {
  searchTerm: string;
}

export interface GardenMapProps {
  showPlants: boolean | undefined;
  showPoints: boolean | undefined;
  showWeeds: boolean | undefined;
  showSpread: boolean | undefined;
  showFarmbot: boolean | undefined;
  showImages: boolean | undefined;
  showZones: boolean | undefined;
  showSensorReadings: boolean | undefined;
  dispatch: Function;
  designer: DesignerState;
  genericPoints: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  allPoints: TaggedPoint[];
  plants: TaggedPlant[];
  toolSlots: SlotWithTool[];
  selectedPlant: TaggedPlant | undefined;
  hoveredPlant: TaggedPlant | undefined;
  crops: TaggedCrop[];
  botLocationData: BotLocationData;
  botSize: BotSize;
  stopAtHome: Record<"x" | "y", boolean>;
  zoomLvl: number;
  mapTransformProps: MapTransformProps;
  gridOffset: AxisNumberProperty;
  peripheralValues: PeripheralValues;
  eStopStatus: boolean;
  latestImages: TaggedImage[];
  cameraCalibrationData: CameraCalibrationData;
  getConfigValue: GetWebAppConfigValue;
  sensorReadings: TaggedSensorReading[];
  sensors: TaggedSensor[];
  timeSettings: TimeSettings;
  groups: TaggedPointGroup[];
  mountedToolInfo: MountedToolInfo;
  visualizedSequenceBody: SequenceBodyItem[];
  logs: TaggedLog[];
  deviceTarget: string;
  farmwareEnvs: TaggedFarmwareEnv[];
  curves: TaggedCurve[];
}

export interface GardenMapState {
  isDragging: boolean | undefined;
  botOriginQuadrant: BotOriginQuadrant;
  activeDragXY: BotPosition | undefined;
  activeDragSpread: number | undefined;
  selectionBox: SelectionBoxData | undefined;
  previousSelectionBoxArea: number | undefined;
  toLocation: Vector3 | undefined;
  cursorPosition: AxisNumberProperty | undefined;
}

export type PlantOptions = Partial<PlantPointer>;

export interface EditPlantInfoProps {
  dispatch: Function;
  findPlant(stringyID: string | undefined): TaggedPlant | undefined;
  openedSavedGarden: number | undefined;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  soilHeightPoints: TaggedGenericPointer[];
  farmwareEnvs: TaggedFarmwareEnv[];
  botOnline: boolean;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
  sourceFbosConfig: SourceFbosConfig;
  botSize: BotSize;
  curves: TaggedCurve[];
  plants: TaggedPlantPointer[];
}

export interface DraggableEvent {
  currentTarget: HTMLImageElement;
  dataTransfer: {
    setDragImage: Function;
  };
}

export interface HoveredPlantPayl {
  plantUUID: string | undefined;
}

export interface CropCatalogProps {
  dispatch: Function;
  plant: TaggedPlantPointer | undefined;
  bulkPlantSlug: string | undefined;
  hoveredPlant: HoveredPlantPayl;
  cropSearchQuery: string;
}

export interface CropInfoProps {
  dispatch: Function;
  designer: DesignerState;
  botPosition: BotPosition;
  xySwap: boolean;
  getConfigValue: GetWebAppConfigValue;
  sourceFbosConfig: SourceFbosConfig;
  botSize: BotSize;
  curves: TaggedCurve[];
  plants: TaggedPlantPointer[];
}

export interface CameraCalibrationData {
  scale: string | undefined;
  rotation: string | undefined;
  offset: {
    x: string | undefined;
    y: string | undefined;
  },
  center: {
    x: string | undefined;
    y: string | undefined;
  },
  origin: string | undefined;
  calibrationZ: string | undefined;
}

export interface DrawnPointPayl {
  name: string;
  cx: number | undefined;
  cy: number | undefined;
  z: number;
  r: number;
  color: string;
  at_soil_level: boolean;
}
