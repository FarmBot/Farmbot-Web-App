import { designer } from "../reducer";
import { Actions } from "../../constants";
import { ReduxAction } from "../../redux/interfaces";
import { HoveredPlantPayl, DrawnPointPayl } from "../interfaces";
import { BotPosition } from "../../devices/interfaces";
import {
  fakeDesignerState, fakeDrawnPoint,
} from "../../__test_support__/fake_designer_state";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { PlantStage, PointType } from "farmbot";
import { UUID } from "../../resources/interfaces";
import { Path } from "../../internal_urls";

describe("designer reducer", () => {
  const oldState = fakeDesignerState;

  it("sets search query", () => {
    const action: ReduxAction<string> = {
      type: Actions.SEARCH_QUERY_CHANGE,
      payload: "apple"
    };
    const newState = designer(oldState(), action);
    expect(newState.cropSearchQuery).toEqual("apple");
  });

  it("selects points", () => {
    const action: ReduxAction<string[]> = {
      type: Actions.SELECT_POINT,
      payload: ["pointUuid"]
    };
    const newState = designer(oldState(), action);
    expect(newState.selectedPoints).toEqual(["pointUuid"]);
  });

  it("sets selection point type", () => {
    const action: ReduxAction<PointType[] | undefined> = {
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Plant"],
    };
    const newState = designer(oldState(), action);
    expect(newState.selectionPointType).toEqual(["Plant"]);
  });

  it("sets hovered plant", () => {
    const action: ReduxAction<HoveredPlantPayl> = {
      type: Actions.TOGGLE_HOVERED_PLANT,
      payload: {
        plantUUID: "plantUuid"
      }
    };
    const newState = designer(oldState(), action);
    expect(newState.hoveredPlant).toEqual({
      plantUUID: "plantUuid"
    });
  });

  it("sets hovered spread", () => {
    const action: ReduxAction<number | undefined> = {
      type: Actions.TOGGLE_HOVERED_SPREAD,
      payload: 100,
    };
    const newState = designer(oldState(), action);
    expect(newState.hoveredSpread).toEqual(100);
  });

  it("sets crop water curve id", () => {
    const action: ReduxAction<number | undefined> = {
      type: Actions.SET_CROP_WATER_CURVE_ID,
      payload: 1,
    };
    const newState = designer(oldState(), action);
    expect(newState.cropWaterCurveId).toEqual(1);
  });

  it("sets crop spread curve id", () => {
    const action: ReduxAction<number | undefined> = {
      type: Actions.SET_CROP_SPREAD_CURVE_ID,
      payload: 2,
    };
    const newState = designer(oldState(), action);
    expect(newState.cropSpreadCurveId).toEqual(2);
  });

  it("sets crop height curve id", () => {
    const action: ReduxAction<number | undefined> = {
      type: Actions.SET_CROP_HEIGHT_CURVE_ID,
      payload: 3,
    };
    const newState = designer(oldState(), action);
    expect(newState.cropHeightCurveId).toEqual(3);
  });

  it("sets crop stage", () => {
    const action: ReduxAction<PlantStage | undefined> = {
      type: Actions.SET_CROP_STAGE,
      payload: "planned",
    };
    const newState = designer(oldState(), action);
    expect(newState.cropStage).toEqual("planned");
  });

  it("sets crop planted at", () => {
    const action: ReduxAction<string | undefined> = {
      type: Actions.SET_CROP_PLANTED_AT,
      payload: "2020-01-20T20:00:00.000Z",
    };
    const newState = designer(oldState(), action);
    expect(newState.cropPlantedAt).toEqual("2020-01-20T20:00:00.000Z");
  });

  it("sets crop radius", () => {
    const action: ReduxAction<number | undefined> = {
      type: Actions.SET_CROP_RADIUS,
      payload: 100,
    };
    const newState = designer(oldState(), action);
    expect(newState.cropRadius).toEqual(100);
  });

  it("sets distance indicator", () => {
    const action: ReduxAction<string> = {
      type: Actions.SET_DISTANCE_INDICATOR,
      payload: "setting",
    };
    const newState = designer(oldState(), action);
    expect(newState.distanceIndicator).toEqual("setting");
  });

  it("sets top down view", () => {
    const action: ReduxAction<boolean> = {
      type: Actions.TOGGLE_3D_TOP_DOWN_VIEW,
      payload: true,
    };
    const newState = designer(oldState(), action);
    expect(newState.threeDTopDownView).toEqual(true);
  });

  it("sets exaggerated z", () => {
    const action: ReduxAction<boolean> = {
      type: Actions.TOGGLE_3D_EXAGGERATED_Z,
      payload: true,
    };
    const newState = designer(oldState(), action);
    expect(newState.threeDExaggeratedZ).toEqual(true);
  });

  it("sets 3D time", () => {
    const state = oldState();
    state.threeDTime = undefined;
    const action: ReduxAction<string | undefined> = {
      type: Actions.SET_3D_TIME,
      payload: "12:00",
    };
    const newState = designer(state, action);
    expect(newState.threeDTime).toEqual("12:00");
  });

  it("sets panel open state", () => {
    const action: ReduxAction<boolean> = {
      type: Actions.SET_PANEL_OPEN,
      payload: false,
    };
    const newState = designer(oldState(), action);
    expect(newState.panelOpen).toEqual(false);
  });

  it("sets hovered plant list item", () => {
    const action: ReduxAction<string> = {
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: "plantUuid"
    };
    const newState = designer(oldState(), action);
    expect(newState.hoveredPlantListItem).toEqual("plantUuid");
  });

  it("sets hovered sensor reading", () => {
    const action: ReduxAction<string> = {
      type: Actions.HOVER_SENSOR_READING,
      payload: "UUID"
    };
    const newState = designer(oldState(), action);
    expect(newState.hoveredSensorReading).toEqual("UUID");
  });

  it("sets hovered image", () => {
    const action: ReduxAction<string> = {
      type: Actions.HOVER_IMAGE,
      payload: "UUID"
    };
    const newState = designer(oldState(), action);
    expect(newState.hoveredImage).toEqual("UUID");
  });

  it("sets hovered point", () => {
    const action: ReduxAction<string> = {
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: "uuid"
    };
    const newState = designer(oldState(), action);
    expect(newState.hoveredPoint).toEqual("uuid");
  });

  it("sets hovered tool slot", () => {
    const action: ReduxAction<string> = {
      type: Actions.HOVER_TOOL_SLOT,
      payload: "toolSlotUuid"
    };
    const newState = designer(oldState(), action);
    expect(newState.hoveredToolSlot).toEqual("toolSlotUuid");
  });

  it("sets chosen location", () => {
    const action: ReduxAction<BotPosition> = {
      type: Actions.CHOOSE_LOCATION,
      payload: { x: 0, y: 0, z: 0 }
    };
    const newState = designer(oldState(), action);
    expect(newState.chosenLocation).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("sets query upon chosen location", () => {
    location.pathname = Path.mock(Path.location());
    const action: ReduxAction<BotPosition> = {
      type: Actions.CHOOSE_LOCATION,
      payload: { x: 0, y: 0, z: 0 },
    };
    const newState = designer(oldState(), action);
    expect(newState.chosenLocation).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("sets current point data", () => {
    const action: ReduxAction<DrawnPointPayl> = {
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: fakeDrawnPoint(),
    };
    const newState = designer(oldState(), action);
    expect(newState.drawnPoint).toEqual(fakeDrawnPoint());
  });

  it("sets opened saved garden", () => {
    const payload = 1;
    const action: ReduxAction<number | undefined> = {
      type: Actions.CHOOSE_SAVED_GARDEN,
      payload,
    };
    const newState = designer(oldState(), action);
    expect(newState.openedSavedGarden).toEqual(payload);
  });

  it("sets companion index", () => {
    const action: ReduxAction<number> = {
      type: Actions.SET_COMPANION_INDEX, payload: 1,
    };
    const newState = designer(oldState(), action);
    expect(newState.companionIndex).toEqual(1);
  });

  it("sets plant type change id", () => {
    const state = oldState();
    state.plantTypeChangeId = undefined;
    const action: ReduxAction<number | undefined> = {
      type: Actions.SET_PLANT_TYPE_CHANGE_ID, payload: 1,
    };
    const newState = designer(state, action);
    expect(newState.plantTypeChangeId).toEqual(1);
  });

  it("sets bulk plant slug", () => {
    const state = oldState();
    state.bulkPlantSlug = undefined;
    const action: ReduxAction<string | undefined> = {
      type: Actions.SET_SLUG_BULK, payload: "slug",
    };
    const newState = designer(state, action);
    expect(newState.bulkPlantSlug).toEqual("slug");
  });

  it("starts group sort type trial", () => {
    const state = oldState();
    state.tryGroupSortType = undefined;
    const action: ReduxAction<PointGroupSortType | undefined> = {
      type: Actions.TRY_SORT_TYPE, payload: "random"
    };
    const newState = designer(state, action);
    expect(newState.tryGroupSortType).toEqual("random");
  });

  it("enables edit group area in map mode", () => {
    const state = oldState();
    state.editGroupAreaInMap = false;
    const action: ReduxAction<boolean> = {
      type: Actions.EDIT_GROUP_AREA_IN_MAP, payload: true
    };
    const newState = designer(state, action);
    expect(newState.editGroupAreaInMap).toEqual(true);
  });

  it("enables sequence visualization", () => {
    const state = oldState();
    state.visualizedSequence = undefined;
    const action: ReduxAction<UUID> = {
      type: Actions.VISUALIZE_SEQUENCE, payload: "uuid"
    };
    const newState = designer(state, action);
    expect(newState.visualizedSequence).toEqual("uuid");
  });

  it("sets hovered sequence step", () => {
    const state = oldState();
    state.hoveredSequenceStep = undefined;
    const action: ReduxAction<string> = {
      type: Actions.HOVER_SEQUENCE_STEP, payload: "uuid"
    };
    const newState = designer(state, action);
    expect(newState.hoveredSequenceStep).toEqual("uuid");
  });

  it("adds hidden map image", () => {
    const state = oldState();
    state.hiddenImages = [];
    const action: ReduxAction<number | undefined> = {
      type: Actions.HIDE_MAP_IMAGE, payload: 1
    };
    const newState = designer(state, action);
    expect(newState.hiddenImages).toEqual([1]);
  });

  it("removes hidden map image", () => {
    const state = oldState();
    state.hiddenImages = [1, 2];
    const action: ReduxAction<number | undefined> = {
      type: Actions.UN_HIDE_MAP_IMAGE, payload: 2
    };
    const newState = designer(state, action);
    expect(newState.hiddenImages).toEqual([1]);
  });

  it("clears hidden map images", () => {
    const state = oldState();
    state.hiddenImages = [1];
    const action: ReduxAction<number | undefined> = {
      type: Actions.HIDE_MAP_IMAGE, payload: undefined
    };
    const newState = designer(state, action);
    expect(newState.hiddenImages).toEqual([]);
  });

  it("sets shown map images", () => {
    const state = oldState();
    state.shownImages = [];
    const action: ReduxAction<number[]> = {
      type: Actions.SET_SHOWN_MAP_IMAGES, payload: [1]
    };
    const newState = designer(state, action);
    expect(newState.shownImages).toEqual([1]);
  });

  it("sets hide un-shown map image toggle", () => {
    const state = oldState();
    state.hideUnShownImages = false;
    const action: ReduxAction<undefined> = {
      type: Actions.TOGGLE_SHOWN_IMAGES_ONLY, payload: undefined,
    };
    const newState = designer(state, action);
    expect(newState.hideUnShownImages).toEqual(true);
  });

  it("sets always highlight map image toggle", () => {
    const state = oldState();
    state.alwaysHighlightImage = false;
    const action: ReduxAction<undefined> = {
      type: Actions.TOGGLE_ALWAYS_HIGHLIGHT_IMAGE, payload: undefined,
    };
    const newState = designer(state, action);
    expect(newState.alwaysHighlightImage).toEqual(true);
  });

  it("sets show photo images", () => {
    const state = oldState();
    state.showPhotoImages = true;
    const action: ReduxAction<undefined> = {
      type: Actions.TOGGLE_SHOW_PHOTO_IMAGES, payload: undefined,
    };
    const newState = designer(state, action);
    expect(newState.showPhotoImages).toEqual(false);
  });

  it("sets show calibration images", () => {
    const state = oldState();
    state.showCalibrationImages = true;
    const action: ReduxAction<undefined> = {
      type: Actions.TOGGLE_SHOW_CALIBRATION_IMAGES, payload: undefined,
    };
    const newState = designer(state, action);
    expect(newState.showCalibrationImages).toEqual(false);
  });

  it("sets show detection images", () => {
    const state = oldState();
    state.showDetectionImages = true;
    const action: ReduxAction<undefined> = {
      type: Actions.TOGGLE_SHOW_DETECTION_IMAGES, payload: undefined,
    };
    const newState = designer(state, action);
    expect(newState.showDetectionImages).toEqual(false);
  });

  it("sets show height images", () => {
    const state = oldState();
    state.showHeightImages = true;
    const action: ReduxAction<undefined> = {
      type: Actions.TOGGLE_SHOW_HEIGHT_IMAGES, payload: undefined,
    };
    const newState = designer(state, action);
    expect(newState.showHeightImages).toEqual(false);
  });

  it("sets hovered map image", () => {
    const state = oldState();
    state.hoveredMapImage = undefined;
    const action: ReduxAction<number | undefined> = {
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: 1
    };
    const newState = designer(state, action);
    expect(newState.hoveredMapImage).toEqual(1);
  });

  it("shows camera view points", () => {
    const state = oldState();
    state.cameraViewGridId = undefined;
    const action: ReduxAction<string | undefined> = {
      type: Actions.SHOW_CAMERA_VIEW_POINTS, payload: "gridId"
    };
    const newState = designer(state, action);
    expect(newState.cameraViewGridId).toEqual("gridId");
  });

  it("adds gridId", () => {
    const state = oldState();
    state.gridIds = [];
    const action: ReduxAction<string> = {
      type: Actions.TOGGLE_GRID_ID, payload: "gridId"
    };
    const newState = designer(state, action);
    expect(newState.gridIds).toEqual(["gridId"]);
  });

  it("removes gridId", () => {
    const state = oldState();
    state.gridIds = ["gridId"];
    const action: ReduxAction<string> = {
      type: Actions.TOGGLE_GRID_ID, payload: "gridId"
    };
    const newState = designer(state, action);
    expect(newState.gridIds).toEqual([]);
  });

  it("sets grid start", () => {
    const state = oldState();
    state.gridStart = { x: 100, y: 100 };
    const action: ReduxAction<Record<"x" | "y", number>> = {
      type: Actions.SET_GRID_START, payload: { x: 200, y: 300 }
    };
    const newState = designer(state, action);
    expect(newState.gridStart).toEqual({ x: 200, y: 300 });
  });

  it("toggle soil height labels", () => {
    const state = oldState();
    state.soilHeightLabels = false;
    const action: ReduxAction<undefined> = {
      type: Actions.TOGGLE_SOIL_HEIGHT_LABELS, payload: undefined
    };
    const newState = designer(state, action);
    expect(newState.soilHeightLabels).toEqual(true);
  });

  it("opens profile", () => {
    const state = oldState();
    state.profileOpen = false;
    const action: ReduxAction<boolean> = {
      type: Actions.SET_PROFILE_OPEN, payload: true,
    };
    const newState = designer(state, action);
    expect(newState.profileOpen).toEqual(true);
  });

  it("sets profile axis", () => {
    const state = oldState();
    state.profileAxis = "x";
    const action: ReduxAction<"x" | "y"> = {
      type: Actions.SET_PROFILE_AXIS, payload: "y",
    };
    const newState = designer(state, action);
    expect(newState.profileAxis).toEqual("y");
  });

  it("sets profile position", () => {
    const state = oldState();
    state.profilePosition = { x: undefined, y: undefined };
    const action: ReduxAction<Record<"x" | "y", number>> = {
      type: Actions.SET_PROFILE_POSITION, payload: { x: 1, y: 2 },
    };
    const newState = designer(state, action);
    expect(newState.profilePosition).toEqual({ x: 1, y: 2 });
  });

  it("sets profile width", () => {
    const state = oldState();
    state.profileWidth = 100;
    const action: ReduxAction<number> = {
      type: Actions.SET_PROFILE_WIDTH, payload: 200,
    };
    const newState = designer(state, action);
    expect(newState.profileWidth).toEqual(200);
  });

  it("sets profile to follow bot", () => {
    const state = oldState();
    state.profileFollowBot = false;
    const action: ReduxAction<boolean> = {
      type: Actions.SET_PROFILE_FOLLOW_BOT, payload: true,
    };
    const newState = designer(state, action);
    expect(newState.profileFollowBot).toEqual(true);
  });
});
