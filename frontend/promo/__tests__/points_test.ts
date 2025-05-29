import { clone } from "lodash";
import { calculatePointPositions } from "../points";
import { INITIAL } from "../../three_d_garden/config";
import { SpecialStatus } from "farmbot";

describe("calculatePointPositions()", () => {
  it("calculates soil points", () => {
    const config = clone(INITIAL);
    config.soilSurface = "random";
    config.soilSurfacePointCount = 1;
    config.soilSurfaceVariance = 0;
    config.soilHeight = 100;
    expect(calculatePointPositions(config)).toEqual([{
      kind: "Point",
      uuid: expect.any(String),
      specialStatus: SpecialStatus.SAVED,
      body: {
        name: "Random Point",
        pointer_type: "GenericPointer",
        radius: 0,
        x: expect.any(Number),
        y: expect.any(Number),
        z: -100,
        meta: { at_soil_level: "true" },
      }
    }]);
  });

  it("returns no points", () => {
    const config = clone(INITIAL);
    config.soilSurface = "flat";
    config.soilSurfacePointCount = 100;
    config.soilSurfaceVariance = 100;
    config.soilHeight = 100;
    expect(calculatePointPositions(config)).toEqual([]);
  });
});
