import {
  mapStateToProps, plantAgeAndStage, formatPlantInfo,
} from "../map_state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  fakePlant, fakePlantTemplate, fakeWebAppConfig, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import moment from "moment";

describe("mapStateToProps()", () => {
  it("returns findPlant()", () => {
    const state = fakeState();
    const plant = fakePlant();
    plant.body.id = 10;
    state.resources = buildResourceIndex([plant]);
    const uuid = Object.keys(state.resources.index.all)[0];
    const result = mapStateToProps(state);
    expect(result.findPlant(undefined)).toEqual(undefined);
    expect(result.findPlant("10")).toEqual(
      expect.objectContaining({ uuid }));
  });

  it("finds plant template", () => {
    const state = fakeState();
    const template = fakePlantTemplate();
    template.body.id = 10;
    state.resources = buildResourceIndex([template]);
    const uuid = Object.keys(state.resources.index.all)[0];
    state.resources.consumers.farm_designer.openedSavedGarden = 1;
    const result = mapStateToProps(state);
    expect(result.findPlant("10")).toEqual(
      expect.objectContaining({ uuid }));
  });

  it("returns getConfigValue()", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.show_plants = false;
    state.resources = buildResourceIndex([webAppConfig]);
    const result = mapStateToProps(state);
    expect(result.getConfigValue("show_plants")).toEqual(false);
  });
});

describe("plantAgeAndStage()", () => {
  it("returns planted at date", () => {
    const plant = fakePlant();
    plant.body.planted_at = "2018-01-11T20:20:38.362Z";
    plant.body.created_at = undefined;
    expect(plantAgeAndStage(plant).age).toBeGreaterThan(100);
  });

  it("returns plant stage", () => {
    const plant = fakePlant();
    plant.body.planted_at = undefined;
    plant.body.created_at = "2018-01-11T20:20:38.362Z";
    expect(plantAgeAndStage(plant).stage).toEqual("planned");
  });

  it("returns created at date", () => {
    const plant = fakeWeed();
    plant.body.created_at = "2018-01-11T20:20:38.362Z";
    expect(plantAgeAndStage(plant).age).toBeGreaterThan(100);
  });
});

describe("formatPlantInfo()", () => {
  it("returns info for plant", () => {
    const plant = fakePlant();
    plant.body.planted_at = "2018-01-11T20:20:38.362Z";
    plant.body.plant_stage = "planted";
    const result = formatPlantInfo(plant);
    expect(result.meta).toEqual({});
    expect(result.plantedAt).toEqual(moment("2018-01-11T20:20:38.362Z"));
    expect(result.plantStatus).toEqual("planted");
  });

  it("returns info for plant template", () => {
    const plant = fakePlantTemplate();
    const result = formatPlantInfo(plant);
    expect(result.meta).toBeUndefined();
    expect(result.plantedAt).toEqual(undefined);
    expect(result.plantStatus).toEqual("planned");
  });
});
