import { CropLiveSearchResult } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import {
  DesignerState,
  HoveredPlantPayl,
  BotOriginQuadrant,
  isBotOriginQuadrant,
  ZoomLevelPayl
} from "./interfaces";
import { cloneDeep } from "lodash";
import { TaggedResource } from "../resources/tagged_resources";
import { localStorageNumFetch } from "../util";
import { Actions } from "../constants";

export const BOT_ORIGIN_QUADRANT = "bot_origin_quadrant";
export const ZOOM_LEVEL = "zoom_level";

let botOriginVal = localStorageNumFetch(BOT_ORIGIN_QUADRANT);
let botOriginQuadrant = isBotOriginQuadrant(botOriginVal) ? botOriginVal : 2;

let zoomLevelVal = localStorageNumFetch(ZOOM_LEVEL);
let zoomLevel = zoomLevelVal ? zoomLevelVal : 1;

export let initialState: DesignerState = {
  selectedPlant: undefined,
  hoveredPlant: {
    plantUUID: undefined,
    icon: ""
  },
  botOriginQuadrant,
  zoomLevel: zoomLevel || 1,
  cropSearchQuery: "",
  cropSearchResults: []
};

export let designer = generateReducer<DesignerState>(initialState)
  .add<string>(Actions.SEARCH_QUERY_CHANGE, (s, { payload }) => {
    let state = cloneDeep(s);
    state.cropSearchQuery = payload;
    return state;
  })
  .add<string | undefined>(Actions.SELECT_PLANT, (s, { payload }) => {
    s.selectedPlant = payload;
    return s;
  })
  .add<HoveredPlantPayl>(Actions.TOGGLE_HOVERED_PLANT, (s, { payload }) => {
    s.hoveredPlant = payload;
    return s;
  })
  .add<BotOriginQuadrant>(Actions.UPDATE_BOT_ORIGIN_QUADRANT, (s, a) => {
    localStorage.setItem(BOT_ORIGIN_QUADRANT, JSON.stringify(a.payload));
    s.botOriginQuadrant = a.payload;
    return s;
  })
  .add<ZoomLevelPayl>(Actions.UPDATE_MAP_ZOOM_LEVEL, (s, { payload }) => {
    let value = s.zoomLevel + payload;
    s.zoomLevel = value;
    localStorage.setItem(ZOOM_LEVEL, value.toString());
    return s;
  })
  .add<CropLiveSearchResult[]>(Actions.OF_SEARCH_RESULTS_OK, (s, a) => {
    let state = cloneDeep(s);
    state.cropSearchResults = a.payload;
    return state;
  })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
    if (payload.uuid === s.selectedPlant) { s.selectedPlant = undefined; }
    return s;
  });
