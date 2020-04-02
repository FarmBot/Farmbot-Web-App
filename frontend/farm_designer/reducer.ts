import { CropLiveSearchResult, DrawnPointPayl, DrawnWeedPayl } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { DesignerState, HoveredPlantPayl } from "./interfaces";
import { cloneDeep } from "lodash";
import { TaggedResource, PointType } from "farmbot";
import { Actions } from "../constants";
import { BotPosition } from "../devices/interfaces";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { UUID } from "../resources/interfaces";

export const initialState: DesignerState = {
  selectedPoints: undefined,
  selectionPointType: undefined,
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
  drawnPoint: undefined,
  drawnWeed: undefined,
  openedSavedGarden: undefined,
  tryGroupSortType: undefined,
  editGroupAreaInMap: false,
};

export const designer = generateReducer<DesignerState>(initialState)
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
  .add<UUID[] | undefined>(Actions.SELECT_POINT, (s, { payload }) => {
    s.selectedPoints = payload;
    return s;
  })
  .add<PointType[] | undefined>(
    Actions.SET_SELECTION_POINT_TYPE, (s, { payload }) => {
      s.selectionPointType = payload;
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
  .add<string | undefined>(Actions.TOGGLE_HOVERED_POINT, (s, { payload }) => {
    s.hoveredPoint = payload;
    return s;
  })
  .add<string | undefined>(Actions.HOVER_TOOL_SLOT, (s, { payload }) => {
    s.hoveredToolSlot = payload;
    return s;
  })
  .add<DrawnPointPayl | undefined>(
    Actions.SET_DRAWN_POINT_DATA, (s, { payload }) => {
      const { color } = (!payload || !payload.color) ?
        (s.drawnPoint || { color: "green" }) : payload;
      s.drawnPoint = payload;
      s.drawnPoint && (s.drawnPoint.color = color);
      return s;
    })
  .add<DrawnWeedPayl | undefined>(
    Actions.SET_DRAWN_WEED_DATA, (s, { payload }) => {
      const { color } = (!payload || !payload.color) ?
        (s.drawnWeed || { color: "red" }) : payload;
      s.drawnWeed = payload;
      s.drawnWeed && (s.drawnWeed.color = color);
      return s;
    })
  .add<CropLiveSearchResult[]>(Actions.OF_SEARCH_RESULTS_OK, (s, a) => {
    s.cropSearchResults = a.payload;
    s.cropSearchInProgress = false;
    return s;
  })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s) => {
    s.selectedPoints = undefined;
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
  })
  .add<PointGroupSortType | undefined>(Actions.TRY_SORT_TYPE, (s, { payload }) => {
    s.tryGroupSortType = payload;
    return s;
  })
  .add<boolean>(Actions.EDIT_GROUP_AREA_IN_MAP, (s, { payload }) => {
    s.editGroupAreaInMap = payload;
    return s;
  });
