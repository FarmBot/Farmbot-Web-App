import { mapStateToProps, getPlants, botSize } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import {
  fakePlant,
  fakePlantTemplate,
  fakeSavedGarden,
  fakeWebAppConfig,
  fakeFarmwareEnv,
  fakeSensorReading,
  fakeFirmwareConfig,
  fakeWeed,
  fakeTool,
  fakeToolSlot,
  fakePeripheral,
  fakeSequence,
} from "../../__test_support__/fake_state/resources";
import { generateUuid } from "../../resources/util";

describe("mapStateToProps()", () => {
  it("hovered plantUUID is undefined", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.hoveredPlant = {
      plantUUID: "x"
    };
    expect(mapStateToProps(state).hoveredPlant).toBeFalsy();
  });

  it("peripherals pins have correct states", () => {
    const state = fakeState();
    const peripheral1 = fakePeripheral();
    peripheral1.body.pin = 13;
    peripheral1.body.label = "LED";
    const peripheral2 = fakePeripheral();
    peripheral2.body.pin = undefined;
    peripheral2.body.label = "none";
    state.resources = buildResourceIndex([
      fakeDevice(), peripheral1, peripheral2,
    ]);
    function checkValue(input: number, value: boolean) {
      state.bot.hardware.pins = { 13: { value: input, mode: 0 } };
      const peripheralPin = mapStateToProps(state).peripheralValues[0];
      expect(peripheralPin.label).toEqual("LED");
      expect(peripheralPin.value).toEqual(value);
    }
    checkValue(0, false);
    checkValue(-1, false);
    checkValue(1, true);
    checkValue(2, true);
    expect(mapStateToProps(state).peripheralValues[1])
      .toEqual({ label: "none", value: false });
  });

  it("returns selected plant", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakePlant(), fakeDevice()]);
    const plantUuid = Object.keys(state.resources.index.byKind["Point"])[0];
    state.resources.consumers.farm_designer.selectedPoints = [plantUuid];
    expect(mapStateToProps(state).selectedPlant).toEqual(
      expect.objectContaining({ uuid: plantUuid }));
  });

  it("returns all weeds", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.show_historic_points = true;
    const point1 = fakeWeed();
    const point2 = fakeWeed();
    point2.body.plant_stage = "removed";
    const point3 = fakeWeed();
    point3.body.plant_stage = "removed";
    state.resources = buildResourceIndex([
      webAppConfig, point1, point2, point3, fakeDevice(),
    ]);
    expect(mapStateToProps(state).weeds.length).toEqual(3);
  });

  it("returns active weeds", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.show_historic_points = false;
    const point1 = fakeWeed();
    const point2 = fakeWeed();
    point2.body.plant_stage = "removed";
    const point3 = fakeWeed();
    point3.body.plant_stage = "removed";
    state.resources = buildResourceIndex([
      webAppConfig, point1, point2, point3, fakeDevice(),
    ]);
    expect(mapStateToProps(state).weeds.length).toEqual(1);
  });

  it("returns sensor readings", () => {
    const state = fakeState();
    const sr1 = fakeSensorReading();
    sr1.body.created_at = "2018-01-14T20:20:38.362Z";
    const sr2 = fakeSensorReading();
    sr2.body.created_at = "2018-01-11T20:20:38.362Z";
    state.resources = buildResourceIndex([sr1, sr2, fakeDevice()]);
    const uuid1 = Object.keys(state.resources.index.byKind["SensorReading"])[0];
    const uuid2 = Object.keys(state.resources.index.byKind["SensorReading"])[1];
    expect(mapStateToProps(state).sensorReadings).toEqual([
      expect.objectContaining({ uuid: uuid2 }),
      expect.objectContaining({ uuid: uuid1 }),
    ]);
  });

  it("returns mounted tool info", () => {
    const state = fakeState();
    const slot = fakeToolSlot();
    const tool = fakeTool();
    const device = fakeDevice();
    tool.body.id = 1;
    tool.body.name = "tool";
    slot.body.tool_id = tool.body.id;
    slot.body.pullout_direction = 1;
    device.body.mounted_tool_id = tool.body.id;
    state.resources = buildResourceIndex([tool, slot, device]);
    const props = mapStateToProps(state);
    expect(props.mountedToolInfo.name).toEqual("tool");
    expect(props.mountedToolInfo.pulloutDirection).toEqual(1);
  });

  it("returns visualized sequence body", () => {
    const state = fakeState();
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "power_off", args: {} }];
    state.resources = buildResourceIndex([sequence, fakeDevice()]);
    state.resources.consumers.farm_designer.visualizedSequence = sequence.uuid;
    const props = mapStateToProps(state);
    expect(props.visualizedSequenceBody).toEqual([
      expect.objectContaining({ kind: "power_off", args: {} }),
    ]);
  });

  it("returns empty visualized sequence body", () => {
    const state = fakeState();
    const sequence = fakeSequence();
    sequence.body.body = undefined;
    state.resources.consumers.farm_designer.visualizedSequence = sequence.uuid;
    state.resources = buildResourceIndex([sequence, fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.visualizedSequenceBody).toEqual([]);
  });
});

describe("getPlants()", () => {
  const fakeResources = () => {
    const savedGarden = fakeSavedGarden();
    savedGarden.uuid = generateUuid(1, "SavedGarden");
    savedGarden.body.id = 1;
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const template1 = fakePlantTemplate();
    template1.body.saved_garden_id = 1;
    const template2 = fakePlantTemplate();
    template2.body.saved_garden_id = 2;
    return buildResourceIndex([
      savedGarden, plant1, plant2, template1, template2, fakeDevice(),
    ]);
  };
  it("returns plants", () => {
    expect(getPlants(fakeResources()).length).toEqual(2);
  });

  it("returns plant templates", () => {
    const resources = fakeResources();
    const savedGardenId = 1;
    resources.consumers.farm_designer.openedSavedGarden = savedGardenId;
    expect(getPlants(resources).length).toEqual(1);
  });

  it("returns API farmware env", () => {
    const state = fakeState();
    state.bot.hardware.user_env = {};
    const fwEnv = fakeFarmwareEnv();
    fwEnv.body.key = "CAMERA_CALIBRATION_total_rotation_angle";
    fwEnv.body.value = 15;
    state.resources = buildResourceIndex([fwEnv, fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.cameraCalibrationData).toEqual(
      expect.objectContaining({ rotation: "15" }));
  });
});

describe("botSize()", () => {
  it("returns default bot size", () => {
    const state = fakeState();
    expect(botSize(state)).toEqual({
      x: { value: 2900, isDefault: true },
      y: { value: 1230, isDefault: true },
      z: { value: 400, isDefault: true },
    });
  });

  it("returns map setting bot size", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.map_size_x = 1000;
    webAppConfig.body.map_size_y = 1000;
    state.resources = buildResourceIndex([fakeDevice(), webAppConfig]);
    expect(botSize(state)).toEqual({
      x: { value: 1000, isDefault: true },
      y: { value: 1000, isDefault: true },
      z: { value: 400, isDefault: true },
    });
  });

  it("returns axis length setting bot size", () => {
    const state = fakeState();
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_step_per_mm_x = 2;
    firmwareConfig.body.movement_step_per_mm_y = 4;
    firmwareConfig.body.movement_stop_at_max_x = 1;
    firmwareConfig.body.movement_stop_at_max_y = 1;
    firmwareConfig.body.movement_axis_nr_steps_x = 100;
    firmwareConfig.body.movement_axis_nr_steps_y = 100;
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.map_size_x = 1000;
    webAppConfig.body.map_size_y = 1000;
    state.resources = buildResourceIndex([
      fakeDevice(), firmwareConfig, webAppConfig]);
    expect(mapStateToProps(state).botSize).toEqual({
      x: { value: 50, isDefault: false },
      y: { value: 25, isDefault: false },
      z: { value: 400, isDefault: true },
    });
  });
});
