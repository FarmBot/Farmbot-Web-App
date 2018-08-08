import * as _ from "lodash";
import { CropLiveSearchResult } from "./interfaces";

export function findBySlug(
  crops: CropLiveSearchResult[], slug?: string): CropLiveSearchResult {
  const crop = _(crops).find((result) => result.crop.slug === slug);
  return crop || {
    crop: {
      name: "name",
      slug: "slug",
      binomial_name: "binomial_name",
      common_names: ["common_names"],
      description: "description",
      sun_requirements: "sun_requirements",
      sowing_method: "sowing_method",
      processing_pictures: 0
    },
    image: "https://placehold.it/350x150"
  };
}
