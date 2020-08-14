import { photosReducer, PhotosState } from "../reducer";
import { Actions } from "../../constants";
import {
  fakeImage, fakeFarmwareInstallation,
} from "../../__test_support__/fake_state/resources";

describe("photosReducer", () => {
  const fakeState = (): PhotosState => ({
    currentImage: undefined,
    currentImageSize: { width: undefined, height: undefined },
  });

  it("Removes UUIDs from state on deletion", () => {
    const image = fakeImage();
    const oldState = fakeState();
    oldState.currentImage = image.uuid;
    const newState = photosReducer(oldState, {
      type: Actions.DESTROY_RESOURCE_OK,
      payload: image
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).toBeUndefined();
  });

  it("adds UUID to state on SELECT_IMAGE", () => {
    const image = fakeImage();
    const oldState = fakeState();
    const newState = photosReducer(oldState, {
      type: Actions.SELECT_IMAGE,
      payload: image.uuid
    });
    expect(oldState.currentImage).not.toEqual(newState.currentImage);
    expect(newState.currentImage).not.toBeUndefined();
    expect(newState.currentImage).toBe(image.uuid);
  });

  it("saves image size state", () => {
    const oldState = fakeState();
    const newState = photosReducer(oldState, {
      type: Actions.SET_IMAGE_SIZE,
      payload: { width: 1, height: 1 },
    });
    expect(oldState.currentImageSize).not.toEqual(newState.currentImageSize);
    expect(newState.currentImageSize.width).not.toBeUndefined();
    expect(newState.currentImageSize).toEqual({ width: 1, height: 1 });
  });

  it("sets the current image via INIT_RESOURCE", () => {
    const image = fakeImage();
    const oldState = fakeState();
    const newState = photosReducer(oldState, {
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
    const newState = photosReducer(oldState, {
      type: Actions.INIT_RESOURCE,
      payload: nonimage
    });
    expect(oldState.currentImage).toEqual(newState.currentImage);
    expect(newState.currentImage).toBeUndefined();
  });
});
