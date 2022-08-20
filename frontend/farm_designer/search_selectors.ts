import { CropLiveSearchResult } from "./interfaces";
import { startCase, find } from "lodash";
import { FilePath } from "../internal_urls";

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
    image: FilePath.DEFAULT_ICON,
    companions: [],
  };
}
