import * as _ from "lodash";
import { CropLiveSearchResult } from "./interfaces";

export function findBySlug(crops: CropLiveSearchResult[], slug?: string): CropLiveSearchResult {
  let crop = _(crops).find((result) => result.crop.slug === slug);
  return crop || {
    crop: {
      binomial_name: "binomial_name",
      common_names: "common_names",
      name: "name",
      row_spacing: "row_spacing",
      spread: "spread",
      description: "description",
      height: "height",
      processing_pictures: "processing_pictures",
      slug: "slug",
      sun_requirements: "sun_requirements"
    },
    image: "https://placehold.it/350x150"
  };
}
