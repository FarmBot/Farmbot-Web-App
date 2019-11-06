import { TaggedSavedGarden, TaggedPlantTemplate } from "farmbot";

export interface SavedGardensProps {
  savedGardens: TaggedSavedGarden[];
  plantTemplates: TaggedPlantTemplate[];
  dispatch: Function;
  plantPointerCount: number;
  openedSavedGarden: string | undefined;
}

export interface SavedGardensListProps extends SavedGardensProps {
  searchTerm: string;
}

export interface SavedGardensState {
  searchTerm: string;
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
  plantTemplateCount: number;
  dispatch: Function;
}

export interface EditGardenProps {
  savedGarden: TaggedSavedGarden | undefined;
  gardenIsOpen: boolean;
  dispatch: Function;
  plantPointerCount: number;
}
