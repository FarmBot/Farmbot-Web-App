import { farmwareReducer } from "../reducer";
import { FarmwareState } from "../interfaces";
import { Actions } from "../../constants";

describe("farmwareReducer", () => {
  const fakeState = (): FarmwareState => {
    return {
      currentFarmware: undefined,
      firstPartyFarmwareNames: [],
      infoOpen: false,
    };
  };

  it("sets the current farmware via SELECT_FARMWARE", () => {
    const oldState = fakeState();
    const newState = farmwareReducer(oldState, {
      type: Actions.SELECT_FARMWARE,
      payload: "My Farmware"
    });
    expect(oldState.currentFarmware).not.toEqual(newState.currentFarmware);
    expect(newState.currentFarmware).not.toBeUndefined();
    expect(newState.currentFarmware).toBe("My Farmware");
  });

  it("sets 1st party farmware list", () => {
    const FARMWARE_NAMES = ["1stPartyOne", "1stPartyTwo"];
    const oldState = fakeState();
    const newState = farmwareReducer(oldState, {
      type: Actions.FETCH_FIRST_PARTY_FARMWARE_NAMES_OK,
      payload: ["1stPartyOne", "1stPartyTwo"]
    });
    expect(oldState.firstPartyFarmwareNames)
      .not.toEqual(newState.firstPartyFarmwareNames);
    expect(newState.firstPartyFarmwareNames).toEqual(FARMWARE_NAMES);
  });

  it("sets the farmware info panel state", () => {
    const oldState = fakeState();
    const newState = farmwareReducer(oldState, {
      type: Actions.SET_FARMWARE_INFO_STATE,
      payload: true
    });
    expect(oldState.infoOpen).toBeFalsy();
    expect(newState.infoOpen).toBeTruthy();
  });
});
