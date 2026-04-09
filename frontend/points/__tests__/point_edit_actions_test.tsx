/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  EditPointLocation, EditPointLocationProps,
  EditPointRadius, EditPointRadiusProps,
  EditPointColor, EditPointColorProps, updatePoint, EditPointName,
  EditPointNameProps,
  EditPointSoilHeightTag,
  EditPointSoilHeightTagProps,
  EditWeedProperties,
  EditWeedPropertiesProps,
} from "../point_edit_actions";
import {
  fakePoint, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import * as crud from "../../api/crud";
import * as soilHeight from "../soil_height";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { changeBlurableInput } from "../../__test_support__/helpers";
import * as ui from "../../ui";
import { BIProps } from "../../ui/blurable_input";
import { ColorPickerProps } from "../../ui/color_picker";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let toggleSoilHeightSpy: jest.SpyInstance;
let soilHeightPointSpy: jest.SpyInstance;
let blurableInputSpy: jest.SpyInstance;
let colorPickerSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  toggleSoilHeightSpy = jest.spyOn(soilHeight, "toggleSoilHeight")
    .mockImplementation(jest.fn());
  soilHeightPointSpy = jest.spyOn(soilHeight, "soilHeightPoint")
    .mockImplementation(jest.fn());
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation(((props: BIProps) => <input
      name={props.name}
      min={props.min}
      defaultValue={props.value}
      onChange={() => { }}
      onBlur={e => props.onCommit?.(e)} />) as never);
  colorPickerSpy = jest.spyOn(ui, "ColorPicker")
    .mockImplementation(((props: ColorPickerProps) => <button
      className={"mock-color-picker"}
      onClick={() => props.onChange?.("blue")} />) as never);
});

afterEach(() => {
  editSpy.mockRestore();
  saveSpy.mockRestore();
  toggleSoilHeightSpy.mockRestore();
  soilHeightPointSpy.mockRestore();
  blurableInputSpy.mockRestore();
  colorPickerSpy.mockRestore();
});

describe("updatePoint()", () => {
  it("updates a point", () => {
    const point = fakePoint();
    updatePoint(point, jest.fn())({ radius: 100 });
    expect(crud.edit).toHaveBeenCalledWith(point, { radius: 100 });
    expect(crud.save).toHaveBeenCalledWith(point.uuid);
  });

  it("doesn't update point", () => {
    updatePoint(undefined, jest.fn())({ radius: 100 });
    expect(crud.edit).not.toHaveBeenCalled();
    expect(crud.save).not.toHaveBeenCalled();
  });
});

describe("<EditPointName />", () => {
  const fakeProps = (): EditPointNameProps => ({
    updatePoint: jest.fn(),
    name: "point name",
  });

  it("edits name", () => {
    const p = fakeProps();
    const view = render(<EditPointName {...p} />);
    changeBlurableInput(view, "new point name");
    expect(p.updatePoint).toHaveBeenCalledWith({ name: "new point name" });
  });
});

describe("<EditPointLocation />", () => {
  const fakeProps = (): EditPointLocationProps => ({
    updatePoint: jest.fn(),
    pointLocation: { x: 1, y: 2, z: 0 },
    botOnline: true,
    dispatch: jest.fn(),
    defaultAxes: "XY",
    arduinoBusy: false,
    currentBotLocation: { x: 10, y: 20, z: 30 },
    movementState: fakeMovementState(),
  });

  it("edits location", () => {
    const p = fakeProps();
    const view = render(<EditPointLocation {...p} />);
    changeBlurableInput(view, "3", 0);
    expect(p.updatePoint).toHaveBeenCalledWith({ x: 3 });
  });

  it("allows negative z values", () => {
    const p = fakeProps();
    const { container } = render(<EditPointLocation {...p} />);
    expect((container.querySelector("input[name='x']") as HTMLInputElement).min)
      .toEqual("0");
    expect((container.querySelector("input[name='z']") as HTMLInputElement)
      .getAttribute("min") ?? undefined).toBeUndefined();
  });
});

describe("<EditPointRadius />", () => {
  const fakeProps = (): EditPointRadiusProps => ({
    updatePoint: jest.fn(),
    radius: 100,
  });

  it("edits radius", () => {
    const p = fakeProps();
    const view = render(<EditPointRadius {...p} />);
    changeBlurableInput(view, "300");
    expect(p.updatePoint).toHaveBeenCalledWith({ radius: 300 });
  });
});

describe("<EditPointColor />", () => {
  const fakeProps = (): EditPointColorProps => ({
    updatePoint: jest.fn(),
    color: "red",
  });

  it("edits color", () => {
    const p = fakeProps();
    const { container } = render(<EditPointColor {...p} />);
    fireEvent.click(container.querySelector(".mock-color-picker") as Element);
    expect(p.updatePoint).toHaveBeenCalledWith({ meta: { color: "blue" } });
  });

  it("edits color from default", () => {
    const p = fakeProps();
    p.color = "";
    const { container } = render(<EditPointColor {...p} />);
    fireEvent.click(container.querySelector(".mock-color-picker") as Element);
    expect(p.updatePoint).toHaveBeenCalledWith({ meta: { color: "blue" } });
  });
});

describe("<EditPointSoilHeightTag />", () => {
  const fakeProps = (): EditPointSoilHeightTagProps => ({
    updatePoint: jest.fn(),
    point: fakePoint(),
  });

  it("edits soil height flag", () => {
    const p = fakeProps();
    const { container } = render(<EditPointSoilHeightTag {...p} />);
    fireEvent.click(container.querySelector("input") as Element);
    expect(soilHeight.toggleSoilHeight).toHaveBeenCalledWith(p.point);
  });
});

describe("<AdditionalWeedProperties />", () => {
  const fakeProps = (): EditWeedPropertiesProps => ({
    weed: fakeWeed(),
    updatePoint: jest.fn(),
    botOnline: true,
    dispatch: jest.fn(),
    defaultAxes: "XY",
    arduinoBusy: false,
    currentBotLocation: { x: 10, y: 20, z: 30 },
    movementState: fakeMovementState(),
  });

  it("renders unknown source", () => {
    const p = fakeProps();
    p.weed.body.meta = {
      meta_key: "meta value", created_by: undefined, key: undefined,
      color: "red", type: "weed",
    };
    const { container } = render(<EditWeedProperties {...p} />);
    expect(container.textContent).toContain("unknown");
    expect(container.textContent).toContain("meta value");
  });

  it("changes method", () => {
    const p = fakeProps();
    p.weed.body.meta = { removal_method: "automatic" };
    const { container } = render(<EditWeedProperties {...p} />);
    fireEvent.click(container.querySelectorAll("input[type='radio']")[1]);
    expect(p.updatePoint).toHaveBeenCalledWith({
      meta: { removal_method: "manual" }
    });
  });
});
