import { sample } from "lodash";
import { PlantOptions } from "./interfaces";
import { PlantPointer } from "farmbot/dist/resources/api_resources";
import { SLUGS } from "../crops/constants";

export const DEFAULT_PLANT_RADIUS = 25;

export const verifiedCropSlug = (slug: string | undefined): string =>
  (slug == "random" ? sample(SLUGS) : slug) || "not-set";

/** Factory function for Plant types. */
export function Plant(options: PlantOptions): PlantPointer {
  return {
    id: options.id,
    pointer_type: "Plant",
    name: (options.name || "Untitled Plant"),
    meta: {},
    x: (options.x || 0),
    y: (options.y || 0),
    z: 0,
    radius: (options.radius || DEFAULT_PLANT_RADIUS),
    depth: options.depth || 0,
    openfarm_slug: verifiedCropSlug(options.openfarm_slug),
    plant_stage: options.plant_stage || "planned",
    planted_at: options.planted_at,
    water_curve_id: options.water_curve_id,
    spread_curve_id: options.spread_curve_id,
    height_curve_id: options.height_curve_id,
  };
}
