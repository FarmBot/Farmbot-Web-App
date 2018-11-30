import { CropLiveSearchResult } from "../farm_designer/interfaces";

export const fakeCropLiveSearchResult = (): CropLiveSearchResult => ({
  crop: {
    name: "Mint",
    slug: "mint",
    binomial_name: "",
    common_names: [],
    description: "",
    sun_requirements: "",
    sowing_method: "",
    processing_pictures: 0
  }, image: ""
});
