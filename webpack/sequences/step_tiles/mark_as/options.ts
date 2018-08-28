import { MarkAsSelection } from "./interfaces";
import {
  NONE_SELECTED,
  SELECT_DEFAULT_BY_NOUN,
  ADJ_BY_STATE_KIND,
  TOOL_NOUN,
  PLANT_NOUN
} from "./constants";

type SetState = (x: MarkAsSelection) => void;

export const setNoun = (s: SetState) => (d: MarkAsSelection["noun"]) => {
  return s(SELECT_DEFAULT_BY_NOUN[d.label] || NONE_SELECTED);
};

export const setAdjective = (s: SetState) => (d: MarkAsSelection["adjective"]) => {
  switch (d.label) {
    case "Mounted": case "Dismounted":
      return s({ kind: "ToolSelected", noun: TOOL_NOUN, adjective: d });
    case "Planned": case "Planted": case "Harvested": case "Removed":
      return s({ kind: "PlantSelected", noun: PLANT_NOUN, adjective: d });
    case "None": default:
      return s(NONE_SELECTED);
  }
};

export const adjectiveList = <T extends MarkAsSelection>(x: T): T["adjective"][] => {
  return ADJ_BY_STATE_KIND[x.kind] || [];
};
