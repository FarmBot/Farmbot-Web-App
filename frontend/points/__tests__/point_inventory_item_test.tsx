let mockDelMode = false;

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  PointInventoryItem, PointInventoryItemProps,
} from "../point_inventory_item";
import { fakePoint } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import * as mapActions from "../../farm_designer/map/actions";
import * as crud from "../../api/crud";
import { Path } from "../../internal_urls";
import * as devSupport from "../../settings/dev/dev_support";

beforeEach(() => {
  jest.spyOn(mapActions, "mapPointClickAction")
    .mockImplementation(jest.fn(() => jest.fn()));
  jest.spyOn(devSupport.DevSettings, "quickDeleteEnabled")
    .mockImplementation(() => mockDelMode);
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("<PointInventoryItem> />", () => {
  const fakeProps = (): PointInventoryItemProps => ({
    tpp: fakePoint(),
    dispatch: jest.fn(),
    hovered: false,
  });

  it("renders named point", () => {
    const p = fakeProps();
    p.tpp.body.name = "named point";
    const { container } = render(<PointInventoryItem {...p} />);
    expect(container.textContent).toContain("named point");
  });

  it("renders unnamed point", () => {
    const p = fakeProps();
    p.tpp.body.name = "";
    p.tpp.body.meta.color = "";
    const { container } = render(<PointInventoryItem {...p} />);
    expect(container.textContent).toContain("Untitled point");
    expect(container.querySelector("img")?.getAttribute("src"))
      .toContain("green");
  });

  it("deletes point", () => {
    mockDelMode = true;
    location.pathname = Path.mock(Path.points());
    const p = fakeProps();
    p.tpp.body.id = 1;
    const { container } = render(<PointInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".point-search-item") as Element);
    expect(mapActions.mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(crud.destroy).toHaveBeenCalledWith(p.tpp.uuid, true);
    mockDelMode = false;
  });

  it("hovers point in quick delete mode", () => {
    mockDelMode = true;
    location.pathname = Path.mock(Path.points());
    const p = fakeProps();
    p.tpp.body.id = 1;
    p.hovered = false;
    const { container, rerender } = render(<PointInventoryItem {...p} />);
    expect(container.querySelector(".quick-delete")?.classList.contains("hovered"))
      .toBeFalsy();
    p.hovered = true;
    rerender(<PointInventoryItem {...p} />);
    expect(container.querySelector(".quick-delete")?.classList.contains("hovered"))
      .toBeTruthy();
    mockDelMode = false;
  });

  it("navigates to point", () => {
    location.pathname = Path.mock(Path.points());
    const p = fakeProps();
    p.tpp.body.id = 1;
    const { container } = render(<PointInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".point-search-item") as Element);
    expect(mapActions.mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.points(1));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.tpp.uuid,
    });
  });

  it("navigates to point without id", () => {
    location.pathname = Path.mock(Path.points());
    const p = fakeProps();
    p.tpp.body.id = undefined;
    const { container } = render(<PointInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".point-search-item") as Element);
    expect(mapActions.mapPointClickAction).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.points("ERR_NO_POINT_ID"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.tpp.uuid,
    });
  });

  it("removes item in box select mode", () => {
    location.pathname = Path.mock(Path.plants("select"));
    const p = fakeProps();
    const { container } = render(<PointInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".point-search-item") as Element);
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

  it("hovers point", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const { container } = render(<PointInventoryItem {...p} />);
    fireEvent.mouseEnter(container.querySelector(".point-search-item") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: p.tpp.uuid
    });
  });

  it("shows hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const { container } = render(<PointInventoryItem {...p} />);
    expect(container.querySelector(".point-search-item")?.classList.contains("hovered"))
      .toBeTruthy();
  });

  it("un-hovers point", () => {
    const p = fakeProps();
    p.tpp.body.id = 1;
    const { container } = render(<PointInventoryItem {...p} />);
    fireEvent.mouseLeave(container.querySelector(".point-search-item") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
    });
  });
});
