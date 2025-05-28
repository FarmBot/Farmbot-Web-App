import { SpecialStatus, TaggedGenericPointer } from "farmbot";
import { Config } from "../three_d_garden/config";
import { times } from "lodash";

export const calculatePointPositions = (config: Config): TaggedGenericPointer[] => {
  if (config.soilSurface == "flat") { return []; }
  return times(config.soilSurfacePointCount)
    .map(() => ({
      kind: "Point",
      uuid: Math.random().toString(36),
      specialStatus: SpecialStatus.SAVED,
      body: {
        pointer_type: "GenericPointer",
        name: "Random Point",
        meta: { at_soil_level: "true" },
        x: Math.random() * config.botSizeX,
        y: Math.random() * config.botSizeY,
        z: -config.soilHeight + (Math.random() - 0.5) * config.soilSurfaceVariance,
        radius: 0,
      },
    }));
};
