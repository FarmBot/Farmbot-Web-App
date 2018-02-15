
import { famrwareReducer } from "../reducer";
import { FarmwareState } from "../interfaces";
import { Actions } from "../../constants";
import { fakeImage } from "../../__test_support__/fake_state/resources";

describe("famrwareReducer", () => {
  const fakeState = (): FarmwareState => {
    return {
      currentImage: undefined,
      firstPartyFarmwareNames: []
    };
  };

  it("Removes UUIDs from state on deletion", () => {
    const image = fakeImage();
    const oldState = fakeState();
    oldState.currentImage = image.uuid;
    const newState = famrwareReducer(oldState, {
      type: Actions.DESTROY_RESOURCE_OK,
      payload: image
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).toBeUndefined();
  });

  it("adds UUID to state on SELECT_IMAGE", () => {
    const image = fakeImage();
    const oldState = fakeState();
    const newState = famrwareReducer(oldState, {
      type: Actions.SELECT_IMAGE,
      payload: image.uuid
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).not.toBeUndefined();
    expect(newState.currentImage).toBe(image.uuid);
  });

  it("sets the current image via INIT_RESOURCE", () => {
    const image = fakeImage();
    const oldState = fakeState();
    const newState = famrwareReducer(oldState, {
      type: Actions.INIT_RESOURCE,
      payload: image
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).not.toBeUndefined();
    expect(newState.currentImage).toBe(image.uuid);
  });

  it("sets 1st party farmware list", () => {
    const FARMWARE_NAMES = ["1stPartyOne", "1stPartyTwo"];
    const oldState = fakeState();
    const newState = famrwareReducer(oldState, {
      type: Actions.FETCH_FIRST_PARTY_FARMWARE_NAMES_OK,
      payload: ["1stPartyOne", "1stPartyTwo"]
    });
    expect(oldState.firstPartyFarmwareNames)
      .not.toEqual(newState.firstPartyFarmwareNames);
    expect(newState.firstPartyFarmwareNames).toEqual(FARMWARE_NAMES);
  });
});
