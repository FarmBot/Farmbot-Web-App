import { designer } from "../reducer";
import { Actions } from "../../constants";
import { ReduxAction } from "../../redux/interfaces";
import { DesignerState, HoveredPlantPayl } from "../interfaces";

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
    };
  };

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
});
