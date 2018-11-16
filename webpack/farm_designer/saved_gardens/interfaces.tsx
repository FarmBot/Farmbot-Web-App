import { TaggedSavedGarden, TaggedPlantTemplate } from "farmbot";

export interface SavedGardensProps {
  savedGardens: TaggedSavedGarden[];
  plantTemplates: TaggedPlantTemplate[];
  dispatch: Function;
  plantPointerCount: number;
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
  plantPointerCount: number;
  plantTemplateCount: number;
}

export interface SavedGardenInfoProps {
  savedGarden: TaggedSavedGarden;
  gardenIsOpen: boolean;
  plantTemplateCount: number;
  dispatch: Function;
}
