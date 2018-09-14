import { TaggedSavedGarden, TaggedPlantTemplate } from "farmbot";

export interface SavedGardensProps {
  savedGardens: TaggedSavedGarden[];
  plantTemplates: TaggedPlantTemplate[];
  dispatch: Function;
  plantsInGarden: boolean;
  openedSavedGarden: string | undefined;
}

export interface GardenViewButtonProps {
  dispatch: Function;
  savedGarden: string | undefined;
  gardenIsOpen: boolean;
}

export interface SavedGardenItemProps {
  savedGarden: TaggedSavedGarden;
  gardenIsOpen: boolean;
  dispatch: Function;
  plantCount: number;
  plantsInGarden: boolean;
}
