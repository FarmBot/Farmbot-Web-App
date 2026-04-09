import {
  selectImage, highlightMapImage, setShownMapImages,
} from "../actions";

describe("selectImage()", () => {
  it("selects one image", () => {
    const payload = "my uuid";
    const result = selectImage(payload);
    expect(result).toEqual(expect.objectContaining({ payload }));
    expect(typeof result.type).toEqual("string");
  });

  it("selects no image", () => {
    const payload = undefined;
    const result = selectImage(payload);
    expect(result).toEqual(expect.objectContaining({ payload }));
    expect(typeof result.type).toEqual("string");
  });
});

describe("highlightMapImage()", () => {
  it("sets highlighted image", () => {
    const payload = 1;
    const result = highlightMapImage(payload);
    expect(result).toEqual(expect.objectContaining({ payload }));
    expect(typeof result.type).toEqual("string");
  });
});

describe("setShownMapImages()", () => {
  it("sets shown images", () => {
    const result = setShownMapImages("Image.1.0");
    expect(result.payload).toEqual([1]);
    expect(typeof result.type).toEqual("string");
  });

  it("un-sets shown images", () => {
    const result = setShownMapImages(undefined);
    expect(result.payload).toEqual([]);
    expect(typeof result.type).toEqual("string");
  });
});
