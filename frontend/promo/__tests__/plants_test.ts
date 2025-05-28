import { clone } from "lodash";
import { calculatePlantPositions, PLANTS } from "../plants";
import { INITIAL } from "../../three_d_garden/config";
import { CROPS } from "../../crops/constants";

describe("PLANTS", () => {
  it("returns data", () => {
    expect(PLANTS.anaheimPepper.size).toEqual(150);
  });
});

describe("calculatePlantPositions()", () => {
  it("calculates plant positions", () => {
    const config = clone(INITIAL);
    config.plants = "Spring";
    const positions = calculatePlantPositions(config);
    expect(positions).toContainEqual({
      icon: CROPS.beet.icon,
      label: "Beet",
      size: 150,
      spread: 175,
      x: 350,
      y: 680,
    });
    expect(positions.length).toEqual(65);
  });

  it("returns no plants", () => {
    const config = clone(INITIAL);
    config.plants = "";
    const positions = calculatePlantPositions(config);
    expect(positions.length).toEqual(0);
  });
});
