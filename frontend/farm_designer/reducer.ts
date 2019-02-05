import { CropLiveSearchResult, CurrentPointPayl } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { DesignerState, HoveredPlantPayl } from "./interfaces";
import { cloneDeep } from "lodash";
import { TaggedResource } from "farmbot";
import { Actions } from "../constants";
import { BotPosition } from "../devices/interfaces";

export let initialState: DesignerState = {
  selectedPlants: undefined,
  hoveredPlant: {
    plantUUID: undefined,
    icon: ""
  },
  hoveredPlantListItem: undefined,
  cropSearchQuery: "",
  cropSearchResults: [],
  cropSearchInProgress: false,
  chosenLocation: { x: undefined, y: undefined, z: undefined },
  currentPoint: undefined,
  openedSavedGarden: undefined,
};

export let designer = generateReducer<DesignerState>(initialState)
  .add<string>(Actions.SEARCH_QUERY_CHANGE, (s, { payload }) => {
    s.cropSearchInProgress = true;
    const state = cloneDeep(s);
    state.cropSearchQuery = payload;
    return state;
  })
  .add<boolean>(Actions.OF_SEARCH_RESULTS_START, (s) => {
    s.cropSearchInProgress = true;
    return s;
  })
  .add<boolean>(Actions.OF_SEARCH_RESULTS_NO, (s) => {
    s.cropSearchInProgress = false;
    return s;
  })
  .add<string[] | undefined>(Actions.SELECT_PLANT, (s, { payload }) => {
    s.selectedPlants = payload;
    return s;
  })
  .add<HoveredPlantPayl>(Actions.TOGGLE_HOVERED_PLANT, (s, { payload }) => {
    s.hoveredPlant = payload;
    return s;
  })
  .add<string | undefined>(Actions.HOVER_PLANT_LIST_ITEM, (s, { payload }) => {
    s.hoveredPlantListItem = payload;
    return s;
  })
  .add<CurrentPointPayl>(Actions.SET_CURRENT_POINT_DATA, (s, { payload }) => {
    s.currentPoint = payload;
    return s;
  })
  .add<CropLiveSearchResult[]>(Actions.OF_SEARCH_RESULTS_OK, (s, a) => {
    s.cropSearchResults = a.payload;
    s.cropSearchInProgress = false;
    return s;
  })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s) => {
    s.selectedPlants = undefined;
    s.hoveredPlant = { plantUUID: undefined, icon: "" };
    return s;
  })
  .add<BotPosition>(Actions.CHOOSE_LOCATION, (s, { payload }) => {
    s.chosenLocation = payload;
    return s;
  })
  .add<string | undefined>(Actions.CHOOSE_SAVED_GARDEN, (s, { payload }) => {
    s.openedSavedGarden = payload;
    return s;
  });
