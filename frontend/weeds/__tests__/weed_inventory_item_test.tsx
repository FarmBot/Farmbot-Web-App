import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  WeedInventoryItem,
  WeedInventoryItemProps,
} from "../weed_inventory_item";
import { fakeWeed } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import * as mapActions from "../../farm_designer/map/actions";
import * as crud from "../../api/crud";
import { Path } from "../../internal_urls";

beforeEach(() => {
  window.localStorage.clear();
  delete window.__fbPerf;
  jest.clearAllMocks();
  location.pathname = Path.mock(Path.weeds());
  jest.spyOn(mapActions, "mapPointClickAction")
    .mockImplementation(jest.fn(() => jest.fn()));
  jest.spyOn(mapActions, "selectPoint")
    .mockImplementation(jest.fn());
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

afterEach(() => {
  window.localStorage.clear();
  delete window.__fbPerf;
});


describe("<WeedInventoryItem /> />", () => {
  const fakeProps = (): WeedInventoryItemProps => ({
    tpp: fakeWeed(),
    dispatch: jest.fn(),
    hovered: false,
    maxSize: 0,
  });

  it("renders named weed", () => {
    const p = fakeProps();
    p.tpp.body.name = "named weed";
    const { container } = render(<WeedInventoryItem {...p} />);
    expect(container.textContent).toContain("named weed");
  });

  it("renders unnamed weed", () => {
    const p = fakeProps();
    p.tpp.body.name = "";
    const { container } = render(<WeedInventoryItem {...p} />);
    expect(container.textContent).toContain("Untitled weed");
  });

  it("navigates to weed", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    const p = fakeProps();
    p.tpp.body.id = 1;
    const { container } = render(<WeedInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".weed-search-item") as Element);
    expect(mapActions.mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds(1));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.tpp.uuid,
    });
    expect(window.__fbPerf?.marks.weed_inventory_item_click.length)
      .toEqual(1);
  });

  it("navigates to weed without id", () => {
    const p = fakeProps();
    p.tpp.body.id = undefined;
    const { container } = render(<WeedInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".weed-search-item") as Element);
    expect(mapActions.mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds("ERR_NO_POINT_ID"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.tpp.uuid,
    });
  });

  it("removes item in box select mode", () => {
    location.pathname = Path.mock(Path.plants("select"));
    const p = fakeProps();
    const { container } = render(<WeedInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".weed-search-item") as Element);
    expect(mapActions.mapPointClickAction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      p.tpp.uuid);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined,
    });
  });

  it("hovers weed", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const { container } = render(<WeedInventoryItem {...p} />);
    fireEvent.mouseEnter(container.querySelector(".weed-search-item") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.tpp.uuid,
    });
  });

  it("shows hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const { container } = render(<WeedInventoryItem {...p} />);
    expect(container.querySelector(".weed-search-item")
      ?.classList.contains("hovered")).toBeTruthy();
  });

  it("un-hovers weed", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const { container } = render(<WeedInventoryItem {...p} />);
    fireEvent.mouseLeave(container.querySelector(".weed-search-item") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined,
    });
  });

  it("approves weed", () => {
    const p = fakeProps();
    p.pending = true;
    const { container } = render(<WeedInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".fb-button.green") as Element);
    expect(crud.edit).toHaveBeenCalledWith(p.tpp, { plant_stage: "active" });
    expect(crud.save).toHaveBeenCalledWith(p.tpp.uuid);
  });

  it("rejects weed", () => {
    const p = fakeProps();
    p.pending = true;
    const { container } = render(<WeedInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".fb-button.red") as Element);
    expect(crud.destroy).toHaveBeenCalledWith(p.tpp.uuid, true);
  });

  it.each<[number, number, number]>([
    [100, 0, 1],
    [100, 100, 1],
    [75, 100, 0.75],
    [25, 100, 0.5],
  ])("has correct scale", (radius, max, scale) => {
    const p = fakeProps();
    p.pending = true;
    p.tpp.body.radius = radius;
    p.maxSize = max;
    const { container } = render(<WeedInventoryItem {...p} />);
    expect((container.querySelector(".weed-item-icon") as HTMLElement)
      .style.transform).toEqual(`scale(${scale})`);
  });
});
