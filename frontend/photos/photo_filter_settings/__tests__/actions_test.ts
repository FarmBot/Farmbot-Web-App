import {
  toggleAlwaysHighlightImage, toggleSingleImageMode, toggleHideImage,
} from "../actions";
import { Actions } from "../../../constants";
import { fakeImage } from "../../../__test_support__/fake_state/resources";

describe("toggleAlwaysHighlightImage()", () => {
  it("enables always highlight image", () => {
    const value = false;
    const image = fakeImage();
    image.body.id = 1;
    const dispatch = jest.fn();
    toggleAlwaysHighlightImage(value, image)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_ALWAYS_HIGHLIGHT_IMAGE,
      payload: undefined,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES,
      payload: [1],
    });
  });

  it("handles missing image", () => {
    const value = false;
    const dispatch = jest.fn();
    toggleAlwaysHighlightImage(value, undefined)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_ALWAYS_HIGHLIGHT_IMAGE,
      payload: undefined,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES,
      payload: [],
    });
  });

  it("disables always highlight image", () => {
    const value = true;
    const image = fakeImage();
    image.body.id = 1;
    const dispatch = jest.fn();
    toggleAlwaysHighlightImage(value, image)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_ALWAYS_HIGHLIGHT_IMAGE,
      payload: undefined,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES,
      payload: [],
    });
  });
});

describe("toggleSingleImageMode()", () => {
  it("enables single image mode", () => {
    const image = fakeImage();
    image.body.id = 1;
    const dispatch = jest.fn();
    toggleSingleImageMode(image)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SHOWN_IMAGES_ONLY,
      payload: undefined,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES,
      payload: [1],
    });
  });

  it("disables single image mode", () => {
    const dispatch = jest.fn();
    toggleSingleImageMode(undefined)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SHOWN_IMAGES_ONLY,
      payload: undefined,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES,
      payload: [],
    });
  });
});

describe("toggleHideImage()", () => {
  it("hides image", () => {
    const payload = 1;
    const notHidden = true;
    const result = toggleHideImage(notHidden, payload);
    expect(result.type).toEqual(Actions.HIDE_MAP_IMAGE);
    expect(result.payload).toEqual(payload);
  });

  it("un-hides image", () => {
    const payload = 1;
    const notHidden = false;
    const result = toggleHideImage(notHidden, payload);
    expect(result.type).toEqual(Actions.UN_HIDE_MAP_IMAGE);
    expect(result.payload).toEqual(payload);
  });
});
