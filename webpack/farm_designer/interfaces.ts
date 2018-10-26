import { OpenFarm } from "./openfarm";
import { DropDownItem } from "../ui/index";
import { CowardlyDictionary } from "../util";
import {
  TaggedFarmEvent,
  TaggedSequence,
  TaggedRegimen,
  TaggedGenericPointer,
  TaggedImage,
  TaggedSensorReading,
  TaggedSensor,
} from "farmbot";
import { SlotWithTool } from "../resources/interfaces";
import { BotPosition, StepsPerMmXY, BotLocationData } from "../devices/interfaces";
import { isNumber } from "lodash";
import { McuParams, TaggedCrop } from "farmbot";
import { AxisNumberProperty, BotSize, TaggedPlant } from "./map/interfaces";
import { SelectionBoxData } from "./map/background";
import { GetWebAppConfigValue } from "../config_storage/actions";
import {
  ExecutableType, PlantPointer
} from "farmbot/dist/resources/api_resources";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";

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
  show_spread: boolean;
  show_farmbot: boolean;
  show_images: boolean;
  show_sensor_readings: boolean;
  bot_origin_quadrant: BotOriginQuadrant;
  zoom_level: number;
}

export interface Props {
  dispatch: Function;
  selectedPlant: TaggedPlant | undefined;
  designer: DesignerState;
  hoveredPlant: TaggedPlant | undefined;
  points: TaggedGenericPointer[];
  plants: TaggedPlant[];
  toolSlots: SlotWithTool[];
  crops: TaggedCrop[];
  botLocationData: BotLocationData;
  botMcuParams: McuParams;
  stepsPerMmXY: StepsPerMmXY;
  peripherals: { label: string, value: boolean }[];
  eStopStatus: boolean;
  latestImages: TaggedImage[];
  cameraCalibrationData: CameraCalibrationData;
  tzOffset: number;
  getConfigValue: GetWebAppConfigValue;
  sensorReadings: TaggedSensorReading[];
  sensors: TaggedSensor[];
}

export interface MovePlantProps {
  deltaX: number;
  deltaY: number;
  plant: TaggedPlant;
  gridSize: AxisNumberProperty;
}

/**
 * OFCrop bundled with corresponding profile image from OpenFarm API.
 */
export interface CropLiveSearchResult {
  crop: OpenFarm.OFCrop;
  image: string;
}

export interface Crop {
  id?: undefined;
  svg_icon?: string | undefined;
  spread?: number | undefined;
  slug: string;
}

export interface DesignerState {
  selectedPlants: string[] | undefined;
  hoveredPlant: HoveredPlantPayl;
  hoveredPlantListItem: string | undefined;
  cropSearchQuery: string;
  cropSearchResults: CropLiveSearchResult[];
  chosenLocation: BotPosition;
  currentPoint: CurrentPointPayl | undefined;
  openedSavedGarden: string | undefined;
}

export type TaggedExecutable = TaggedSequence | TaggedRegimen;
export type ExecutableQuery = (kind: ExecutableType, id: number) => TaggedExecutable;
export interface AddEditFarmEventProps {
  deviceTimezone: string | undefined;
  executableOptions: DropDownItem[];
  repeatOptions: DropDownItem[];
  farmEvents: TaggedFarmEvent[];
  regimensById: CowardlyDictionary<TaggedRegimen>;
  sequencesById: CowardlyDictionary<TaggedSequence>;
  farmEventsById: CowardlyDictionary<TaggedFarmEvent>;
  getFarmEvent(): TaggedFarmEvent | undefined;
  handleTime(e: React.SyntheticEvent<HTMLInputElement>, currentISO: string): string;
  dispatch: Function;
  findExecutable: ExecutableQuery;
  timeOffset: number;
  autoSyncEnabled: boolean;
  allowRegimenBackscheduling: boolean;
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
  executableId: number;
  id: number;
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

export interface GardenMapProps {
  showPlants: boolean | undefined;
  showPoints: boolean | undefined;
  showSpread: boolean | undefined;
  showFarmbot: boolean | undefined;
  showImages: boolean | undefined;
  showSensorReadings: boolean | undefined;
  dispatch: Function;
  designer: DesignerState;
  points: TaggedGenericPointer[];
  plants: TaggedPlant[];
  toolSlots: SlotWithTool[];
  selectedPlant: TaggedPlant | undefined;
  hoveredPlant: TaggedPlant | undefined;
  crops: TaggedCrop[];
  botLocationData: BotLocationData;
  botSize: BotSize;
  stopAtHome: Record<"x" | "y", boolean>;
  zoomLvl: number;
  botOriginQuadrant: BotOriginQuadrant;
  gridSize: AxisNumberProperty;
  gridOffset: AxisNumberProperty;
  peripherals: { label: string, value: boolean }[];
  eStopStatus: boolean;
  latestImages: TaggedImage[];
  cameraCalibrationData: CameraCalibrationData;
  getConfigValue: GetWebAppConfigValue;
  sensorReadings: TaggedSensorReading[];
  sensors: TaggedSensor[];
  timeOffset: number;
}

export interface GardenMapState {
  isDragging: boolean | undefined;
  botOriginQuadrant: BotOriginQuadrant;
  qPageX: number | undefined;
  qPageY: number | undefined;
  activeDragXY: BotPosition | undefined;
  activeDragSpread: number | undefined;
  selectionBox: SelectionBoxData | undefined;
}

export type PlantOptions = Partial<PlantPointer>;

export interface EditPlantInfoProps {
  push(url: string): void;
  dispatch: Function;
  findPlant(stringyID: string | undefined): TaggedPlant | undefined;
  openedSavedGarden: string | undefined;
}

export interface DraggableEvent {
  currentTarget: HTMLImageElement;
  dataTransfer: {
    setDragImage: Function;
  };
}

export interface HoveredPlantPayl {
  plantUUID: string | undefined;
  icon: string;
}

export interface CropCatalogProps {
  cropSearchQuery: string;
  dispatch: Function;
  cropSearchResults: CropLiveSearchResult[];
  OFSearch: (searchTerm: string) =>
    (dispatch: Function) => void;
}

export interface CropInfoProps {
  dispatch: Function;
  cropSearchResults: CropLiveSearchResult[];
  openedSavedGarden: string | undefined;
  OFSearch: (query: string) => (dispatch: Function) => void;
  botPosition: BotPosition;
}

export interface CameraCalibrationData {
  scale: string | undefined;
  rotation: string | undefined;
  offset: {
    x: string | undefined;
    y: string | undefined;
  },
  origin: string | undefined;
  calibrationZ: string | undefined;
}

export interface CurrentPointPayl {
  cx: number;
  cy: number;
  r: number;
  color?: string;
}

export interface SavedGarden {
  id?: number;
  name?: string;
}
