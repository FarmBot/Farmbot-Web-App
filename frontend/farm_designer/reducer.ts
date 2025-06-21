import {
  DesignerState,
  DrawnPointPayl,
  HoveredPlantPayl,
} from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { TaggedResource, PointType, PlantStage } from "farmbot";
import { Actions } from "../constants";
import { BotPosition } from "../devices/interfaces";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { UUID } from "../resources/interfaces";

export const initialState: DesignerState = {
  selectedPoints: undefined,
  selectionPointType: undefined,
  hoveredPlant: {
    plantUUID: undefined,
  },
  hoveredPoint: undefined,
  hoveredSpread: undefined,
  hoveredPlantListItem: undefined,
  hoveredToolSlot: undefined,
  hoveredSensorReading: undefined,
  hoveredImage: undefined,
  cropSearchQuery: "",
  companionIndex: undefined,
  plantTypeChangeId: undefined,
  bulkPlantSlug: undefined,
  chosenLocation: { x: undefined, y: undefined, z: undefined },
  drawnPoint: undefined,
  openedSavedGarden: undefined,
  tryGroupSortType: undefined,
  editGroupAreaInMap: false,
  visualizedSequence: undefined,
  hoveredSequenceStep: undefined,
  hiddenImages: [],
  shownImages: [],
  hideUnShownImages: false,
  alwaysHighlightImage: false,
  showPhotoImages: true,
  showCalibrationImages: true,
  showDetectionImages: true,
  showHeightImages: true,
  hoveredMapImage: undefined,
  cameraViewGridId: undefined,
  gridIds: [],
  gridStart: { x: 100, y: 100 },
  soilHeightLabels: false,
  profileOpen: false,
  profileAxis: "x",
  profilePosition: { x: undefined, y: undefined },
  profileWidth: 500,
  profileFollowBot: true,
  cropWaterCurveId: undefined,
  cropSpreadCurveId: undefined,
  cropHeightCurveId: undefined,
  cropStage: undefined,
  cropPlantedAt: undefined,
  cropRadius: undefined,
  distanceIndicator: "",
  panelOpen: true,
  threeDTopDownView: false,
  threeDExaggeratedZ: false,
  threeDTime: undefined,
};

export const designer = generateReducer<DesignerState>(initialState)
  .add<string>(Actions.SEARCH_QUERY_CHANGE, (s, { payload }) => {
    s.cropSearchQuery = payload;
    return s;
  })
  .add<number | undefined>(Actions.SET_PLANT_TYPE_CHANGE_ID, (s, { payload }) => {
    s.plantTypeChangeId = payload;
    return s;
  })
  .add<string | undefined>(Actions.SET_SLUG_BULK, (s, { payload }) => {
    s.bulkPlantSlug = payload;
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
  .add<number | undefined>(Actions.TOGGLE_HOVERED_SPREAD, (s, { payload }) => {
    s.hoveredSpread = payload;
    return s;
  })
  .add<number | undefined>(Actions.SET_CROP_WATER_CURVE_ID, (s, { payload }) => {
    s.cropWaterCurveId = payload;
    return s;
  })
  .add<number | undefined>(Actions.SET_CROP_SPREAD_CURVE_ID, (s, { payload }) => {
    s.cropSpreadCurveId = payload;
    return s;
  })
  .add<number | undefined>(Actions.SET_CROP_HEIGHT_CURVE_ID, (s, { payload }) => {
    s.cropHeightCurveId = payload;
    return s;
  })
  .add<PlantStage | undefined>(Actions.SET_CROP_STAGE, (s, { payload }) => {
    s.cropStage = payload;
    return s;
  })
  .add<string | undefined>(Actions.SET_CROP_PLANTED_AT, (s, { payload }) => {
    s.cropPlantedAt = payload;
    return s;
  })
  .add<number | undefined>(Actions.SET_CROP_RADIUS, (s, { payload }) => {
    s.cropRadius = payload;
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
  .add<string | undefined>(Actions.HOVER_SENSOR_READING, (s, { payload }) => {
    s.hoveredSensorReading = payload;
    return s;
  })
  .add<string | undefined>(Actions.HOVER_IMAGE, (s, { payload }) => {
    s.hoveredImage = payload;
    return s;
  })
  .add<DrawnPointPayl | undefined>(
    Actions.SET_DRAWN_POINT_DATA, (s, { payload }) => {
      s.drawnPoint = payload;
      return s;
    })
  .add<number>(Actions.SET_COMPANION_INDEX, (s, a) => {
    s.companionIndex = a.payload;
    return s;
  })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s) => {
    s.selectedPoints = undefined;
    s.hoveredPlant = { plantUUID: undefined };
    return s;
  })
  .add<BotPosition>(Actions.CHOOSE_LOCATION, (s, { payload }) => {
    s.chosenLocation = payload;
    return s;
  })
  .add<number | undefined>(Actions.CHOOSE_SAVED_GARDEN, (s, { payload }) => {
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
  .add<boolean>(Actions.TOGGLE_SHOW_PHOTO_IMAGES, (s) => {
    s.showPhotoImages = !s.showPhotoImages;
    return s;
  })
  .add<boolean>(Actions.TOGGLE_SHOW_CALIBRATION_IMAGES, (s) => {
    s.showCalibrationImages = !s.showCalibrationImages;
    return s;
  })
  .add<boolean>(Actions.TOGGLE_SHOW_DETECTION_IMAGES, (s) => {
    s.showDetectionImages = !s.showDetectionImages;
    return s;
  })
  .add<boolean>(Actions.TOGGLE_SHOW_HEIGHT_IMAGES, (s) => {
    s.showHeightImages = !s.showHeightImages;
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
  .add<Record<"x" | "y", number>>(Actions.SET_GRID_START, (s, { payload }) => {
    s.gridStart = payload;
    return s;
  })
  .add<boolean>(Actions.TOGGLE_SOIL_HEIGHT_LABELS, (s) => {
    s.soilHeightLabels = !s.soilHeightLabels;
    return s;
  })
  .add<string>(Actions.SET_DISTANCE_INDICATOR, (s, { payload }) => {
    s.distanceIndicator = payload;
    return s;
  })
  .add<boolean>(Actions.TOGGLE_3D_TOP_DOWN_VIEW, (s, { payload }) => {
    s.threeDTopDownView = payload;
    return s;
  })
  .add<boolean>(Actions.TOGGLE_3D_EXAGGERATED_Z, (s, { payload }) => {
    s.threeDExaggeratedZ = payload;
    return s;
  })
  .add<string | undefined>(Actions.SET_3D_TIME, (s, { payload }) => {
    s.threeDTime = payload;
    return s;
  })
  .add<boolean>(Actions.SET_PANEL_OPEN, (s, { payload }) => {
    s.panelOpen = payload;
    return s;
  })
  .add<boolean>(Actions.SET_PROFILE_OPEN, (s, { payload }) => {
    s.profileOpen = payload;
    return s;
  })
  .add<"x" | "y">(Actions.SET_PROFILE_AXIS, (s, { payload }) => {
    s.profileAxis = payload;
    return s;
  })
  .add<Record<"x" | "y", number | undefined>>(
    Actions.SET_PROFILE_POSITION, (s, { payload }) => {
      s.profilePosition = payload;
      return s;
    })
  .add<number>(Actions.SET_PROFILE_WIDTH, (s, { payload }) => {
    s.profileWidth = payload;
    return s;
  })
  .add<boolean>(Actions.SET_PROFILE_FOLLOW_BOT, (s, { payload }) => {
    s.profileFollowBot = payload;
    return s;
  });
