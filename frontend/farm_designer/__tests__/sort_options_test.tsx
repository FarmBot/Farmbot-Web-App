import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { fakePoint } from "../../__test_support__/fake_state/resources";
import * as popover from "../../ui/popover";
import {
  PointSortMenu, orderedPoints, PointSortMenuProps,
} from "../sort_options";

let popoverSpy: jest.SpyInstance;

beforeEach(() => {
  popoverSpy = jest.spyOn(popover, "Popover")
    .mockImplementation(({ target, content }: popover.PopoverProps) =>
      <div>{target}{content}</div>);
});

afterEach(() => {
  popoverSpy.mockRestore();
});

describe("orderedPoints()", () => {
  it("orders points", () => {
    const point0 = fakePoint();
    point0.body.name = "point 0";
    point0.body.radius = 1;
    const point1 = fakePoint();
    point1.body.name = "point 1";
    point1.body.radius = 1000;
    const point2 = fakePoint();
    point2.body.name = "point 2";
    point2.body.radius = 100;
    const result = orderedPoints([point0, point1, point2],
      { sortBy: "radius", reverse: true });
    expect(result).toEqual([point1, point2, point0]);
  });
});

describe("<PointSortMenu />", () => {
  const fakeProps = (): PointSortMenuProps => ({
    sortOptions: { sortBy: undefined, reverse: false },
    onChange: jest.fn(),
  });

  it("changes sort type: default", () => {
    const p = fakeProps();
    const { container } = render(<PointSortMenu {...p} />);
    const icon = container.querySelector("i.fa-sort");
    if (!icon) { throw new Error("Expected default sort icon"); }
    fireEvent.click(icon);
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: undefined, reverse: false
    });
  });

  it("changes sort type: by age", () => {
    const p = fakeProps();
    const { container } = render(<PointSortMenu {...p} />);
    const icon = container.querySelector("i.fa-calendar");
    if (!icon) { throw new Error("Expected age sort icon"); }
    fireEvent.click(icon);
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: "created_at", reverse: false
    });
  });

  it("changes sort type: by name", () => {
    const p = fakeProps();
    const { container } = render(<PointSortMenu {...p} />);
    const icon = container.querySelector("i.fa-font");
    if (!icon) { throw new Error("Expected name sort icon"); }
    fireEvent.click(icon);
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: "name", reverse: false
    });
  });

  it("changes sort type: by size", () => {
    const p = fakeProps();
    const { container } = render(<PointSortMenu {...p} />);
    const icon = container.querySelector("i.fa-sort-amount-desc");
    if (!icon) { throw new Error("Expected size sort icon"); }
    fireEvent.click(icon);
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: "radius", reverse: true
    });
  });

  it("changes sort type: by z", () => {
    const p = fakeProps();
    const { container } = render(<PointSortMenu {...p} />);
    const icon = container.querySelector("i.z");
    if (!icon) { throw new Error("Expected z sort icon"); }
    fireEvent.click(icon);
    expect(p.onChange).toHaveBeenCalledWith({
      sortBy: "z", reverse: true
    });
  });

  it("shows selected sort method: default", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: undefined, reverse: false };
    const { container } = render(<PointSortMenu {...p} />);
    expect(container.querySelector("i.fa-sort")?.classList.contains("selected"))
      .toBeTruthy();
    expect(container.querySelector("i.fa-sort-amount-desc")
      ?.classList.contains("selected")).toBeFalsy();
  });

  it("shows selected sort method: age", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: "created_at", reverse: false };
    const { container } = render(<PointSortMenu {...p} />);
    expect(container.querySelector("i.fa-sort")?.classList.contains("selected"))
      .toBeFalsy();
    expect(container.querySelector("i.fa-calendar")
      ?.classList.contains("selected")).toBeTruthy();
  });

  it("shows selected sort method: name", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: "name", reverse: false };
    const { container } = render(<PointSortMenu {...p} />);
    expect(container.querySelector("i.fa-sort")?.classList.contains("selected"))
      .toBeFalsy();
    expect(container.querySelector("i.fa-font")
      ?.classList.contains("selected")).toBeTruthy();
  });

  it("shows selected sort method: size", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: "radius", reverse: true };
    const { container } = render(<PointSortMenu {...p} />);
    expect(container.querySelector("i.fa-sort")?.classList.contains("selected"))
      .toBeFalsy();
    expect(container.querySelector("i.fa-sort-amount-desc")
      ?.classList.contains("selected")).toBeTruthy();
  });

  it("shows selected sort method: z", () => {
    const p = fakeProps();
    p.sortOptions = { sortBy: "z", reverse: true };
    const { container } = render(<PointSortMenu {...p} />);
    expect(container.querySelector("i.fa-sort")?.classList.contains("selected"))
      .toBeFalsy();
    expect(container.querySelector("i.z")?.classList.contains("selected"))
      .toBeTruthy();
  });
});
