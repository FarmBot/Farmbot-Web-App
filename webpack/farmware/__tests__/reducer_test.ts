
import { famrwareReducer } from "../reducer";
import { FarmwareState } from "../interfaces";
import { Actions } from "../../constants";
import { fakeImage } from "../../__test_support__/fake_state/resources";

describe("famrwareReducer", () => {
  it("Removes UUIDs from state on deletion", () => {
    const image = fakeImage();
    const oldState: FarmwareState = { currentImage: image.uuid };
    const newState = famrwareReducer(oldState, {
      type: Actions.DESTROY_RESOURCE_OK,
      payload: image
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).toBeUndefined();
  });

  it("adds UUID to state on SELECT_IMAGE", () => {
    const image = fakeImage();
    const oldState: FarmwareState = { currentImage: undefined };
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
    const oldState: FarmwareState = { currentImage: undefined };
    const newState = famrwareReducer(oldState, {
      type: Actions.INIT_RESOURCE,
      payload: image
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).not.toBeUndefined();
    expect(newState.currentImage).toBe(image.uuid);
  });
});
