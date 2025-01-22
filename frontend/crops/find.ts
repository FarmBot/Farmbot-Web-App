import { clone, kebabCase, startCase } from "lodash";
import { CROPS, ALIASED_SLUG_LOOKUP } from "./constants";
import { Crop, Crops } from "./interfaces";

const GENERIC_PLANT_ICON = "/crops/icons/generic-plant.avif";

const customCrop = (slug: string) => {
  const generic = clone(CROPS["generic-plant"]);
  generic.name = startCase(slug);
  return generic;
};

export const findCrop = (slug: string): Crop => {
  const crop = CROPS[kebabCase(slug)];
  if (crop) { return crop; }

  return customCrop(slug);
};

export const findCrops = (searchTerm: string): Crops => {
  const term = searchTerm.toLowerCase();
  const crops = Object.entries(CROPS).filter(([_slug, crop]) =>
    crop.name.toLowerCase().includes(term))
    .reduce((crops, [slug, crop]) => {
      crops[kebabCase(slug)] = crop;
      return crops;
    }, {} as Crops);
  if (Object.values(crops).length == 0) {
    return { [kebabCase(searchTerm)]: customCrop(searchTerm) };
  }
  return crops;
};

export const findIcon = (slug: string): string => {
  let icon = findCrop(slug).icon;
  if (icon == GENERIC_PLANT_ICON) {
    icon = findCrop(ALIASED_SLUG_LOOKUP[slug]).icon;
  }
  return icon || GENERIC_PLANT_ICON;
};

export const findImage = (slug: string): string => {
  return findCrop(slug).image;
};
