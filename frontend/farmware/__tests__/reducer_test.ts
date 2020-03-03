import { farmwareReducer } from "../reducer";
import { FarmwareState } from "../interfaces";
import { Actions } from "../../constants";
import {
  fakeImage, fakeFarmwareInstallation,
} from "../../__test_support__/fake_state/resources";

describe("farmwareReducer", () => {
  const fakeState = (): FarmwareState => {
    return {
      currentFarmware: undefined,
      currentImage: undefined,
      firstPartyFarmwareNames: [],
      infoOpen: false,
    };
  };

  it("Removes UUIDs from state on deletion", () => {
    const image = fakeImage();
    const oldState = fakeState();
    oldState.currentImage = image.uuid;
    const newState = farmwareReducer(oldState, {
      type: Actions.DESTROY_RESOURCE_OK,
      payload: image
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).toBeUndefined();
  });

  it("adds UUID to state on SELECT_IMAGE", () => {
    const image = fakeImage();
    const oldState = fakeState();
    const newState = farmwareReducer(oldState, {
      type: Actions.SELECT_IMAGE,
      payload: image.uuid
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).not.toBeUndefined();
    expect(newState.currentImage).toBe(image.uuid);
  });

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

  it("sets the current image via INIT_RESOURCE", () => {
    const image = fakeImage();
    const oldState = fakeState();
    const newState = farmwareReducer(oldState, {
      type: Actions.INIT_RESOURCE,
      payload: image
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).not.toBeUndefined();
    expect(newState.currentImage).toBe(image.uuid);
  });

  it("doesn't set the current image via INIT_RESOURCE for non-image", () => {
    const nonimage = fakeFarmwareInstallation();
    const oldState = fakeState();
    const newState = farmwareReducer(oldState, {
      type: Actions.INIT_RESOURCE,
      payload: nonimage
    });
    expect(oldState.currentImage).toEqual(newState.currentImage);
    expect(newState.currentImage).toBeUndefined();
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
