let mockPromise: Promise<{} | void> = Promise.resolve();
jest.mock("axios", () => ({ get: () => mockPromise }));

import { executableType, OFCropFetch, OFSearch } from "../util";
import { Actions } from "../../constants";
import { FilePath } from "../../internal_urls";

describe("executableType", () => {
  it("handles expected values", () => {
    expect(executableType("Sequence")).toEqual("Sequence");
    expect(executableType("Regimen")).toEqual("Regimen");
  });

  it("throws when given bad data", () => {
    expect(() => executableType("Nope")).toThrow();
  });
});

describe("OFSearch()", () => {
  const START = expect.objectContaining({
    type: Actions.OF_SEARCH_RESULTS_START
  });
  const NO = expect.objectContaining({ type: Actions.OF_SEARCH_RESULTS_NO });

  it("searches: no image", async () => {
    mockPromise = Promise.resolve({ data: { data: [{ attributes: {} }] } });
    const dispatch = jest.fn();
    await OFSearch("mint")(dispatch);
    expect(dispatch).toHaveBeenCalledWith(START);
    await expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OF_SEARCH_RESULTS_OK, payload: [
        { crop: {}, image: FilePath.DEFAULT_ICON, companions: [] }]
    });
    await expect(dispatch).not.toHaveBeenCalledWith(NO);
  });

  it("searches: image", async () => {
    mockPromise = Promise.resolve({
      data: {
        included: [
          {
            id: 0,
            type: "crops-pictures",
            attributes: { thumbnail_url: "thumbnail_url" },
          },
          {
            id: 0,
            type: "crops",
            attributes: { name: "name", slug: "slug", svg_icon: "svg_icon" },
          },
        ],
        data: [{
          attributes: {},
          relationships: { pictures: { data: [{ id: 0 }] } }
        }]
      }
    });
    const dispatch = jest.fn();
    await OFSearch("mint")(dispatch);
    expect(dispatch).toHaveBeenCalledWith(START);
    await expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OF_SEARCH_RESULTS_OK, payload: [{
        crop: {},
        image: "thumbnail_url",
        companions: [{ name: "name", slug: "slug", svg_icon: "svg_icon" }]
      }]
    });
    await expect(dispatch).not.toHaveBeenCalledWith(NO);
  });

  it("searches: image, specific", async () => {
    mockPromise = Promise.resolve({
      data: {
        included: [
          {
            id: 0,
            type: "crops-pictures",
            attributes: { thumbnail_url: "thumbnail_url" },
          },
          {
            id: 0,
            type: "crops",
            attributes: { name: "name", slug: "slug", svg_icon: "svg_icon" },
          },
        ],
        data: {
          attributes: {},
          relationships: { pictures: { data: [{ id: 0 }] } }
        }
      }
    });
    const dispatch = jest.fn();
    await OFCropFetch("mint")(dispatch);
    expect(dispatch).toHaveBeenCalledWith(START);
    await expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OF_SEARCH_RESULTS_OK, payload: [{
        crop: {},
        image: "thumbnail_url",
        companions: [{ name: "name", slug: "slug", svg_icon: "svg_icon" }]
      }]
    });
    await expect(dispatch).not.toHaveBeenCalledWith(NO);
  });

  it("fails search", async () => {
    mockPromise = Promise.reject();
    const dispatch = jest.fn();
    await OFCropFetch("mint")(dispatch);
    expect(dispatch).toHaveBeenCalledWith(START);
    await expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.OF_SEARCH_RESULTS_OK
    }));
    await expect(dispatch).toHaveBeenCalledWith(NO);
  });
});
