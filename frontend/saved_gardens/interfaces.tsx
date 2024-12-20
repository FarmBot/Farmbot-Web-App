import { TaggedSavedGarden, TaggedPlantTemplate } from "farmbot";
import { NavigateFunction } from "react-router";

export interface SavedGardensProps {
  savedGardens: TaggedSavedGarden[];
  plantTemplates: TaggedPlantTemplate[];
  dispatch: Function;
  plantPointerCount: number;
  openedSavedGarden: number | undefined;
}

export interface SavedGardenListProps extends SavedGardensProps {
  searchTerm: string;
}

export interface SavedGardensState {
  searchTerm: string;
}

export interface GardenViewButtonProps {
  navigate: NavigateFunction;
  dispatch: Function;
  savedGardenId: number | undefined;
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
  gardenPlants: TaggedPlantTemplate[];
}
