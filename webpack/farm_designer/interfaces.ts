import { OpenFarm } from "./openfarm";
import { DropDownItem } from "../ui/index";
import { CowardlyDictionary } from "../util";
import {
  TaggedFarmEvent,
  TaggedSequence,
  TaggedRegimen,
  TaggedGenericPointer,
  TaggedPlantPointer,
  TaggedCrop,
  TaggedImage,
} from "../resources/tagged_resources";
import { PlantPointer } from "../interfaces";
import { SlotWithTool } from "../resources/interfaces";
import { BotPosition, StepsPerMmXY, BotLocationData } from "../devices/interfaces";
import { isNumber } from "lodash";
import { McuParams } from "farmbot/dist";
import { AxisNumberProperty, BotSize } from "./map/interfaces";
import { SelectionBoxData } from "./map/selection_box";
import { BooleanConfigKey } from "../config_storage/web_app_configs";
import { GetWebAppConfigValue } from "../config_storage/actions";

export enum BotOriginQuadrant { ONE = 1, TWO = 2, THREE = 3, FOUR = 4 }
export enum ZoomLevelPayl { POSITIVE = 0.1, NEGATIVE = -0.1 }

type Mystery = BotOriginQuadrant | number | undefined;
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
  bot_origin_quadrant: BotOriginQuadrant;
  zoom_level: number;
}

export interface Props {
  dispatch: Function;
  selectedPlant: TaggedPlantPointer | undefined;
  designer: DesignerState;
  hoveredPlant: TaggedPlantPointer | undefined;
  points: TaggedGenericPointer[];
  plants: TaggedPlantPointer[];
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
}

export type TimeUnit =
  | "never"
  | "minutely"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type ExecutableType = "Sequence" | "Regimen";

export interface FarmEvent {
  id?: number | undefined;
  start_time: string;
  end_time?: string | undefined;
  repeat?: number | undefined;
  time_unit: TimeUnit;
  executable_id: number;
  executable_type: ExecutableType;
}

export interface MovePlantProps {
  deltaX: number;
  deltaY: number;
  plant: TaggedPlantPointer;
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
  /** Call this function to navigate to different pages. */
  push: (url: string) => void;
}

export interface GardenMapProps {
  showPlants: boolean | undefined;
  showPoints: boolean | undefined;
  showSpread: boolean | undefined;
  showFarmbot: boolean | undefined;
  showImages: boolean | undefined;
  dispatch: Function;
  designer: DesignerState;
  points: TaggedGenericPointer[];
  plants: TaggedPlantPointer[];
  toolSlots: SlotWithTool[];
  selectedPlant: TaggedPlantPointer | undefined;
  hoveredPlant: TaggedPlantPointer | undefined;
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
}

export interface GardenMapState {
  isDragging: boolean | undefined;
  botOriginQuadrant: BotOriginQuadrant;
  pageX: number | undefined;
  pageY: number | undefined;
  activeDragXY: BotPosition | undefined;
  activeDragSpread: number | undefined;
  selectionBox: SelectionBoxData | undefined;
}

export type PlantOptions = Partial<PlantPointer>;

export interface EditPlantInfoProps {
  push(url: string): void;
  dispatch: Function;
  findPlant(stringyID: string | undefined): TaggedPlantPointer | undefined;
}

export interface DraggableEvent {
  currentTarget: HTMLImageElement;
  dataTransfer: {
    setDragImage: Function;
  };
}

export interface HoveredPlantPayl {
  /* Use UUID here to prevent denormalization? */
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
  OFSearch: (query: string) => (dispatch: Function) => void;
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
