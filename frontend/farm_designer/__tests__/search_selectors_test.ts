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
      image: FilePath.DEFAULT_ICON
    });
  });

  it("returns crop default result: no slug provided", () => {
    const result = findBySlug([fakeCropLiveSearchResult()]);
    expect(result).toEqual({
      crop: expect.objectContaining({ name: "" }),
      image: FilePath.DEFAULT_ICON
    });
  });

  it("returns matched result", () => {
    const result = findBySlug([fakeCropLiveSearchResult()], "mint");
    expect(result).toEqual({
      crop: expect.objectContaining({ name: "Mint" }),
      image: "fake-mint-svg"
    });
  });
});
