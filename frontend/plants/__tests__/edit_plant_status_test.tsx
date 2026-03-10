/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditPlantStatusProps } from "../plant_panel";
import {
  fakeCurve,
  fakePlant,
  fakePoint,
  fakeWeed,
} from "../../__test_support__/fake_state/resources";
import * as crud from "../../api/crud";
import {
  EditPlantStatus,
  PlantStatusBulkUpdateProps,
  PlantStatusBulkUpdate,
  EditWeedStatus,
  EditWeedStatusProps,
  PointSizeBulkUpdate,
  BulkUpdateBaseProps,
  PointColorBulkUpdate,
  PlantDateBulkUpdateProps,
  PlantDateBulkUpdate,
  PlantSlugBulkUpdate,
  PlantSlugBulkUpdateProps,
  PlantDepthBulkUpdate,
  PlantCurvesBulkUpdate,
  PlantCurvesBulkUpdateProps,
  PlantCurveBulkUpdate,
  PlantCurveBulkUpdateProps,
} from "../edit_plant_status";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";
import { CurveType } from "../../curves/templates";
import * as ui from "../../ui";

let fbSelectSpy: jest.SpyInstance;
let blurableInputSpy: jest.SpyInstance;
let colorPickerSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: any) => {
      const value = props.selectedItem ? String(props.selectedItem.value) : "";
      return <select
        className={"mock-fb-select"}
        value={value}
        onChange={e => {
          const nextValue = e.currentTarget.value;
          const selected = nextValue === ""
            ? props.list.find((item: any) => item.isNull)
            || props.list.find((item: any) => String(item.value) === "")
            : props.list.find((item: any) => String(item.value) === nextValue);
          selected && props.onChange(selected);
        }}>
        <option value={""} />
        {props.list.map((item: any, index: number) =>
          <option key={`${item.value}-${index}`} value={String(item.value)}>
            {item.label}
          </option>)}
      </select>;
    });
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation((props: any) => <input
      className={"mock-blurable-input"}
      defaultValue={props.value}
      onBlur={e => props.onCommit(e)} />);
  colorPickerSpy = jest.spyOn(ui, "ColorPicker")
    .mockImplementation((props: any) => <button
      className={"mock-color-picker"}
      onClick={() => props.onChange("green")} />);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
  blurableInputSpy.mockRestore();
  colorPickerSpy.mockRestore();
});

describe("<EditPlantStatus />", () => {
  const fakeProps = (): EditPlantStatusProps => ({
    uuid: "Plant.0.0",
    plantStatus: "planned",
    updatePlant: jest.fn(),
  });

  it("changes stage to planted", () => {
    const p = fakeProps();
    const { container } = render(<EditPlantStatus {...p} />);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element,
      { target: { value: "planted" } });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z"),
    });
  });

  it("changes stage to planned", () => {
    const p = fakeProps();
    const { container } = render(<EditPlantStatus {...p} />);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element,
      { target: { value: "planned" } });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planned",
      planted_at: undefined,
    });
  });
});

describe("<PlantStatusBulkUpdate />", () => {
  const fakeProps = (): PlantStatusBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    pointerType: "Plant",
  });

  it("doesn't update plant statuses", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const { container } = render(<PlantStatusBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element,
      { target: { value: "planted" } });
    expect(window.confirm).toHaveBeenCalled();
    expect(crud.edit).not.toHaveBeenCalled();
  });

  it("updates plant statuses", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const { container } = render(<PlantStatusBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element,
      { target: { value: "planted" } });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change status to 'planted' for 2 items?");
    expect(crud.edit).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(plant1, {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z"),
    });
    expect(crud.edit).toHaveBeenCalledWith(plant2, {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z"),
    });
  });

  it("updates weed statuses", () => {
    const p = fakeProps();
    p.pointerType = "Weed";
    const weed1 = fakeWeed();
    const weed2 = fakeWeed();
    const weed3 = fakeWeed();
    p.allPoints = [weed1, weed2, weed3];
    p.selected = [weed1.uuid, weed2.uuid];
    const { container } = render(<PlantStatusBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element,
      { target: { value: "removed" } });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change status to 'removed' for 2 items?");
    expect(crud.edit).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(weed1, { plant_stage: "removed" });
    expect(crud.edit).toHaveBeenCalledWith(weed2, { plant_stage: "removed" });
  });
});

describe("<PlantDateBulkUpdate />", () => {
  const fakeProps = (): PlantDateBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("doesn't update plant dates", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const { container } = render(<PlantDateBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    const input = container.querySelector(".mock-blurable-input") as Element;
    fireEvent.change(input,
      { target: { value: "2017-05-29T05:00:00.000Z" } });
    fireEvent.blur(input);
    expect(window.confirm).toHaveBeenCalled();
    expect(crud.edit).not.toHaveBeenCalled();
  });

  it("updates plant dates", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const { container } = render(<PlantDateBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    const input = container.querySelector(".mock-blurable-input") as Element;
    fireEvent.change(input,
      { target: { value: "2017-05-29T05:00:00.000Z" } });
    fireEvent.blur(input);
    expect(window.confirm).toHaveBeenCalledWith(
      "Change start date to 2017-05-29 for 2 items?");
    expect(crud.edit).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(plant1, {
      planted_at: "2017-05-29T05:00:00.000Z",
    });
    expect(crud.edit).toHaveBeenCalledWith(plant2, {
      planted_at: "2017-05-29T05:00:00.000Z",
    });
  });
});

describe("<PointSizeBulkUpdate />", () => {
  const fakeProps = (): BulkUpdateBaseProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
  });

  it("doesn't update plant sizes", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const { container } = render(<PointSizeBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    const input = container.querySelector("input") as Element;
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.blur(input);
    expect(window.confirm).toHaveBeenCalled();
    expect(crud.edit).not.toHaveBeenCalled();
  });

  it("updates plant sizes", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const { container } = render(<PointSizeBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    const input = container.querySelector("input") as Element;
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.blur(input);
    expect(window.confirm).toHaveBeenCalledWith(
      "Change radius to 1mm for 2 items?");
    expect(crud.edit).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(plant1, { radius: 1 });
    expect(crud.edit).toHaveBeenCalledWith(plant2, { radius: 1 });
  });
});

describe("<PlantDepthBulkUpdate />", () => {
  const fakeProps = (): BulkUpdateBaseProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
  });

  it("updates plant depths", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const { container } = render(<PlantDepthBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    const input = container.querySelector("input") as Element;
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.blur(input);
    expect(window.confirm).toHaveBeenCalledWith(
      "Change depth to 1mm for 2 items?");
    expect(crud.edit).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(plant1, { depth: 1 });
    expect(crud.edit).toHaveBeenCalledWith(plant2, { depth: 1 });
  });
});

describe("<PlantCurveBulkUpdate />", () => {
  const fakeProps = (): PlantCurveBulkUpdateProps => {
    const curve = fakeCurve();
    curve.body.id = 1;
    return {
      allPoints: [],
      selected: [],
      dispatch: jest.fn(),
      curves: [curve],
      curveType: CurveType.water,
    };
  };

  it("updates plant curves", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const { container } = render(<PlantCurveBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element,
      { target: { value: "1" } });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change Water curve for 2 items?");
    expect(crud.edit).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(plant1, { water_curve_id: 1 });
    expect(crud.edit).toHaveBeenCalledWith(plant2, { water_curve_id: 1 });
  });

  it("updates plant curves to None", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const { container } = render(<PlantCurveBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element,
      { target: { value: "" } });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change Water curve for 2 items?");
    expect(crud.edit).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(plant1, {
      water_curve_id: undefined,
    });
    expect(crud.edit).toHaveBeenCalledWith(plant2, {
      water_curve_id: undefined,
    });
  });
});

describe("<PlantCurvesBulkUpdate />", () => {
  const fakeProps = (): PlantCurvesBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    curves: [],
  });

  it("updates plant curves", () => {
    const { container } = render(<PlantCurvesBulkUpdate {...fakeProps()} />);
    expect(container.querySelectorAll(".plant-curve-bulk-update").length)
      .toEqual(3);
  });
});

describe("<PointColorBulkUpdate />", () => {
  const fakeProps = (): BulkUpdateBaseProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
  });

  it("doesn't update point colors", () => {
    const p = fakeProps();
    const point1 = fakePlant();
    const point2 = fakePlant();
    p.allPoints = [point1, point2];
    p.selected = [point1.uuid];
    const { container } = render(<PointColorBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    fireEvent.click(container.querySelector(".mock-color-picker") as Element);
    expect(window.confirm).toHaveBeenCalled();
    expect(crud.edit).not.toHaveBeenCalled();
  });

  it("updates point colors", () => {
    const p = fakeProps();
    const point1 = fakePoint();
    const point2 = fakePoint();
    const point3 = fakePoint();
    p.allPoints = [point1, point2, point3];
    p.selected = [point1.uuid, point2.uuid];
    const { container } = render(<PointColorBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    fireEvent.click(container.querySelector(".mock-color-picker") as Element);
    expect(window.confirm).toHaveBeenCalledWith(
      "Change color to green for 2 items?");
    expect(crud.edit).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(point1, { meta: { color: "green" } });
    expect(crud.edit).toHaveBeenCalledWith(point2, { meta: { color: "green" } });
  });
});

describe("<PlantSlugBulkUpdate />", () => {
  const fakeProps = (): PlantSlugBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    bulkPlantSlug: undefined,
  });

  it("doesn't update plant slug", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    plant1.body.openfarm_slug = "slug";
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    render(<PlantSlugBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    fireEvent.click(screen.getByRole("button", { name: "apply" }));
    expect(window.confirm).toHaveBeenCalled();
    expect(crud.edit).not.toHaveBeenCalled();
  });

  it("sets bulk plant slug", () => {
    const p = fakeProps();
    p.bulkPlantSlug = "slug";
    const { container } = render(<PlantSlugBulkUpdate {...p} />);
    fireEvent.click(container.querySelector(".fa-pencil") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SLUG_BULK,
      payload: "slug",
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.cropSearch());
  });

  it("updates plant slug", () => {
    const p = fakeProps();
    p.bulkPlantSlug = "slug";
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    render(<PlantSlugBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    fireEvent.click(screen.getByRole("button", { name: "apply" }));
    expect(window.confirm).toHaveBeenCalledWith(
      "Change crop type to slug for 2 plants?");
    expect(crud.edit).toHaveBeenCalledTimes(2);
    expect(crud.edit).toHaveBeenCalledWith(plant1, {
      openfarm_slug: "slug",
      name: "Slug",
    });
    expect(crud.edit).toHaveBeenCalledWith(plant2, {
      openfarm_slug: "slug",
      name: "Slug",
    });
  });
});

describe("<EditWeedStatus />", () => {
  const fakeProps = (): EditWeedStatusProps => ({
    weed: fakeWeed(),
    updateWeed: jest.fn(),
  });

  it("updates weed status", () => {
    const p = fakeProps();
    const { container } = render(<EditWeedStatus {...p} />);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element,
      { target: { value: "removed" } });
    expect(p.updateWeed).toHaveBeenCalledWith({ plant_stage: "removed" });
  });
});
