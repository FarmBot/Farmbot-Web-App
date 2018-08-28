import {
  PlantSelected,
  ToolSelected,
  MarkAsSelection,
  NoneSelected,
  NoNoun,
} from "./interfaces";

export const SELECT_NONE: NoNoun = {
  label: "None",
  value: "None",
  headingId: "None"
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
  noun: SELECT_NONE,
  adjective: SELECT_NONE,
};

type MarkAsKind = MarkAsSelection["kind"];
type AdjectiveList = MarkAsSelection["adjective"][];

export const ADJ_BY_STATE_KIND: Record<MarkAsKind, AdjectiveList> = {
  "NoneSelected": [],
  "PlantSelected": PLANT_ADJECTIVES,
  "ToolSelected": TOOL_ADJECTIVES
};
