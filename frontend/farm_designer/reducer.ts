import {
  DesignerState,
  CropLiveSearchResult,
  DrawnPointPayl,
  DrawnWeedPayl,
  HoveredPlantPayl,
} from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
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
  visualizedSequence: undefined,
  hoveredSequenceStep: undefined,
  settingsSearchTerm: "",
  hiddenImages: [],
  shownImages: [],
  hideUnShownImages: false,
  alwaysHighlightImage: false,
  hoveredMapImage: undefined,
  cameraViewGridId: undefined,
  gridIds: [],
  soilHeightLabels: false,
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
      const { color } = (!payload || !payload.color)
        ? (s.drawnPoint || { color: "green" })
        : payload;
      s.drawnPoint = payload;
      s.drawnPoint && (s.drawnPoint.color = color);
      return s;
    })
  .add<DrawnWeedPayl | undefined>(
    Actions.SET_DRAWN_WEED_DATA, (s, { payload }) => {
      const { color } = (!payload || !payload.color)
        ? (s.drawnWeed || { color: "red" })
        : payload;
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
  .add<string>(Actions.SET_SETTINGS_SEARCH_TERM, (s, { payload }) => {
    s.settingsSearchTerm = payload;
    return s;
  })
  .add<boolean>(Actions.EDIT_GROUP_AREA_IN_MAP, (s, { payload }) => {
    s.editGroupAreaInMap = payload;
    return s;
  })
  .add<UUID | undefined>(Actions.VISUALIZE_SEQUENCE, (s, { payload }) => {
    s.visualizedSequence = payload;
    return s;
  })
  .add<string | undefined>(Actions.HOVER_SEQUENCE_STEP, (s, { payload }) => {
    s.hoveredSequenceStep = payload;
    return s;
  })
  .add<number | undefined>(Actions.HIDE_MAP_IMAGE, (s, { payload }) => {
    if (payload) {
      s.hiddenImages.push(payload);
    } else {
      s.hiddenImages = [];
    }
    return s;
  })
  .add<number>(Actions.UN_HIDE_MAP_IMAGE, (s, { payload }) => {
    s.hiddenImages = s.hiddenImages.filter(id => id != payload);
    return s;
  })
  .add<number[]>(Actions.SET_SHOWN_MAP_IMAGES, (s, { payload }) => {
    s.shownImages = payload;
    return s;
  })
  .add<boolean>(Actions.TOGGLE_SHOWN_IMAGES_ONLY, (s) => {
    s.hideUnShownImages = !s.hideUnShownImages;
    return s;
  })
  .add<boolean>(Actions.TOGGLE_ALWAYS_HIGHLIGHT_IMAGE, (s) => {
    s.alwaysHighlightImage = !s.alwaysHighlightImage;
    return s;
  })
  .add<number | undefined>(Actions.HIGHLIGHT_MAP_IMAGE, (s, { payload }) => {
    s.hoveredMapImage = payload;
    return s;
  })
  .add<string | undefined>(Actions.SHOW_CAMERA_VIEW_POINTS, (s, { payload }) => {
    s.cameraViewGridId = payload;
    return s;
  })
  .add<string>(Actions.TOGGLE_GRID_ID, (s, { payload }) => {
    s.gridIds = s.gridIds.includes(payload)
      ? s.gridIds.filter(id => payload != id)
      : s.gridIds.concat(payload);
    return s;
  })
  .add<boolean>(Actions.TOGGLE_SOIL_HEIGHT_LABELS, (s) => {
    s.soilHeightLabels = !s.soilHeightLabels;
    return s;
  });
