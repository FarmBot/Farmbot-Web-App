import { MarkAsSelection } from "./interfaces";
import {
  ADJ_BY_STATE_KIND,
  NONE_SELECTED,
  PLANT_ADJECTIVES,
  TOOL_ADJECTIVES,
  SELECT_NONE,
} from "./constants";
import { ResourceIndex } from "../../../resources/interfaces";
import { selectAllTools, selectAllPoints } from "../../../resources/selectors";
import { TaggedResource, TaggedPoint, TaggedTool } from "farmbot";
import { DropDownItem } from "../../../ui";

type SetState = (x: Partial<MarkAsSelection>) => void;
type Noun = MarkAsSelection["noun"];

const isSaved = (x: TaggedResource) => !!x.body.id;
const resource2noun = (x: TaggedTool | TaggedPoint): Noun => {
  if (x.kind == "Tool") {
    return {
      headingId: "Tool",
      label: x.body.name || "Untitled Tool",
      value: x.uuid
    };
  } else {
    return {
      headingId: "Plant",
      label: x.body.name || "?",
      value: x.uuid
    };
  }
};

const TOOL_HEADING: DropDownItem = {
  heading: true,
  headingId: "WRONG",
  label: "Tools",
  value: "WRONG",
};

const PLANT_HEADING: DropDownItem = {
  heading: true,
  headingId: "WRONG",
  label: "Plants",
  value: "WRONG",
};

export const getNounList =
  (r: ResourceIndex): DropDownItem[] => {
    return [
      TOOL_HEADING,
      ...selectAllTools(r).filter(isSaved).map(resource2noun),
      PLANT_HEADING,
      ...selectAllPoints(r).filter(isSaved).map(resource2noun),
    ];
  };

export const setNoun = (s: SetState) => (noun: MarkAsSelection["noun"]) => {
  switch (noun.headingId) {
    case "Plant":
      return s({ kind: "PlantSelected", adjective: PLANT_ADJECTIVES[0], noun });
    case "Tool":
      return s({ kind: "ToolSelected", adjective: TOOL_ADJECTIVES[0], noun });
    case "None":
    default:
      return s({
        kind: "NoneSelected",
        adjective: SELECT_NONE,
        noun: SELECT_NONE
      });
  }
};

export const setAdjective =
  (s: SetState) => (adjective: MarkAsSelection["adjective"]) => {
    console.log("Rick: fix this! Remove `any` types.");
    switch (adjective.label) {
      case "Mounted": case "Dismounted":
        return s({ kind: "ToolSelected", adjective } as any);
      case "Planned": case "Planted": case "Harvested": case "Removed":
        return s({ kind: "PlantSelected", adjective } as any);
      case "None":
        return s(NONE_SELECTED);
    }
  };

export const adjectiveList = <T extends MarkAsSelection>(x: T): T["adjective"][] => {
  return ADJ_BY_STATE_KIND[x.kind] || [];
};
