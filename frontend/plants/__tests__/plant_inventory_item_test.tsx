import React from "react";
import {
  daysOldText,
  PlantInventoryItem,
  PlantInventoryItemProps,
} from "../plant_inventory_item";
import { fireEvent, render } from "@testing-library/react";
import {
  fakePlant,
  fakePlantTemplate,
} from "../../__test_support__/fake_state/resources";
import {
  mapPointClickAction,
  setHoveredPlant,
  selectPoint,
} from "../../farm_designer/map/actions";
import * as mapActions from "../../farm_designer/map/actions";
import moment from "moment";
import { Path } from "../../internal_urls";

describe("<PlantInventoryItem />", () => {
  let mapPointClickActionSpy: jest.SpyInstance;
  let setHoveredPlantSpy: jest.SpyInstance;
  let selectPointSpy: jest.SpyInstance;

  beforeEach(() => {
    window.localStorage.clear();
    delete window.__fbPerf;
    mapPointClickActionSpy = jest.spyOn(mapActions, "mapPointClickAction")
      .mockImplementation(jest.fn(() => jest.fn()));
    setHoveredPlantSpy = jest.spyOn(mapActions, "setHoveredPlant")
      .mockImplementation(jest.fn());
    selectPointSpy = jest.spyOn(mapActions, "selectPoint")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    window.localStorage.clear();
    delete window.__fbPerf;
    mapPointClickActionSpy.mockRestore();
    setHoveredPlantSpy.mockRestore();
    selectPointSpy.mockRestore();
  });

  const fakeProps = (): PlantInventoryItemProps => ({
    plant: fakePlant(),
    dispatch: jest.fn(),
    hovered: false,
  });

  const itemText = (container: HTMLElement) =>
    (container.textContent || "").toLowerCase().replace(/\s+/g, " ").trim();

  const item = (container: HTMLElement) =>
    container.querySelector(".plant-search-item") as HTMLDivElement;

  it("renders", () => {
    const { container } = render(<PlantInventoryItem {...fakeProps()} />);
    expect(itemText(container)).toContain("strawberry plant 1");
    expect(itemText(container)).toContain("planned");
    expect(item(container).classList.contains("hovered")).toBeFalsy();
  });

  it("handles missing plant name", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.name = "";
    plant.body.planted_at = "" + moment().toISOString();
    p.plant = plant;
    const { container } = render(<PlantInventoryItem {...p} />);
    expect(itemText(container)).toContain("unknown plant");
    expect(itemText(container)).toContain("1 day old");
    expect(item(container).classList.contains("hovered")).toBeFalsy();
  });

  it("renders hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const { container } = render(<PlantInventoryItem {...p} />);
    expect(item(container).classList.contains("hovered")).toBeTruthy();
  });

  it("skips unchanged benchmark rerenders", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    const p = fakeProps();
    const { rerender } = render(<PlantInventoryItem {...p} />);
    rerender(<PlantInventoryItem {...p} />);
    expect(window.__fbPerf?.counts["render.PlantInventoryItem"]).toEqual(1);
  });

  it("hover begin", () => {
    const p = fakeProps();
    const { container } = render(<PlantInventoryItem {...p} />);
    fireEvent.mouseEnter(item(container));
    expect(setHoveredPlant).toHaveBeenCalledWith(p.plant.uuid);
  });

  it("hover end", () => {
    const { container } = render(<PlantInventoryItem {...fakeProps()} />);
    fireEvent.mouseLeave(item(container));
    expect(setHoveredPlant).toHaveBeenCalledWith(undefined);
  });

  it("selects plant", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    const { container } = render(<PlantInventoryItem {...p} />);
    fireEvent.click(item(container));
    expect(mapPointClickAction).not.toHaveBeenCalled();
    expect(selectPoint).toHaveBeenCalledWith([p.plant.uuid]);
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants(p.plant.body.id));
    expect(window.__fbPerf?.marks.plant_inventory_item_click.length)
      .toEqual(1);
  });

  it("handles missing plant id", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.plant.body.id = 0;
    const { container } = render(<PlantInventoryItem {...p} />);
    fireEvent.click(item(container));
    expect(selectPoint).toHaveBeenCalledWith([p.plant.uuid]);
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("ERR_NO_PLANT_ID"));
  });

  it("removes item in box select mode", () => {
    location.pathname = Path.mock(Path.plants("select"));
    const p = fakeProps();
    const { container } = render(<PlantInventoryItem {...p} />);
    fireEvent.click(item(container));
    expect(mapPointClickAction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      p.plant.uuid);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(setHoveredPlant).toHaveBeenCalledWith(undefined);
  });

  it("selects plant template", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.plant = fakePlantTemplate();
    const { container } = render(<PlantInventoryItem {...p} />);
    fireEvent.click(item(container));
    expect(selectPoint).toHaveBeenCalledWith([p.plant.uuid]);
    expect(mockNavigate).toHaveBeenCalledWith(
      Path.savedGardens(`templates/${p.plant.body.id}`));
  });

  it("gets and sets cached icon", () => {
    const p = fakeProps();
    const { container } = render(<PlantInventoryItem {...p} />);
    fireEvent.mouseEnter(item(container));
    expect(setHoveredPlant).toHaveBeenCalledWith(p.plant.uuid);
  });
});

describe("daysOldText()", () => {
  it("returns correct text", () => {
    expect(daysOldText({ age: 1 })).toEqual("1 day old");
    expect(daysOldText({ age: 0 })).toEqual("0 days old");
    expect(daysOldText({ age: 2 })).toEqual("2 days old");
    expect(daysOldText({ age: 2, stage: "planted" })).toEqual("2 days old");
    expect(daysOldText({ age: undefined, stage: "planned" })).toEqual("planned");
  });
});
