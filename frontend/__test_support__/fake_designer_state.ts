import { DesignerState } from "../farm_designer/interfaces";

export const fakeDesignerState = (): DesignerState => ({
  selectedPlants: undefined,
  hoveredPlant: {
    plantUUID: undefined,
    icon: ""
  },
  hoveredPoint: undefined,
  hoveredPlantListItem: undefined,
  hoveredToolSlot: undefined,
  cropSearchQuery: "",
  cropSearchResults: [],
  cropSearchInProgress: false,
  chosenLocation: { x: undefined, y: undefined, z: undefined },
  currentPoint: undefined,
  openedSavedGarden: undefined,
  tryGroupSortType: undefined,
});
