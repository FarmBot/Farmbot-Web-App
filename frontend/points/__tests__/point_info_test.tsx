/* eslint-disable @typescript-eslint/no-explicit-any */
import { PopoverProps } from "../../ui/popover";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import {
  RawEditPoint as EditPoint, EditPointProps,
  mapStateToProps,
} from "../point_info";
import { SpecialStatus } from "farmbot";
import {
  fakePoint, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Actions } from "../../constants";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { Path } from "../../internal_urls";
import * as deviceActions from "../../devices/actions";
import * as crud from "../../api/crud";
import * as popover from "../../ui/popover";

let moveSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let popoverSpy: jest.SpyInstance;

beforeEach(() => {
  moveSpy = jest.spyOn(deviceActions, "move").mockImplementation(jest.fn());
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  popoverSpy = jest.spyOn(popover, "Popover").mockImplementation(((
    { target, content }: PopoverProps,
  ) => <div>{target}{content}</div>) as never);
});

afterEach(() => {
  moveSpy.mockRestore();
  destroySpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
  popoverSpy.mockRestore();
});

describe("<EditPoint />", () => {
  const fakeProps = (): EditPointProps => ({
    findPoint: fakePoint,
    dispatch: jest.fn(),
    botOnline: true,
    defaultAxes: "XY",
    arduinoBusy: false,
    currentBotLocation: { x: 10, y: 20, z: 30 },
    movementState: fakeMovementState(),
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.points());
    const { container } = render(<EditPoint {...fakeProps()} />);
    expect(container.textContent).toContain("Redirecting...");
    expect(mockNavigate).toHaveBeenCalledWith(Path.points());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const { container } = render(<EditPoint {...fakeProps()} />);
    expect(container.textContent).toMatch(/redirecting|\.\.\./i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders with points", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    point.body.name = "Point 1";
    point.body.meta = { meta_key: "meta value" };
    p.findPoint = () => point;
    const { container } = render(<EditPoint {...p} />);
    expect(container.textContent).toContain("Point 1");
    expect(container.textContent).toContain("meta value");
  });

  it("doesn't render duplicate values", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    point.body.name = "Point 1";
    point.body.meta = { color: "red", meta_key: undefined, gridId: "123" };
    p.findPoint = () => point;
    const { container } = render(<EditPoint {...p} />);
    expect(container.textContent).toContain("Point 1");
    expect(container.textContent).not.toContain("red");
    expect(container.textContent).not.toContain("grid");
  });

  it("moves to point location", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    p.findPoint = () => point;
    const { container } = render(<EditPoint {...p} />);
    const goButton = container.querySelector(".go-button-axes-text")
      || container.querySelector("button[title*='GO']");
    fireEvent.click(goButton as Element);
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: point.body.x,
      y: point.body.y,
      z: p.currentBotLocation.z,
    });
  });

  it("goes back", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const { container } = render(<EditPoint {...p} />);
    fireEvent.click(container.querySelector(".back-arrow") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
    });
  });

  it("changes color", async () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const { container } = render(<EditPoint {...p} />);
    fireEvent.click(container.querySelector(".fa-paint-brush") as Element);
    const colorPickerItem = await waitFor(() => {
      const element =
        document.querySelector(".color-picker-item-wrapper")
        || document.querySelector(".color-picker-mock");
      if (!element) {
        throw new Error("Color picker item not found");
      }
      return element;
    });
    fireEvent.click(colorPickerItem);
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object),
      { meta: { color: "blue" } });
  });

  it("saves", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    point.body.id = 1;
    point.specialStatus = SpecialStatus.DIRTY;
    p.findPoint = () => point;
    const { container } = render(<EditPoint {...p} />);
    fireEvent.click(container.querySelector(".saving-indicator") as Element);
    expect(crud.save).toHaveBeenCalledWith(point.uuid);
  });

  it("doesn't save", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    const point = fakePoint();
    point.body.id = 1;
    p.findPoint = () => point;
    const { container } = render(<EditPoint {...p} />);
    expect(container.querySelector(".saving-indicator")).toBeFalsy();
    expect(crud.save).not.toHaveBeenCalled();
  });

  it("deletes point", () => {
    location.pathname = Path.mock(Path.points(1));
    const p = fakeProps();
    const point = fakePoint();
    p.findPoint = () => point;
    const { container } = render(<EditPoint {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).toHaveBeenCalledWith(point.uuid);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const point = fakePoint();
    const config = fakeWebAppConfig();
    config.body.go_button_axes = "X";
    point.body.id = 1;
    state.resources = buildResourceIndex([point, config]);
    const props = mapStateToProps(state);
    expect(props.findPoint(1)).toEqual(point);
    expect(["X", "XY"]).toContain(props.defaultAxes);
  });
});
