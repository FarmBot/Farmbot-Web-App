import { DropDownItem } from "../ui/fb_select";
import {
  TaggedTool,
  TaggedToolSlotPointer,
} from "../resources/tagged_resources";

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
}

export interface Tool {
  id?: number | undefined;
  name: string;
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
}
