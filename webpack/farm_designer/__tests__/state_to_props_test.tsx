import { mapStateToProps, getPlants } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import {
  fakePlant, fakePlantTemplate, fakeSavedGarden, fakePoint, fakeWebAppConfig
} from "../../__test_support__/fake_state/resources";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";

describe("mapStateToProps()", () => {
  const DISCARDED_AT = "2018-01-01T00:00:00.000Z";

  it("hovered plantUUID is undefined", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.hoveredPlant = {
      plantUUID: "x", icon: ""
    };
    expect(mapStateToProps(state).hoveredPlant).toBeFalsy();
  });

  it("peripherals pins have correct states", () => {
    const state = fakeState();
    function checkValue(input: number, value: boolean) {
      state.bot.hardware.pins = { 13: { value: input, mode: 0 } };
      const peripheralPin = mapStateToProps(state).peripherals[0];
      expect(peripheralPin.value).toEqual(value);
    }
    checkValue(0, false);
    checkValue(-1, false);
    checkValue(1, true);
    checkValue(2, true);
  });

  it("stepsPerMm is defined", () => {
    const state = fakeState();
    state.bot.hardware.mcu_params.movement_step_per_mm_x = 3;
    state.bot.hardware.mcu_params.movement_step_per_mm_y = 4;
    expect(mapStateToProps(state).stepsPerMmXY).toEqual({ x: 3, y: 4 });
  });

  it("returns selected plant", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakePlant()]);
    const plantUuid = Object.keys(state.resources.index.byKind["Point"])[0];
    state.resources.consumers.farm_designer.selectedPlants = [plantUuid];
    expect(mapStateToProps(state).selectedPlant).toEqual(
      expect.objectContaining({ uuid: plantUuid }));
  });

  it("returns all points", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    (webAppConfig.body as WebAppConfig).show_historic_points = true;
    const point1 = fakePoint();
    point1.body.discarded_at = undefined;
    const point2 = fakePoint();
    point2.body.discarded_at = DISCARDED_AT;
    const point3 = fakePoint();
    point3.body.discarded_at = DISCARDED_AT;
    state.resources = buildResourceIndex([webAppConfig, point1, point2, point3]);
    expect(mapStateToProps(state).points.length).toEqual(3);
  });

  it("returns active points", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    (webAppConfig.body as WebAppConfig).show_historic_points = false;
    const point1 = fakePoint();
    point1.body.discarded_at = undefined;
    const point2 = fakePoint();
    point2.body.discarded_at = DISCARDED_AT;
    const point3 = fakePoint();
    point3.body.discarded_at = DISCARDED_AT;
    state.resources = buildResourceIndex([webAppConfig, point1, point2, point3]);
    expect(mapStateToProps(state).points.length).toEqual(1);
  });
});

describe("getPlants()", () => {
  const fakeResources = () => {
    const savedGarden = fakeSavedGarden();
    savedGarden.body.id = 1;
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const template1 = fakePlantTemplate();
    template1.body.saved_garden_id = 1;
    const template2 = fakePlantTemplate();
    template2.body.saved_garden_id = 2;
    return buildResourceIndex([
      savedGarden, plant1, plant2, template1, template2]);
  };
  it("returns plants", () => {
    expect(getPlants(fakeResources()).length).toEqual(2);
  });

  it("returns plant templates", () => {
    const resources = fakeResources();
    const savedGardenUuid = resources.index.byKind["SavedGarden"][0];
    resources.consumers.farm_designer.openedSavedGarden = savedGardenUuid;
    expect(getPlants(resources).length).toEqual(1);
  });
});
