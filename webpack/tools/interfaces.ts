import { DropDownItem } from "../ui/index";
import {
  TaggedTool,
  TaggedToolSlotPointer,
} from "farmbot";
import { BotPosition } from "../devices/interfaces";

export interface ToolsState {
  editingTools: boolean;
  editingBays: boolean;
}

export interface Props {
  toolSlots: TaggedToolSlotPointer[];
  tools: TaggedTool[];
  getToolOptions(): DropDownItem[];
  getChosenToolOption(toolSlotUuid: string): DropDownItem;
  getToolByToolSlotUUID(uuid: string): TaggedTool | undefined;
  getToolSlots(): TaggedToolSlotPointer[];
  dispatch: Function;
  isActive: (tool: TaggedTool) => boolean;
  changeToolSlot(t: TaggedToolSlotPointer, dispatch: Function): (d: DropDownItem) => void;
  botPosition: BotPosition;
}

export interface Tool {
  id?: number | undefined;
  name?: string;
  status?: string | undefined;
}

export interface ToolBayListProps {
  dispatch: Function;
  toggle(): void;
  getToolByToolSlotUUID(uuid: string): TaggedTool | undefined;
  getToolSlots(): TaggedToolSlotPointer[];
}

export interface ToolBayFormProps {
  dispatch: Function;
  toolSlots: TaggedToolSlotPointer[];
  botPosition: BotPosition;
  toggle(): void;
  getToolOptions(): DropDownItem[];
  getChosenToolOption(uuid: string): DropDownItem;
  getToolSlots(): TaggedToolSlotPointer[];
  changeToolSlot(t: TaggedToolSlotPointer, dispatch: Function): (d: DropDownItem) => void;
}

export interface ToolListProps {
  tools: TaggedTool[];
  dispatch: Function;
  toggle(): void;
  isActive(tool: TaggedTool): boolean;
}

export interface ToolFormProps {
  dispatch: Function;
  tools: TaggedTool[];
  toggle(): void;
  isActive(tool: TaggedTool): boolean;
}
