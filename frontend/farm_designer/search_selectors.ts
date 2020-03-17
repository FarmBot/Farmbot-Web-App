import { CropLiveSearchResult } from "./interfaces";
import { DEFAULT_ICON } from "../open_farm/icons";
import { startCase, find } from "lodash";

export function findBySlug(
  crops: CropLiveSearchResult[], slug?: string): CropLiveSearchResult {
  const crop = find(crops, result => result.crop.slug === slug);
  return crop || {
    crop: {
      name: startCase((slug || "").split("-").join(" ")),
      slug: slug || "",
      binomial_name: "",
      common_names: [],
      description: "",
      sun_requirements: "",
      sowing_method: "",
      processing_pictures: 0
    },
    image: DEFAULT_ICON
  };
}
