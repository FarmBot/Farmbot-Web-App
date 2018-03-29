import { CropLiveSearchResult, CurrentPointPayl } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { DesignerState, HoveredPlantPayl } from "./interfaces";
import { cloneDeep } from "lodash";
import { TaggedResource } from "../resources/tagged_resources";
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
  chosenLocation: { x: undefined, y: undefined, z: undefined },
  currentPoint: undefined,
};

export let designer = generateReducer<DesignerState>(initialState)
  .add<string>(Actions.SEARCH_QUERY_CHANGE, (s, { payload }) => {
    const state = cloneDeep(s);
    state.cropSearchQuery = payload;
    return state;
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
    const state = cloneDeep(s);
    state.cropSearchResults = a.payload;
    return state;
  })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s) => {
    s.selectedPlants = undefined;
    s.hoveredPlant = { plantUUID: undefined, icon: "" };
    return s;
  })
  .add<BotPosition>(Actions.CHOOSE_LOCATION, (s, { payload }) => {
    s.chosenLocation = payload;
    return s;
  });
