import { SpecialStatus } from "farmbot";
import {
  getPromoResourcePlants, getPromoResourcePoints, getPromoResourceWeeds,
  PROMO_RESOURCES_KEY,
} from "../resources";

describe("promo resources", () => {
  afterEach(() => {
    localStorage.removeItem(PROMO_RESOURCES_KEY);
  });

  it("returns undefined when resources are not set", () => {
    expect(getPromoResourcePlants()).toBeUndefined();
    expect(getPromoResourcePoints()).toBeUndefined();
    expect(getPromoResourceWeeds()).toBeUndefined();
  });

  it("returns undefined for invalid JSON", () => {
    localStorage.setItem(PROMO_RESOURCES_KEY, "{");
    expect(getPromoResourcePlants()).toBeUndefined();
    expect(getPromoResourcePoints()).toBeUndefined();
    expect(getPromoResourceWeeds()).toBeUndefined();
  });

  it("reads plants", () => {
    localStorage.setItem(PROMO_RESOURCES_KEY, JSON.stringify({
      plants: [{
        name: "Spinach",
        openfarm_slug: "spinach",
        x: 100,
        y: 200,
        radius: 50,
        seed: 0.5,
      }],
    }));

    expect(getPromoResourcePlants()).toEqual([expect.objectContaining({
      id: 1,
      label: "Spinach",
      size: 100,
      x: 100,
      y: 200,
      key: "spinach",
      seed: 0.5,
    })]);
  });

  it("reads points", () => {
    localStorage.setItem(PROMO_RESOURCES_KEY, JSON.stringify({
      points: [{
        name: "Point 1",
        x: 100,
        y: 200,
        z: -300,
        meta: { at_soil_level: true, color: "gray" },
      }],
    }));

    expect(getPromoResourcePoints()).toEqual([{
      kind: "Point",
      uuid: "promo-resource-point-0",
      specialStatus: SpecialStatus.SAVED,
      body: {
        pointer_type: "GenericPointer",
        name: "Point 1",
        x: 100,
        y: 200,
        z: -300,
        radius: 0,
        meta: { at_soil_level: "true", color: "gray" },
      },
    }]);
  });

  it("reads weeds", () => {
    localStorage.setItem(PROMO_RESOURCES_KEY, JSON.stringify({
      weeds: [{
        name: "Weed",
        x: 100,
        y: 200,
        z: -300,
        radius: 50,
      }],
    }));

    expect(getPromoResourceWeeds()).toEqual([{
      kind: "Point",
      uuid: "promo-resource-weed-0",
      specialStatus: SpecialStatus.SAVED,
      body: {
        id: 1,
        pointer_type: "Weed",
        name: "Weed",
        x: 100,
        y: 200,
        z: -300,
        radius: 50,
        plant_stage: "active",
        meta: { created_by: "promo", color: "red" },
      },
    }]);
  });
});
