import {
  PlantSelected,
  ToolSelected,
  MarkAsSelection,
  NoneSelected,
  PlantNoun,
  ToolNoun
} from "./interfaces";
import { betterCompact } from "../../../util";
import { NULL_CHOICE } from "../../../ui/fb_select";

export const PLANT_NOUN: PlantNoun = {
  label: "Plant",
  value: "Plant"
};

export const TOOL_NOUN: ToolNoun = {
  label: "Tool",
  value: "Tool"
};

export const PLANT_ADJECTIVES: PlantSelected["adjective"][] = [
  { label: "Harvested", value: "harvested", },
  { label: "Planned", value: "planned", },
  { label: "Planted", value: "planted", },
  { label: "Removed", value: "removed", },
];

export const TOOL_ADJECTIVES: ToolSelected["adjective"][] = [
  { label: "Dismounted", value: "dismounted" },
  { label: "Mounted", value: "mounted" },
];

export const NONE_SELECTED: NoneSelected = {
  kind: "NoneSelected",
  noun: NULL_CHOICE,
  adjective: NULL_CHOICE,
};

export const DEFAULT_TOOL_SELECTION: ToolSelected = {
  kind: "ToolSelected",
  noun: TOOL_NOUN,
  adjective: TOOL_ADJECTIVES[0]
};

export const DEFAULT_PLANT_SELECTION: PlantSelected = {
  kind: "PlantSelected",
  noun: PLANT_NOUN,
  adjective: PLANT_ADJECTIVES[0]
};

const optionalNouns: MarkAsSelection["noun"][] = [
  { label: "Tool", value: "Tool" },
  { label: "Plant", value: "Plant" },
];

type NounValue = MarkAsSelection["noun"]["label"];
type MarkAsKind = MarkAsSelection["kind"];
type AdjectiveList = MarkAsSelection["adjective"][];

export const SELECT_DEFAULT_BY_NOUN: Record<NounValue, MarkAsSelection> = {
  "Plant": DEFAULT_PLANT_SELECTION,
  "Tool": DEFAULT_TOOL_SELECTION,
  "None": NONE_SELECTED
};

export const ADJ_BY_STATE_KIND: Record<MarkAsKind, AdjectiveList> = {
  "NoneSelected": [],
  "PlantSelected": PLANT_ADJECTIVES,
  "ToolSelected": TOOL_ADJECTIVES
};

export const NOUNS = betterCompact(optionalNouns);
