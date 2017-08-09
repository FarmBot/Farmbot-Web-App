
import { famrwareReducer } from "../reducer";
import { FarmwareState } from "../interfaces";
import { Actions } from "../../constants";
import { fakeImage } from "../../__test_support__/fake_state/resources";

describe("famrwareReducer", () => {
  it("Removes UUIDs from state on deletion", () => {
    let image = fakeImage();
    let oldState: FarmwareState = { currentImage: image.uuid };
    let newState = famrwareReducer(oldState, {
      type: Actions.DESTROY_RESOURCE_OK,
      payload: image
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).toBeUndefined();
  });

  it("adds UUID to state on SELECT_IMAGE", () => {
    let image = fakeImage();
    let oldState: FarmwareState = { currentImage: undefined };
    let newState = famrwareReducer(oldState, {
      type: Actions.SELECT_IMAGE,
      payload: image.uuid
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).not.toBeUndefined();
    expect(newState.currentImage).toBe(image.uuid);
  });
});
