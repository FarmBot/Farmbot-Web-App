let mockDelMode = false;

import React from "react";
import {
  GroupInventoryItem, GroupInventoryItemProps,
} from "../group_inventory_item";
import {
  fakePointGroup, fakePlant,
} from "../../__test_support__/fake_state/resources";
import { render, screen, fireEvent } from "@testing-library/react";
import * as crud from "../../api/crud";
import * as devSupport from "../../settings/dev/dev_support";

beforeEach(() => {
  mockDelMode = false;
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  jest.spyOn(devSupport.DevSettings, "quickDeleteEnabled")
    .mockImplementation(() => mockDelMode);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("<GroupInventoryItem />", () => {
  const fakeProps = (): GroupInventoryItemProps => ({
    group: fakePointGroup(),
    allPoints: [],
    dispatch: jest.fn(),
    onClick: jest.fn(),
    hovered: true,
  });

  it("renders information about the current group", () => {
    const p = fakeProps();
    p.group.body.point_ids = [1, 2, 3];
    p.group.body.name = "woosh";
    p.group.body.member_count = 3;
    const point1 = fakePlant();
    point1.body.id = 1;
    const point2 = fakePlant();
    point2.body.id = 2;
    const point3 = fakePlant();
    point3.body.id = 3;
    p.allPoints = [point1, point2, point3];
    const { container } = render(<GroupInventoryItem {...p} />);
    expect(screen.getByText("3 items")).toBeInTheDocument();
    expect(screen.getByText("woosh")).toBeInTheDocument();
    expect(container.querySelectorAll(".hovered").length).toBe(1);
  });

  it("renders information about the current group: no member count", () => {
    const p = fakeProps();
    p.group.body.name = "woosh";
    p.group.body.member_count = undefined;
    const { container } = render(<GroupInventoryItem {...p} />);
    expect(screen.getByText("0 items")).toBeInTheDocument();
    expect(screen.getByText("woosh")).toBeInTheDocument();
    expect(container.querySelectorAll(".hovered").length).toBe(1);
  });

  it("opens group", () => {
    const p = fakeProps();
    const { container } = render(<GroupInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".group-search-item") as Element);
    expect(p.onClick).toHaveBeenCalled();
    expect(crud.destroy).not.toHaveBeenCalledWith(p.group.uuid);
  });

  it("deletes group", () => {
    mockDelMode = true;
    const p = fakeProps();
    const { container } = render(<GroupInventoryItem {...p} />);
    fireEvent.click(container.querySelector(".group-search-item") as Element);
    expect(p.onClick).not.toHaveBeenCalled();
    expect(crud.destroy).toHaveBeenCalledWith(p.group.uuid);
  });
});
