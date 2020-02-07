import { mapStateToProps, plantAge } from "../map_state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import {
  fakePlant, fakePlantTemplate
} from "../../../__test_support__/fake_state/resources";

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
    state.resources.consumers.farm_designer.openedSavedGarden = "uuid";
    const result = mapStateToProps(state);
    expect(result.findPlant("10")).toEqual(
      expect.objectContaining({ uuid }));
  });
});

describe("plantAge()", () => {
  it("returns planted at date", () => {
    const plant = fakePlant();
    plant.body.planted_at = "2018-01-11T20:20:38.362Z";
    plant.body.created_at = undefined;
    expect(plantAge(plant)).toBeGreaterThan(100);
  });

  it("returns created at date", () => {
    const plant = fakePlant();
    plant.body.planted_at = undefined;
    plant.body.created_at = "2018-01-11T20:20:38.362Z";
    expect(plantAge(plant)).toBeGreaterThan(100);
  });
});
