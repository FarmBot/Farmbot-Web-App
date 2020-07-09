import {
  selectImage, highlightMapImage, toggleAlwaysHighlightImage,
  toggleSingleImageMode,
  toggleHideImage,
  setShownMapImages,
} from "../actions";
import { Actions } from "../../../constants";
import { fakeImage } from "../../../__test_support__/fake_state/resources";

describe("selectImage()", () => {
  it("selects one image", () => {
    const payload = "my uuid";
    const result = selectImage(payload);
    expect(result.type).toEqual(Actions.SELECT_IMAGE);
    expect(result.payload).toEqual(payload);
  });

  it("selects no image", () => {
    const payload = undefined;
    const result = selectImage(payload);
    expect(result.type).toEqual(Actions.SELECT_IMAGE);
    expect(result.payload).toEqual(payload);
  });
});

describe("highlightMapImage()", () => {
  it("sets highlighted image", () => {
    const payload = 1;
    const result = highlightMapImage(payload);
    expect(result.type).toEqual(Actions.HIGHLIGHT_MAP_IMAGE);
    expect(result.payload).toEqual(payload);
  });
});

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

describe("setShownMapImages()", () => {
  it("sets shown images", () => {
    const result = setShownMapImages("Image.1.0");
    expect(result.type).toEqual(Actions.SET_SHOWN_MAP_IMAGES);
    expect(result.payload).toEqual([1]);
  });

  it("un-sets shown images", () => {
    const result = setShownMapImages(undefined);
    expect(result.type).toEqual(Actions.SET_SHOWN_MAP_IMAGES);
    expect(result.payload).toEqual([]);
  });
});
