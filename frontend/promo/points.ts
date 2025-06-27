import { SpecialStatus, TaggedGenericPointer } from "farmbot";
import { Config } from "../three_d_garden/config";
import { times } from "lodash";

export const calculatePointPositions = (config: Config): TaggedGenericPointer[] => {
  if (config.soilSurface == "flat") { return []; }
  const { bedWallThickness } = config;
  const bedLengthInner = config.bedLengthOuter - bedWallThickness * 2;
  const bedWidthInner = config.bedWidthOuter - bedWallThickness * 2;
  return times(config.soilSurfacePointCount)
    .map(() => ({
      kind: "Point",
      uuid: Math.random().toString(36),
      specialStatus: SpecialStatus.SAVED,
      body: {
        pointer_type: "GenericPointer",
        name: "Random Point",
        meta: { at_soil_level: "true" },
        // generate bot coordinates within the bed area
        x: Math.random() * bedLengthInner - config.bedXOffset + bedWallThickness,
        y: Math.random() * bedWidthInner - config.bedYOffset + bedWallThickness,
        z: -config.soilHeight + (Math.random() - 0.5) * config.soilSurfaceVariance,
        radius: 0,
      },
    }));
};
