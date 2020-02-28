import {
  fakeSensorReading, fakeSensor
} from "../../../__test_support__/fake_state/resources";
import { filterSensorReadings } from "../filter_readings";
import { SensorReadingsState } from "../interfaces";
import moment from "moment";
import { Xyz } from "../../../devices/interfaces";

describe("filterSensorReadings()", () => {
  const createDatedReading = (timestamps: string[]) =>
    timestamps.map(timestamp => {
      const sr = fakeSensorReading();
      sr.body.created_at = timestamp;
      return sr;
    });

  const defaultCreatedAt = "2018-01-10T20:00:00.000Z";

  const createPinnedReading = (pins: number[]) =>
    pins.map(pin => {
      const sr = fakeSensorReading();
      sr.body.pin = pin;
      sr.body.created_at = defaultCreatedAt;
      return sr;
    });

  const createLocatedReading = (locations: Record<Xyz, number | undefined>[]) =>
    locations.map(xyzLocation => {
      const sr = fakeSensorReading();
      sr.body.x = xyzLocation.x;
      sr.body.y = xyzLocation.y;
      sr.body.z = xyzLocation.z;
      sr.body.created_at = defaultCreatedAt;
      return sr;
    });

  const sensorReadingsState = (): SensorReadingsState => ({
    sensor: undefined,
    timePeriod: 3600 * 24 * 7,
    endDate: 1515715140,
    xyzLocation: undefined,
    showPreviousPeriod: false,
    deviation: 0,
    hovered: undefined,
  });

  it("filters by date", () => {
    const expected = "2018-01-10T20:00:00.000Z";
    const timestamps = [expected, "2018-01-12T20:00:00.000Z"];
    const filters = sensorReadingsState();
    filters.endDate = moment(expected).unix() + 1;
    const result = filterSensorReadings(
      createDatedReading(timestamps), filters)("current");
    expect(result.length).toEqual(1);
    expect(result[0].body.created_at).toEqual(expected);
  });

  it("returns previous period readings", () => {
    const expected = "2018-01-02T20:00:00.000Z";
    const weekAhead = "2018-01-10T20:00:00.000Z";
    const timestamps = [expected, weekAhead];
    const filters = sensorReadingsState();
    filters.endDate = moment(weekAhead).unix() - 1;
    filters.showPreviousPeriod = true;
    const result = filterSensorReadings(
      createDatedReading(timestamps), filters)("previous");
    expect(result.length).toEqual(1);
    expect(result[0].body.created_at).toEqual(expected);
  });

  it("filters by sensor", () => {
    const expected = 10;
    const sensor = fakeSensor();
    sensor.body.pin = expected;
    const pins = [expected, 11];
    const filters = sensorReadingsState();
    filters.endDate = moment(defaultCreatedAt).unix() + 1;
    filters.sensor = sensor;
    const result = filterSensorReadings(
      createPinnedReading(pins), filters)("current");
    expect(result.length).toEqual(1);
    expect(result[0].body.pin).toEqual(expected);
  });

  it("filters by location", () => {
    const expected = { x: 10, y: 20, z: 30 };
    const locations = [expected, { x: 0, y: 0, z: 0 }];
    const filters = sensorReadingsState();
    filters.endDate = moment(defaultCreatedAt).unix() + 1;
    filters.xyzLocation = expected;
    const result = filterSensorReadings(
      createLocatedReading(locations), filters)("current");
    expect(result.length).toEqual(1);
    expect(result[0].body.x).toEqual(expected.x);
    expect(result[0].body.y).toEqual(expected.y);
    expect(result[0].body.z).toEqual(expected.z);
  });

  it("filters by location", () => {
    const expected = { x: 10, y: 20, z: undefined };
    const locations = [{ x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: 0 }];
    const filters = sensorReadingsState();
    filters.endDate = moment(defaultCreatedAt).unix() + 1;
    filters.xyzLocation = expected;
    filters.deviation = 100;
    const result = filterSensorReadings(
      createLocatedReading(locations), filters)("current");
    expect(result.length).toEqual(2);
  });
});
