import { CropLiveSearchResult } from "./interfaces";
import { t } from "i18next";
import { DEFAULT_ICON } from "../open_farm/icons";
import { startCase, chain } from "lodash";

export function findBySlug(
  crops: CropLiveSearchResult[], slug?: string): CropLiveSearchResult {
  const crop = chain(crops).find((result) => result.crop.slug === slug).value();
  return crop || {
    crop: {
      name: startCase((slug || t("Name")).split("-").join(" ")),
      slug: "slug",
      binomial_name: t("Binomial Name"),
      common_names: [t("Common Names")],
      description: t("Description"),
      sun_requirements: t("Sun Requirements"),
      sowing_method: t("Sowing Method"),
      processing_pictures: 0
    },
    image: DEFAULT_ICON
  };
}
