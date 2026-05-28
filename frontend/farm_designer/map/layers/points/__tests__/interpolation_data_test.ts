import {
  fakeFarmwareEnv,
  fakePoint,
  fakeSensorReading,
} from "../../../../../__test_support__/fake_state/resources";
import {
  DEFAULT_INTERPOLATION_OPTIONS,
  fetchInterpolationOptions,
  generateData,
  getInterpolationData,
  getZAtLocation,
  interpolatedZ,
  InterpolationKey,
  InterpolationOption,
} from "../interpolation_data";

describe("interpolation data", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads stored moisture interpolation data", () => {
    localStorage.setItem("interpolationDataMoisture",
      JSON.stringify([{ x: 1, y: 2, z: 3 }]));

    expect(getInterpolationData("SensorReading"))
      .toEqual([{ x: 1, y: 2, z: 3 }]);
  });

  it("fetches interpolation options from farmware envs", () => {
    const stepSize = fakeFarmwareEnv();
    stepSize.body.key = InterpolationOption.stepSize;
    stepSize.body.value = "123";
    const useNearest = fakeFarmwareEnv();
    useNearest.body.key = InterpolationOption.useNearest;
    useNearest.body.value = "1";
    const power = fakeFarmwareEnv();
    power.body.key = InterpolationOption.power;
    power.body.value = "8";

    expect(fetchInterpolationOptions([stepSize, useNearest, power]))
      .toEqual({ stepSize: 123, useNearest: true, power: 8 });
    expect(fetchInterpolationOptions([])).toEqual(DEFAULT_INTERPOLATION_OPTIONS);
  });

  it("returns z at a location", () => {
    const env = fakeFarmwareEnv();
    env.body.key = InterpolationOption.useNearest;
    env.body.value = "1";
    const point0 = fakePoint();
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = 0;
    const point1 = fakePoint();
    point1.body.x = 100;
    point1.body.y = 100;
    point1.body.z = 100;

    expect(getZAtLocation({
      x: 60,
      y: 60,
      farmwareEnvs: [env],
      points: [point0, point1],
    })).toEqual(100);
    expect(getZAtLocation({
      x: undefined,
      y: 60,
      farmwareEnvs: [env],
      points: [point0, point1],
    })).toBeUndefined();
  });

  it("generates point interpolation data", () => {
    const point = fakePoint();
    point.uuid = "Point.1";
    point.body.x = 0;
    point.body.y = 0;
    point.body.z = 100;

    generateData({
      kind: "Point",
      points: [point],
      gridSize: { x: 100, y: 100 },
      getColor: jest.fn(() => ({ rgb: "rgb(0, 0, 0)", a: 1 })),
      options: { ...DEFAULT_INTERPOLATION_OPTIONS, stepSize: 50 },
    });

    expect(JSON.parse(localStorage.getItem(InterpolationKey.data) || "[]"))
      .toEqual([
        { x: 0, y: 0, z: 100 },
        { x: 0, y: 50, z: 100 },
        { x: 50, y: 0, z: 100 },
        { x: 50, y: 50, z: 100 },
      ]);
  });

  it("generates sensor reading interpolation data", () => {
    const reading = fakeSensorReading();
    reading.uuid = "SensorReading.1";
    reading.body.x = 0;
    reading.body.y = 0;
    reading.body.value = 800;

    generateData({
      kind: "SensorReading",
      points: [reading],
      gridSize: { x: 100, y: 100 },
      getColor: jest.fn(() => ({ rgb: "rgb(0, 0, 255)", a: 1 })),
      options: { ...DEFAULT_INTERPOLATION_OPTIONS, stepSize: 100 },
    });

    expect(getInterpolationData("SensorReading"))
      .toEqual([{ x: 0, y: 0, z: 800 }]);
  });

  it("interpolates sensor reading values through the public wrapper", () => {
    const reading0 = fakeSensorReading();
    reading0.body.x = 0;
    reading0.body.y = 0;
    reading0.body.value = 0;
    const reading1 = fakeSensorReading();
    reading1.body.x = 100;
    reading1.body.y = 100;
    reading1.body.value = 100;

    expect(interpolatedZ({ x: 50, y: 50 }, [reading0, reading1],
      DEFAULT_INTERPOLATION_OPTIONS)).toEqual(50);
  });

  it("skips points missing interpolation coordinates", () => {
    const missingX = fakePoint();
    missingX.body.x = undefined as unknown as number;
    missingX.body.y = 0;
    missingX.body.z = 100;
    const point = fakePoint();
    point.body.x = 100;
    point.body.y = 100;
    point.body.z = 200;

    expect(interpolatedZ({ x: 100, y: 100 }, [missingX, point],
      DEFAULT_INTERPOLATION_OPTIONS)).toEqual(200);
  });
});
