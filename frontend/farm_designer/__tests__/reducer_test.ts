import { designer } from "../reducer";
import { Actions } from "../../constants";
import { ReduxAction } from "../../redux/interfaces";
import {
  HoveredPlantPayl, CurrentPointPayl, CropLiveSearchResult
} from "../interfaces";
import { BotPosition } from "../../devices/interfaces";
import {
  fakeCropLiveSearchResult
} from "../../__test_support__/fake_crop_search_result";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";

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

  it("selects plants", () => {
    const action: ReduxAction<string[]> = {
      type: Actions.SELECT_PLANT,
      payload: ["plantUuid"]
    };
    const newState = designer(oldState(), action);
    expect(newState.selectedPlants).toEqual(["plantUuid"]);
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
    const action: ReduxAction<CurrentPointPayl> = {
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: { cx: 10, cy: 20, r: 30, color: "red" }
    };
    const newState = designer(oldState(), action);
    expect(newState.currentPoint).toEqual({
      cx: 10, cy: 20, r: 30, color: "red"
    });
  });

  it("uses current point color", () => {
    const action: ReduxAction<CurrentPointPayl> = {
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: { cx: 10, cy: 20, r: 30 }
    };
    const state = oldState();
    state.currentPoint = { cx: 0, cy: 0, r: 0, color: "red" };
    const newState = designer(state, action);
    expect(newState.currentPoint).toEqual({
      cx: 10, cy: 20, r: 30, color: "red"
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
});
