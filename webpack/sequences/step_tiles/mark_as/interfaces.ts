import { DropDownItem as DDI } from "../../../ui";

export interface ToolNoun extends DDI { headingId: "Tool"; }
export interface PlantNoun extends DDI { headingId: "Plant"; }
export interface NoNoun extends DDI { headingId: "None"; }

export namespace ToolAdjectives {
  export interface Dismounted extends DDI {
    label: "Dismounted";
    value: "dismounted";
  }

  export interface Mounted extends DDI {
    label: "Mounted";
    value: "mounted";
  }
}

export namespace PlantAdjectives {
  export interface Harvested extends DDI {
    label: "Harvested";
    value: "harvested";
  }

  export interface Planned extends DDI {
    label: "Planned";
    value: "planned";
  }

  export interface Planted extends DDI {
    label: "Planted";
    value: "planted";
  }

  export interface Removed extends DDI {
    label: "Removed";
    value: "removed";
  }

}

export interface NoneSelected {
  kind: "NoneSelected";
  noun: NoNoun;
  adjective: NoNoun;
}

export interface ToolSelected {
  kind: "ToolSelected";
  noun: ToolNoun;
  adjective: ToolAdjectives.Mounted | ToolAdjectives.Dismounted;
}

export interface PlantSelected {
  kind: "PlantSelected";
  noun: PlantNoun;
  adjective: PlantAdjectives.Planned
  | PlantAdjectives.Planted
  | PlantAdjectives.Harvested
  | PlantAdjectives.Removed;
}

export type MarkAsSelection = NoneSelected | ToolSelected | PlantSelected;
