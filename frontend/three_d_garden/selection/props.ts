import {
  TaggedDevice, TaggedFbosConfig, TaggedGenericPointer, TaggedSensor,
  TaggedSequence, TaggedTool, TaggedWeedPointer,
} from "farmbot";
import { Config, PositionConfig } from "../config";
import {
  ThreeDLocationSelection, ThreeDObjectSelection,
} from "../selection_types";
import { TaggedPlant } from "../../farm_designer/map/interfaces";
import { SlotWithTool } from "../../resources/interfaces";
import { BotPosition, BotState, UserEnv } from "../../devices/interfaces";
import { MovementState, TimeSettings } from "../../interfaces";

export interface ThreeDObjectSelectionLayerProps {
  config: Config;
  configPosition: PositionConfig;
  selection: ThreeDObjectSelection | undefined;
  selectedObjects?: ThreeDObjectSelection[];
  popupSelection: ThreeDObjectSelection | undefined;
  locationSelection: ThreeDLocationSelection | undefined;
  selectedLocation: ThreeDLocationSelection | undefined;
  onClosePopup(): void;
  onOpenPanel(selection: ThreeDObjectSelection): void;
  onOpenLocationPanel(selection: ThreeDLocationSelection): void;
  onUpdateLocationSelection(selection: ThreeDLocationSelection): void;
  plants: TaggedPlant[];
  points: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  toolSlots: SlotWithTool[];
  tools: TaggedTool[];
  sequences: TaggedSequence[];
  sensors: TaggedSensor[];
  fbosConfig: TaggedFbosConfig | undefined;
  timeSettings: TimeSettings | undefined;
  botOnline: boolean;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
  defaultAxes: string;
  noUTM: boolean;
  deviceAccount: TaggedDevice | undefined;
  bot: BotState | undefined;
  env: UserEnv;
  set3DConfigValue?(key: keyof Config, value: string): void;
  dispatch: Function | undefined;
  gridLoaded: boolean;
  getZ(x: number, y: number): number;
}
