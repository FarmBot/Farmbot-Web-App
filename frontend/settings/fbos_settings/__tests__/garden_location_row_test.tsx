import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { GardenLocationRow } from "../garden_location_row";
import { GardenLocationRowProps } from "../interfaces";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import * as crud from "../../../api/crud";
import { fakeFarmwareEnv } from "../../../__test_support__/fake_state/resources";
import { namespace3D } from "../../three_d_settings";

jest.mock("../../../ui", () => {
  const actual = jest.requireActual("../../../ui");
  return {
    ...actual,
    ToggleButton: (props: {
      toggleAction: (e: React.MouseEvent) => void,
      toggleValue: number | string | boolean | undefined,
      disabled?: boolean | undefined,
      title?: string | undefined,
    }) =>
      <button
        className={"mock-toggle-button"}
        title={props.title}
        disabled={!!props.disabled}
        onClick={e => !props.disabled && props.toggleAction(e)}>
        {String(props.toggleValue)}
      </button>,
    FBSelect: (props: {
      onChange: (ddi: { label: string, value: number | string }) => void,
    }) =>
      <button
        onClick={() => props.onChange({ label: "Outdoor", value: 0 })}>
        mock-scene-select
      </button>,
  };
});

let initSaveSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let originalGeolocation: Geolocation | undefined;

beforeEach(() => {
  originalGeolocation = navigator.geolocation;
  Object.defineProperty(navigator, "geolocation", {
    value: undefined,
    configurable: true,
  });
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

afterEach(() => {
  Object.defineProperty(navigator, "geolocation", {
    value: originalGeolocation,
    configurable: true,
  });
  initSaveSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
});

afterAll(() => {
  jest.unmock("../../../ui");
});

describe("<GardenLocationRow />", () => {
  const fakeProps = (): GardenLocationRowProps => ({
    device: fakeDevice(),
    dispatch: jest.fn(),
    farmwareEnvs: [],
  });

  it("doesn't have use location button", () => {
    const { container } = render(<GardenLocationRow {...fakeProps()} />);
    expect(container.innerHTML).not.toContain("fa-crosshairs");
  });

  it("changes location", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (cb: PositionCallback) =>
          cb({
            timestamp: 1,
            coords: {
              accuracy: 1,
              altitude: 1,
              altitudeAccuracy: 1,
              heading: 1,
              speed: 1,
              latitude: 100,
              longitude: 50,
              toJSON: jest.fn(),
            },
            toJSON: jest.fn(),
          }),
      },
      configurable: true,
    });
    const p = fakeProps();
    render(<GardenLocationRow {...p} />);
    fireEvent.click(screen.getByTitle("use current location"));
    expect(crud.edit).toHaveBeenCalledWith(p.device, { lat: 100, lng: 50 });
    expect(crud.save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("changes latitude", () => {
    const p = fakeProps();
    render(<GardenLocationRow {...p} />);
    const input = screen.getByTitle("latitude");
    fireEvent.change(input, { target: { value: "100" } });
    fireEvent.blur(input);
    expect(crud.edit).toHaveBeenCalledWith(p.device, { lat: 100 });
    expect(crud.save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("changes longitude", () => {
    const p = fakeProps();
    render(<GardenLocationRow {...p} />);
    const input = screen.getByTitle("longitude");
    fireEvent.change(input, { target: { value: "100" } });
    fireEvent.blur(input);
    expect(crud.edit).toHaveBeenCalledWith(p.device, { lng: 100 });
    expect(crud.save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("changes indoor setting", () => {
    const p = fakeProps();
    const { container } = render(<GardenLocationRow {...p} />);
    const button = container.querySelector("button.mock-toggle-button");
    expect(button).toBeTruthy();
    button && fireEvent.click(button);
    expect(crud.edit).toHaveBeenCalledWith(p.device, { indoor: true });
    expect(crud.save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("shows map link", () => {
    const p = fakeProps();
    p.device.body.lat = 100;
    p.device.body.lng = 50;
    const { container } = render(<GardenLocationRow {...p} />);
    expect(container.innerHTML).toContain("fa-map");
  });

  it("changes scene", () => {
    const p = fakeProps();
    const fakeEnv = fakeFarmwareEnv();
    fakeEnv.body.key = namespace3D("scene");
    fakeEnv.body.value = "1";
    p.farmwareEnvs = [fakeEnv];
    render(<GardenLocationRow {...p} />);
    fireEvent.click(screen.getByText("mock-scene-select"));
    expect(crud.initSave).not.toHaveBeenCalled();
    expect(crud.edit).toHaveBeenCalledWith(fakeEnv, { value: "0" });
    expect(crud.save).toHaveBeenCalledWith(fakeEnv.uuid);
  });
});
