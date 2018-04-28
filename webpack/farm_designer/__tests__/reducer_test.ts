import { designer } from "../reducer";
import { Actions } from "../../constants";
import { ReduxAction } from "../../redux/interfaces";
import { DesignerState, HoveredPlantPayl, CurrentPointPayl, CropLiveSearchResult } from "../interfaces";
import { BotPosition } from "../../devices/interfaces";

describe("designer reducer", () => {
  const oldState = (): DesignerState => {
    return {
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
  };

  it("sets search query", () => {
    const action: ReduxAction<string> = {
      type: Actions.SEARCH_QUERY_CHANGE,
      payload: "apple"
    };
    const newState = designer(oldState(), action);
    expect(newState.cropSearchQuery).toEqual("apple");
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

  it("stores new OpenFarm assets", () => {
    const payload: CropLiveSearchResult[] = [
      {
        crop: {
          name: "wow",
          slug: "wow",
          binomial_name: "wow",
          common_names: [],
          description: "wow",
          sun_requirements: "wow",
          sowing_method: "wow",
          processing_pictures: 0
        },
        image: "lettuce"
      }
    ];
    const action: ReduxAction<typeof payload> =
      { type: Actions.OF_SEARCH_RESULTS_OK, payload };
    const newState = designer(oldState(), action);
    expect(newState.cropSearchResults).toEqual(payload);
  });
});
