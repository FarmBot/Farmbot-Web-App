import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import {
  RawZones as Zones, ZonesProps, mapStateToProps,
} from "../zones_inventory";
import { fakeState } from "../../__test_support__/fake_state";
import { fakePointGroup } from "../../__test_support__/fake_state/resources";
import * as crud from "../../api/crud";
import { Path } from "../../internal_urls";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(crud, "initSaveGetId").mockImplementation(jest.fn());
});

describe("<Zones> />", () => {
  const fakeProps = (): ZonesProps => ({
    dispatch: jest.fn(),
    zones: [],
    allPoints: [],
  });

  it("renders no zones", () => {
    const { container } = render(<Zones {...fakeProps()} />);
    expect(container.textContent).toContain("No zones yet.");
  });

  it("navigates to zone info", () => {
    const p = fakeProps();
    p.zones = [fakePointGroup()];
    p.zones[0].body.id = 1;
    const { container } = render(<Zones {...p} />);
    const item = container.querySelector(".group-search-item");
    expect(item).toBeTruthy();
    fireEvent.click(item as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.zones(1));
  });

  it("navigates to unsaved zone", () => {
    const p = fakeProps();
    p.zones = [fakePointGroup()];
    p.zones[0].body.id = 0;
    const { container } = render(<Zones {...p} />);
    const item = container.querySelector(".group-search-item");
    expect(item).toBeTruthy();
    fireEvent.click(item as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.zones(0));
  });

  it("filters points", () => {
    const p = fakeProps();
    p.zones = [fakePointGroup(), fakePointGroup()];
    p.zones[0].body.name = "zone 0";
    p.zones[1].body.name = "zone 1";
    const { container } = render(<Zones {...p} />);
    const input = container.querySelector<HTMLInputElement>("input");
    expect(input).toBeTruthy();
    fireEvent.change(input as Element, {
      target: { value: "0" },
      currentTarget: { value: "0" },
    });
    expect(container.textContent).not.toContain("zone 1");
  });

  it("creates new zone", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve(1));
    const { container } = render(<Zones {...p} />);
    const button = container.querySelector(".panel-top .fb-button");
    expect(button).toBeTruthy();
    fireEvent.click(button as Element);
    expect(crud.initSaveGetId).toHaveBeenCalledWith("PointGroup", {
      name: "Untitled Zone", point_ids: []
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(Path.zones(1));
    });
  });

  it("handles zone creation error", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.reject());
    const { container } = render(<Zones {...p} />);
    const button = container.querySelector(".panel-top .fb-button");
    expect(button).toBeTruthy();
    fireEvent.click(button as Element);
    expect(crud.initSaveGetId).toHaveBeenCalledWith("PointGroup", {
      name: "Untitled Zone", point_ids: []
    });
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
