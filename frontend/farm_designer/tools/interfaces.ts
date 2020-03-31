import { UUID } from "../../resources/interfaces";
import {
  FirmwareHardware, TaggedTool, TaggedToolSlotPointer,
  TaggedDevice, TaggedSensor,
} from "farmbot";
import { BotOriginQuadrant } from "../interfaces";
import { BotState, BotPosition } from "../../devices/interfaces";

export interface AddToolSlotState {
  uuid: UUID | undefined;
}

export interface AddToolProps {
  dispatch: Function;
  existingToolNames: string[];
  firmwareHardware: FirmwareHardware | undefined;
}

export interface AddToolState {
  toolName: string;
  toAdd: string[];
  uuid: UUID | undefined;
}

export interface EditToolProps {
  findTool(id: string): TaggedTool | undefined;
  dispatch: Function;
  mountedToolId: number | undefined;
  isActive(id: number | undefined): boolean;
  existingToolNames: string[];
}

export interface EditToolState {
  toolName: string;
}

export interface ToolsProps {
  tools: TaggedTool[];
  toolSlots: TaggedToolSlotPointer[];
  dispatch: Function;
  findTool(id: number): TaggedTool | undefined;
  device: TaggedDevice;
  sensors: TaggedSensor[];
  bot: BotState;
  hoveredToolSlot: string | undefined;
  firmwareHardware: FirmwareHardware | undefined;
  xySwap: boolean;
  quadrant: BotOriginQuadrant;
  isActive(id: number | undefined): boolean;
}

export interface ToolsState {
  searchTerm: string;
}

export interface AddEditToolSlotPropsBase {
  tools: TaggedTool[];
  dispatch: Function;
  botPosition: BotPosition;
  findTool(id: number): TaggedTool | undefined;
  firmwareHardware: FirmwareHardware | undefined;
  xySwap: boolean;
  quadrant: BotOriginQuadrant;
  isActive(id: number | undefined): boolean;
}

export interface AddToolSlotProps extends AddEditToolSlotPropsBase {
  findToolSlot(uuid: UUID | undefined): TaggedToolSlotPointer | undefined;
}

export interface EditToolSlotProps extends AddEditToolSlotPropsBase {
  findToolSlot(id: string): TaggedToolSlotPointer | undefined;
}
