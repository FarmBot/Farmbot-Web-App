import {
  computeSurface,
  filterMoisturePoints,
  FilterMoisturePointsProps,
  filterSoilPoints,
  FilterSoilPointsProps,
  filterSoilPointsWithMeta,
} from "../triangles";
import { INITIAL } from "../config";
import { clone } from "lodash";
import {
  fakePoint, fakeSensor, fakeSensorReading,
} from "../../__test_support__/fake_state/resources";
import { tagAsSoilHeight } from "../../points/soil_height";

const zs = (items: [number, number, number][]) => items.map(i => i[2]);

describe("computeSurface()", () => {
  it("computes surface: above bed top", () => {
    const config = clone(INITIAL);
    config.soilHeight = 300;
    config.columnLength = 1000;
    config.bedHeight = 1;
    const pts = filterSoilPoints({ points: [], config });
    const { vertexList } = computeSurface(pts);
    expect(zs(vertexList)).toEqual([-900, -900, -900, -900, -300, -300]);
  });

  it("computes surface: below bed bottom", () => {
    const config = clone(INITIAL);
    config.soilHeight = 500;
    config.columnLength = 100;
    config.bedHeight = 100;
    const pts = filterSoilPoints({ points: [], config });
    const { vertexList } = computeSurface(pts);
    expect(zs(vertexList)).toEqual([-100, -100, -100, -100, -500, -500]);
  });

  it("computes surface: no soil points", () => {
    const config = clone(INITIAL);
    config.soilHeight = 500;
    const pts = filterSoilPoints({ points: undefined, config });
    const { vertexList } = computeSurface(pts);
    expect(zs(vertexList)).toEqual([-500, -500, -500, -500, -500, -500]);
  });

  it("computes surface: soil points", () => {
    const point0 = fakePoint();
    tagAsSoilHeight(point0);
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = -400;
    const point1 = fakePoint();
    tagAsSoilHeight(point1);
    point0.body.x = 100;
    point0.body.y = 200;
    point0.body.z = -600;
    const soilPoints = [point0, point1];
    const config = clone(INITIAL);
    config.soilHeight = 500;
    const pts = filterSoilPoints({ points: soilPoints, config });
    const { vertexList } = computeSurface(pts);
    expect(zs(vertexList)).toEqual([-600, 0, -500, -500, -500, -500]);
  });

  it("computes surface: exaggerated", () => {
    const point0 = fakePoint();
    tagAsSoilHeight(point0);
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = -400;
    const point1 = fakePoint();
    tagAsSoilHeight(point1);
    point0.body.x = 100;
    point0.body.y = 200;
    point0.body.z = -600;
    const soilPoints = [point0, point1];
    const config = clone(INITIAL);
    config.soilHeight = 500;
    config.exaggeratedZ = true;
    config.perspective = true;
    const pts = filterSoilPoints({ points: soilPoints, config });
    const { vertexList } = computeSurface(pts);
    expect(zs(vertexList)).toEqual([-1500, 4500, -500, -500, -500, -500]);
  });
});

describe("filterSoilPoints()", () => {
  const fakeProps = (): FilterSoilPointsProps => ({
    config: clone(INITIAL),
    points: [],
  });

  it("filters points", () => {
    const p = fakeProps();
    const point0 = fakePoint();
    point0.body.x = -1000;
    tagAsSoilHeight(point0);
    const point1 = fakePoint();
    point1.body.x = 1000;
    tagAsSoilHeight(point1);
    p.points = [point0, point1];
    expect(filterSoilPoints(p).length).toEqual(5);
  });
});

describe("filterSoilPointsWithMeta()", () => {
  const fakeProps = (): FilterSoilPointsProps => ({
    config: clone(INITIAL),
    points: [],
  });

  it("builds a stable key for identical points", () => {
    const p = fakeProps();
    const point = fakePoint();
    tagAsSoilHeight(point);
    point.body.x = 100;
    point.body.y = 200;
    point.body.z = -300;
    p.points = [point];
    const first = filterSoilPointsWithMeta(p).key;
    const second = filterSoilPointsWithMeta(p).key;
    expect(first).toEqual(second);
  });

  it("updates the key when soil points change", () => {
    const p = fakeProps();
    const point = fakePoint();
    tagAsSoilHeight(point);
    point.body.x = 100;
    point.body.y = 200;
    point.body.z = -300;
    p.points = [point];
    const initial = filterSoilPointsWithMeta(p).key;
    point.body.z = -123;
    const next = filterSoilPointsWithMeta(p).key;
    expect(initial).not.toEqual(next);
  });
});

describe("filterMoisturePoints()", () => {
  const fakeProps = (): FilterMoisturePointsProps => ({
    config: clone(INITIAL),
    sensors: [],
    readings: [],
  });

  it("filters points", () => {
    const p = fakeProps();
    const sensor = fakeSensor();
    sensor.body.label = "soil moisture";
    sensor.body.id = 1;
    p.sensors = [sensor];
    const reading0 = fakeSensorReading();
    reading0.body.pin = 1;
    reading0.body.x = 0;
    reading0.body.y = 0;
    reading0.body.mode = 1;
    const reading1 = fakeSensorReading();
    reading1.body.pin = 1;
    reading1.body.x = undefined;
    reading1.body.y = 0;
    reading1.body.mode = 1;
    const reading2 = fakeSensorReading();
    reading2.body.pin = 2;
    reading2.body.x = 0;
    reading2.body.y = 0;
    reading2.body.mode = 1;
    p.readings = [reading0, reading1, reading2];
    expect(filterMoisturePoints(p).length).toEqual(9);
  });
});
