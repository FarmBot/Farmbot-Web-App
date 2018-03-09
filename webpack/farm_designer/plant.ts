import { PlantOptions } from "./interfaces";
import { PlantPointer } from "../interfaces";

export const DEFAULT_PLANT_RADIUS = 25;

/** Factory function for Plant types. */
export function Plant(options: PlantOptions): PlantPointer {
  const openfarm_slug = options.openfarm_slug || "not-set";
  return {
    id: options.id,
    pointer_type: "Plant",
    created_at: (options.created_at || ""),
    name: (options.name || "Untitled Plant"),
    meta: {},
    x: (options.x || 0),
    y: (options.y || 0),
    z: 0,
    radius: (options.radius || DEFAULT_PLANT_RADIUS),
    openfarm_slug,
    plant_stage: "planned"
  };
}
