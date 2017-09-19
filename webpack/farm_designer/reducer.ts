import { CropLiveSearchResult } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import {
  DesignerState,
  HoveredPlantPayl
} from "./interfaces";
import { cloneDeep } from "lodash";
import { TaggedResource } from "../resources/tagged_resources";
import { Actions } from "../constants";

export let initialState: DesignerState = {
  selectedPlants: undefined,
  hoveredPlant: {
    plantUUID: undefined,
    icon: ""
  },
  cropSearchQuery: "",
  cropSearchResults: []
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
  .add<CropLiveSearchResult[]>(Actions.OF_SEARCH_RESULTS_OK, (s, a) => {
    const state = cloneDeep(s);
    state.cropSearchResults = a.payload;
    return state;
  })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
    s.selectedPlants = undefined;
    return s;
  });
