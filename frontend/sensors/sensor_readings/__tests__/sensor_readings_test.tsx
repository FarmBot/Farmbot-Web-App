import React from "react";
import { render, act } from "@testing-library/react";
import moment from "moment";
import { SensorReadings } from "../sensor_readings";
import { SensorReadingsProps } from "../interfaces";
import {
  fakeSensorReading, fakeSensor,
} from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { destroy } from "../../../api/crud";
import * as crud from "../../../api/crud";
import { busy } from "../../../toast/toast";

let destroySpy: jest.SpyInstance;

beforeEach(() => {
  destroySpy = jest.spyOn(crud, "destroy")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  destroySpy.mockRestore();
});

describe("<SensorReadings />", () => {
  const fakeProps = (): SensorReadingsProps => ({
    sensorReadings: [fakeSensorReading()],
    sensors: [],
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
  });

  const renderWithRef = (props: SensorReadingsProps) => {
    const ref = React.createRef<SensorReadings>();
    const utils = render(<SensorReadings ref={ref} {...props} />);
    expect(ref.current).toBeTruthy();
    return { ...utils, ref };
  };

  it("renders", () => {
    const { container } = render(<SensorReadings {...fakeProps()} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["history", "sensor", "time period", "end date", "deviation"]
      .map(string => expect(txt).toContain(string));
  });

  it("toggles previous", () => {
    const { ref } = renderWithRef(fakeProps());
    expect(ref.current?.state.showPreviousPeriod).toEqual(false);
    act(() => { ref.current?.togglePrevious(); });
    expect(ref.current?.state.showPreviousPeriod).toEqual(true);
  });

  it("toggles add reading menu", () => {
    const { ref } = renderWithRef(fakeProps());
    expect(ref.current?.state.addReadingMenuOpen).toEqual(false);
    act(() => { ref.current?.toggleAddReadingMenu(); });
    expect(ref.current?.state.addReadingMenuOpen).toEqual(true);
  });

  it("sets sensor", () => {
    const s = fakeSensor();
    const p = fakeProps();
    const { ref } = renderWithRef(p);
    expect(ref.current?.state.sensor).toEqual(undefined);
    act(() => { ref.current?.setSensor(s); });
    expect(ref.current?.state.sensor).toEqual(s);
  });

  it("sets location", () => {
    const expectedLocation = { x: 1, y: 2, z: undefined };
    const { ref } = renderWithRef(fakeProps());
    expect(ref.current?.state.xyzLocation).toEqual(undefined);
    act(() => { ref.current?.setLocation(expectedLocation); });
    expect(ref.current?.state.xyzLocation).toEqual(expectedLocation);
  });

  it("sets end date", () => {
    const expected = 1515715140;
    const p = fakeProps();
    const { ref } = renderWithRef(p);
    expect(ref.current?.state.endDate).toEqual(
      moment(p.sensorReadings[0].body.created_at).startOf("day").unix());
    act(() => { ref.current?.setEndDate(expected); });
    expect(ref.current?.state.endDate).toEqual(expected);
  });

  it("sets time period", () => {
    const expected = 3600 * 24 * 7;
    const { ref } = renderWithRef(fakeProps());
    expect(ref.current?.state.timePeriod).toEqual(expect.any(Number));
    act(() => { ref.current?.setTimePeriod(expected); });
    expect(ref.current?.state.timePeriod).toEqual(expected);
  });

  it("sets deviation", () => {
    const expected = 1;
    const { ref } = renderWithRef(fakeProps());
    expect(ref.current?.state.deviation).toEqual(0);
    act(() => { ref.current?.setDeviation(expected); });
    expect(ref.current?.state.deviation).toEqual(expected);
  });

  it("sets hover", () => {
    const expected = "fake UUID";
    const { ref } = renderWithRef(fakeProps());
    expect(ref.current?.state.hovered).toEqual(undefined);
    act(() => { ref.current?.hover(expected); });
    expect(ref.current?.state.hovered).toEqual(expected);
  });

  it("clears filters", () => {
    const s = fakeSensor();
    const p = fakeProps();
    p.sensors = [s];
    const { ref } = renderWithRef(p);
    act(() => {
      ref.current?.setState({ xyzLocation: { x: 1, y: 2, z: 3 }, sensor: s });
    });
    act(() => { ref.current?.clearFilters(); });
    expect(ref.current?.state.xyzLocation).toEqual(undefined);
    expect(ref.current?.state.sensor).toEqual(undefined);
  });

  it("deletes selected readings", () => {
    jest.useFakeTimers();
    window.confirm = () => true;
    const p = fakeProps();
    const { ref } = renderWithRef(p);
    const reading = fakeSensorReading();
    reading.uuid = "uuid0";
    ref.current?.deleteSelected([reading])();
    jest.runAllTimers();
    expect(destroy).toHaveBeenCalledWith("uuid0");
    expect(busy).toHaveBeenCalledWith("Deleting 1 sensor readings...");
  });

  it("doesn't delete selected readings", () => {
    jest.useFakeTimers();
    window.confirm = () => false;
    const p = fakeProps();
    const { ref } = renderWithRef(p);
    const reading = fakeSensorReading();
    reading.uuid = "uuid0";
    ref.current?.deleteSelected([reading])();
    jest.runAllTimers();
    expect(destroy).not.toHaveBeenCalled();
  });
});
