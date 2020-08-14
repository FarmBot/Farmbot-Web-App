import { selectImage, highlightMapImage, setShownMapImages } from "../actions";
import { Actions } from "../../../constants";

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
