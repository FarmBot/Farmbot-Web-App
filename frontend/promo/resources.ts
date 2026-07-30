import {
  SpecialStatus, TaggedGenericPointer, TaggedWeedPointer,
} from "farmbot";
import { findCropIcon, findCropMetadata } from "../crops/metadata";
import { ThreeDGardenPlant } from "../three_d_garden/garden";

export const PROMO_RESOURCES_KEY = "PROMO_RESOURCES";

interface PromoResourcePoint {
  name?: string;
  x: number;
  y: number;
  z?: number;
  radius?: number;
  meta?: Record<string, string | boolean>;
}

interface PromoResourceLocation {
  id?: number;
  name?: string;
  x: number;
  y: number;
  z?: number;
  radius?: number;
  meta?: Record<string, string | boolean>;
}

interface PromoResourcePlant extends PromoResourceLocation {
  openfarm_slug?: string;
  seed?: number;
}

interface PromoResources {
  plants?: PromoResourcePlant[];
  points?: PromoResourcePoint[];
  weeds?: PromoResourceLocation[];
}

const stringMeta = (
  meta: Record<string, string | boolean> | undefined,
): Record<string, string> | undefined => {
  if (!meta) { return undefined; }
  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [key, "" + value]),
  );
};

const parsePromoResources = (): PromoResources | undefined => {
  const raw = localStorage.getItem(PROMO_RESOURCES_KEY);
  if (!raw) { return undefined; }
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export const getPromoResourcePlants = (): ThreeDGardenPlant[] | undefined => {
  const plants = parsePromoResources()?.plants;
  if (!plants) { return undefined; }
  return plants.map((plant, index) => {
    const slug = plant.openfarm_slug || "generic-plant";
    const metadata = findCropMetadata(slug);
    const label = plant.name || metadata.name;
    return {
      id: plant.id || index + 1,
      label,
      icon: findCropIcon(slug),
      size: plant.radius ? plant.radius * 2 : 200,
      spread: metadata.spread,
      x: plant.x,
      y: plant.y,
      key: slug,
      seed: plant.seed || 0,
    };
  });
};

export const getPromoResourcePoints =
  (): TaggedGenericPointer[] | undefined => {
    const points = parsePromoResources()?.points;
    if (!points) { return undefined; }
    return points.map((point, index) => ({
      kind: "Point",
      uuid: `promo-resource-point-${index}`,
      specialStatus: SpecialStatus.SAVED,
      body: {
        pointer_type: "GenericPointer",
        name: point.name || `Point ${index + 1}`,
        x: point.x,
        y: point.y,
        z: point.z || 0,
        radius: point.radius || 0,
        meta: stringMeta(point.meta) || { at_soil_level: "true" },
      },
    }));
  };

export const getPromoResourceWeeds = (): TaggedWeedPointer[] | undefined => {
  const weeds = parsePromoResources()?.weeds;
  if (!weeds) { return undefined; }
  return weeds.map((weed, index) => ({
    kind: "Point",
    uuid: `promo-resource-weed-${index}`,
    specialStatus: SpecialStatus.SAVED,
    body: {
      id: weed.id || index + 1,
      pointer_type: "Weed",
      name: weed.name || `Weed ${index + 1}`,
      x: weed.x,
      y: weed.y,
      z: weed.z || 0,
      radius: weed.radius || 50,
      plant_stage: "active",
      meta: stringMeta(weed.meta) || { created_by: "promo", color: "red" },
    },
  }));
};
