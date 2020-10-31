import { designer } from "../reducer";
import { Actions } from "../../constants";
import { ReduxAction } from "../../redux/interfaces";
import {
  HoveredPlantPayl, DrawnPointPayl, CropLiveSearchResult, DrawnWeedPayl,
} from "../interfaces";
import { BotPosition } from "../../devices/interfaces";
import {
  fakeCropLiveSearchResult,
} from "../../__test_support__/fake_crop_search_result";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { PointType } from "farmbot";
import { UUID } from "../../resources/interfaces";

describe("designer reducer", () => {
  const oldState = fakeDesignerState;

  it("sets search query", () => {
    const action: ReduxAction<string> = {
      type: Actions.SEARCH_QUERY_CHANGE,
      payload: "apple"
    };
    const newState = designer(oldState(), action);
    expect(newState.cropSearchQuery).toEqual("apple");
    expect(newState.cropSearchInProgress).toEqual(true);
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
        icon: "icon",
        plantUUID: "plantUuid"
      }
    };
    const newState = designer(oldState(), action);
    expect(newState.hoveredPlant).toEqual({
      icon: "icon", plantUUID: "plantUuid"
    });
  });

  it("sets hovered plant list item", () => {
    const action: ReduxAction<string> = {
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: "plantUuid"
    };
    const newState = designer(oldState(), action);
    expect(newState.hoveredPlantListItem).toEqual("plantUuid");
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

  it("sets current point data", () => {
    const action: ReduxAction<DrawnPointPayl> = {
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { cx: 10, cy: 20, z: 0, r: 30, color: "red" }
    };
    const newState = designer(oldState(), action);
    expect(newState.drawnPoint).toEqual({
      cx: 10, cy: 20, z: 0, r: 30, color: "red"
    });
  });

  it("uses current point color", () => {
    const action: ReduxAction<DrawnPointPayl> = {
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { cx: 10, cy: 20, z: 0, r: 30 }
    };
    const state = oldState();
    state.drawnPoint = { cx: 0, cy: 0, z: 0, r: 0, color: "red" };
    const newState = designer(state, action);
    expect(newState.drawnPoint).toEqual({
      cx: 10, cy: 20, z: 0, r: 30, color: "red"
    });
  });

  it("uses default point color", () => {
    const action: ReduxAction<DrawnPointPayl> = {
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { cx: 10, cy: 20, z: 0, r: 30 }
    };
    const newState = designer(oldState(), action);
    expect(newState.drawnPoint).toEqual({
      cx: 10, cy: 20, z: 0, r: 30, color: "green"
    });
  });

  it("sets current weed data", () => {
    const action: ReduxAction<DrawnWeedPayl> = {
      type: Actions.SET_DRAWN_WEED_DATA,
      payload: { cx: 10, cy: 20, z: 0, r: 30, color: "red" }
    };
    const newState = designer(oldState(), action);
    expect(newState.drawnWeed).toEqual({
      cx: 10, cy: 20, z: 0, r: 30, color: "red"
    });
  });

  it("uses current weed color", () => {
    const action: ReduxAction<DrawnWeedPayl> = {
      type: Actions.SET_DRAWN_WEED_DATA,
      payload: { cx: 10, cy: 20, z: 0, r: 30 }
    };
    const state = oldState();
    state.drawnWeed = { cx: 0, cy: 0, z: 0, r: 0, color: "red" };
    const newState = designer(state, action);
    expect(newState.drawnWeed).toEqual({
      cx: 10, cy: 20, z: 0, r: 30, color: "red"
    });
  });

  it("uses default weed color", () => {
    const action: ReduxAction<DrawnWeedPayl> = {
      type: Actions.SET_DRAWN_WEED_DATA,
      payload: { cx: 10, cy: 20, z: 0, r: 30 }
    };
    const newState = designer(oldState(), action);
    expect(newState.drawnWeed).toEqual({
      cx: 10, cy: 20, z: 0, r: 30, color: "red"
    });
  });

  it("sets opened saved garden", () => {
    const payload = "savedGardenUuid";
    const action: ReduxAction<string | undefined> = {
      type: Actions.CHOOSE_SAVED_GARDEN,
      payload
    };
    const newState = designer(oldState(), action);
    expect(newState.openedSavedGarden).toEqual(payload);
  });

  it("stores new OpenFarm assets", () => {
    const payload: CropLiveSearchResult[] = [
      fakeCropLiveSearchResult(),
    ];
    const action: ReduxAction<typeof payload> = {
      type: Actions.OF_SEARCH_RESULTS_OK, payload
    };
    const newState = designer(oldState(), action);
    expect(newState.cropSearchResults).toEqual(payload);
    expect(newState.cropSearchInProgress).toEqual(false);
  });

  it("starts search", () => {
    const action: ReduxAction<undefined> = {
      type: Actions.OF_SEARCH_RESULTS_START, payload: undefined
    };
    const newState = designer(oldState(), action);
    expect(newState.cropSearchInProgress).toEqual(true);
  });

  it("ends search", () => {
    const state = oldState();
    state.cropSearchInProgress = true;
    const action: ReduxAction<undefined> = {
      type: Actions.OF_SEARCH_RESULTS_NO, payload: undefined
    };
    const newState = designer(state, action);
    expect(newState.cropSearchInProgress).toEqual(false);
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

  it("sets settings search term", () => {
    const state = oldState();
    state.settingsSearchTerm = "";
    const action: ReduxAction<string> = {
      type: Actions.SET_SETTINGS_SEARCH_TERM, payload: "random"
    };
    const newState = designer(state, action);
    expect(newState.settingsSearchTerm).toEqual("random");
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

  it("toggle soil height labels", () => {
    const state = oldState();
    state.soilHeightLabels = false;
    const action: ReduxAction<undefined> = {
      type: Actions.TOGGLE_SOIL_HEIGHT_LABELS, payload: undefined
    };
    const newState = designer(state, action);
    expect(newState.soilHeightLabels).toEqual(true);
  });
});
