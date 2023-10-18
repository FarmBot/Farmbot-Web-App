import { findBySlug } from "../search_selectors";
import {
  fakeCropLiveSearchResult,
} from "../../__test_support__/fake_crop_search_result";
import { FilePath } from "../../internal_urls";

describe("findBySlug()", () => {
  it("returns crop default result", () => {
    const result = findBySlug([fakeCropLiveSearchResult()], "some-crop");
    expect(result).toEqual({
      crop: expect.objectContaining({ name: "Some Crop" }),
      images: [FilePath.DEFAULT_ICON],
      companions: [],
    });
  });

  it("returns crop default result: no slug provided", () => {
    const result = findBySlug([fakeCropLiveSearchResult()]);
    expect(result).toEqual({
      crop: expect.objectContaining({ name: "" }),
      images: [FilePath.DEFAULT_ICON],
      companions: [],
    });
  });

  it("returns matched result", () => {
    const result = findBySlug([fakeCropLiveSearchResult()], "mint");
    expect(result).toEqual({
      crop: expect.objectContaining({ name: "Mint" }),
      images: ["fake-mint-svg"],
      companions: [
        { name: "Strawberry", slug: "strawberry", svg_icon: "fake-strawberry-svg" },
      ],
    });
  });
});
