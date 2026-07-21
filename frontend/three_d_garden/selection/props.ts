import {
  TaggedDevice, TaggedFbosConfig, TaggedGenericPointer, TaggedSensor,
  TaggedSceneObject, TaggedSequence, TaggedTool, TaggedWeedPointer,
  TaggedPeripheral,
} from "farmbot";
import { Config, PositionConfig } from "../config";
import {
  ThreeDLocationSelection, ThreeDObjectSelection,
} from "../selection_types";
import { TaggedPlant } from "../../farm_designer/map/interfaces";
import { SlotWithTool } from "../../resources/interfaces";
import { BotPosition, BotState, UserEnv } from "../../devices/interfaces";
import { MovementState, TimeSettings } from "../../interfaces";
import { PeripheralValues } from
  "../../farm_designer/map/layers/farmbot/bot_trail";
import type { PanelCameraStore } from "../panel_camera";

export interface ThreeDObjectSelectionLayerProps {
  config: Config;
  configPosition: PositionConfig;
  selection: ThreeDObjectSelection | undefined;
  panelSelection?: ThreeDObjectSelection;
  panelCameraStore?: PanelCameraStore;
  selectedObjects?: ThreeDObjectSelection[];
  popupSelection: ThreeDObjectSelection | undefined;
  locationSelection: ThreeDLocationSelection | undefined;
  selectedLocation: ThreeDLocationSelection | undefined;
  onClosePopup(): void;
  onCopySceneObject(sceneObject: TaggedSceneObject): void;
  onOpenPanel(selection: ThreeDObjectSelection): void;
  onOpenLocationPanel(selection: ThreeDLocationSelection): void;
  onUpdateLocationSelection(selection: ThreeDLocationSelection): void;
  plants: TaggedPlant[];
  points: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  sceneObjects: TaggedSceneObject[];
  toolSlots: SlotWithTool[];
  tools: TaggedTool[];
  sequences: TaggedSequence[];
  sensors: TaggedSensor[];
  peripherals: TaggedPeripheral[];
  peripheralValues: PeripheralValues;
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
  cameraFollow: boolean;
  set3DConfigValue?(key: keyof Config, value: string): void;
  dispatch: Function | undefined;
  gridLoaded: boolean;
  getZ(x: number, y: number): number;
}
