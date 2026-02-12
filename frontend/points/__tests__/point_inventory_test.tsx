import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import {
  RawPoints as Points, PointsProps, mapStateToProps,
} from "../point_inventory";
import {
  fakePoint, fakePointGroup,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Actions } from "../../constants";
import { tagAsSoilHeight } from "../soil_height";
import { DEFAULT_CRITERIA } from "../../point_groups/criteria/interfaces";
import { pointsPanelState } from "../../__test_support__/panel_state";
import { Path } from "../../internal_urls";
import * as pointGroupActions from "../../point_groups/actions";
import * as deletePointsModule from "../../api/delete_points";
import { mountWithContext } from "../../__test_support__/mount_with_context";

let createGroupSpy: jest.SpyInstance;
let deletePointsSpy: jest.SpyInstance;
let deletePointsByIdsSpy: jest.SpyInstance;
const originalConfirm = window.confirm;

beforeEach(() => {
  createGroupSpy = jest.spyOn(pointGroupActions, "createGroup")
    .mockImplementation(jest.fn());
  deletePointsSpy = jest.spyOn(deletePointsModule, "deletePoints")
    .mockImplementation(jest.fn());
  deletePointsByIdsSpy = jest.spyOn(deletePointsModule, "deletePointsByIds")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  createGroupSpy.mockRestore();
  deletePointsSpy.mockRestore();
  deletePointsByIdsSpy.mockRestore();
  window.confirm = originalConfirm;
});

describe("<Points />", () => {
  const fakeProps = (): PointsProps => ({
    genericPoints: [],
    dispatch: jest.fn(),
    hoveredPoint: undefined,
    gridIds: [],
    soilHeightLabels: false,
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    groups: [],
    allPoints: [],
    pointsPanelState: pointsPanelState(),
  });

  const renderWithRef = (props: PointsProps) => {
    const ref = React.createRef<Points>();
    const utils = render(<Points ref={ref} {...props} />);
    expect(ref.current).toBeTruthy();
    return { ...utils, ref };
  };

  it("renders no points", () => {
    const { container } = render(<Points {...fakeProps()} />);
    expect(container.textContent).toContain("No points yet.");
  });

  it("renders points", () => {
    const p = fakeProps();
    p.genericPoints = [fakePoint()];
    const { container } = render(<Points {...p} />);
    expect(container.textContent).toContain("Point 1");
  });

  it("toggles section", () => {
    const p = fakeProps();
    const { ref } = renderWithRef(p);
    ref.current?.toggleOpen("groups")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POINTS_PANEL_OPTION,
      payload: "groups",
    });
  });

  it("renders groups", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.name = "Point Group";
    group1.body.criteria.string_eq = { pointer_type: ["GenericPointer"] };
    const group2 = fakePointGroup();
    group2.body.name = "Plant Group";
    group2.body.criteria.string_eq = { pointer_type: ["Plant"] };
    p.groups = [group1, group2];
    const { container } = render(<Points {...p} />);
    expect(container.textContent).toContain("Groups (1)");
  });

  it("navigates to group", () => {
    const { ref } = renderWithRef(fakeProps());
    const navigate = jest.fn();
    if (ref.current) { ref.current.navigate = navigate; }
    ref.current?.navigateById(1)();
    expect(navigate).toHaveBeenCalledWith(Path.groups(1));
  });

  it("adds new group", () => {
    const p = fakeProps();
    p.pointsPanelState.groups = true;
    const { container } = render(<Points {...p} />);
    fireEvent.click(container.querySelector(".plus-group") as Element);
    expect(pointGroupActions.createGroup).toHaveBeenCalledWith({
      criteria: {
        ...DEFAULT_CRITERIA,
        string_eq: { pointer_type: ["GenericPointer"] },
      },
      navigate: expect.anything(),
    });
  });

  it("adds new point", () => {
    const p = fakeProps();
    const { container, ref } = renderWithRef(p);
    const navigate = jest.fn();
    if (ref.current) { ref.current.navigate = navigate; }
    fireEvent.click(container.querySelector(".plus-point") as Element);
    expect(navigate).toHaveBeenCalledWith(Path.points("add"));
  });

  it("navigates to point info", () => {
    location.pathname = Path.mock(Path.points());
    const p = fakeProps();
    p.genericPoints = [fakePoint()];
    p.genericPoints[0].body.id = 1;
    const { container } = mountWithContext(<Points {...p} />);
    fireEvent.click(container.querySelector(".point-search-item") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.points(1));
  });

  it("changes search term", () => {
    const p = fakeProps();
    const point0 = fakePoint();
    const point1 = fakePoint();
    p.genericPoints = [
      { ...point0, body: { ...point0.body, name: "point 0" } },
      { ...point1, body: { ...point1.body, name: "point 1" } },
    ];
    const { container, ref } = renderWithRef(p);
    fireEvent.change(container.querySelector("input[name='pointsSearchTerm']") as Element,
      { target: { value: "0" } });
    expect(ref.current?.state.searchTerm).toEqual("0");
  });

  it("filters points", () => {
    const p = fakeProps();
    const point0 = fakePoint();
    const point1 = fakePoint();
    p.genericPoints = [
      { ...point0, body: { ...point0.body, name: "point 0" } },
      { ...point1, body: { ...point1.body, name: "point 1" } },
    ];
    const { container } = render(<Points {...p} />);
    fireEvent.change(container.querySelector("input[name='pointsSearchTerm']") as Element,
      { target: { value: "0" } });
    expect(container.textContent).not.toContain("point 1");
  });

  it("filters point grids", () => {
    const p = fakeProps();
    const gridPoint = fakePoint();
    gridPoint.body.meta.gridId = "123";
    gridPoint.body.name = "mesh";
    p.genericPoints = [gridPoint];
    const { container } = render(<Points {...p} />);
    fireEvent.change(container.querySelector("input[name='pointsSearchTerm']") as Element,
      { target: { value: "0" } });
    expect(container.textContent).not.toContain("mesh");
  });

  it("changes sort term", () => {
    const { ref } = renderWithRef(fakeProps());
    expect(ref.current?.state.sortBy).toEqual(undefined);
    act(() => {
      ref.current?.setState({ sortBy: "radius", reverse: true });
    });
    expect(ref.current?.state.sortBy).toEqual("radius");
    expect(ref.current?.state.reverse).toEqual(true);
  });

  it("expands soil height section", () => {
    const p = fakeProps();
    const soilHeightPoint = fakePoint();
    soilHeightPoint.body.meta.color = "orange";
    tagAsSoilHeight(soilHeightPoint);
    p.genericPoints = [fakePoint(), soilHeightPoint];
    const { container, rerender } = renderWithRef(p);
    expect(container.innerHTML).not.toContain("orange");
    expect(container.textContent?.toLowerCase()).toContain("soil height");
    fireEvent.click(container.querySelectorAll(".fa-caret-down")[1] as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POINTS_PANEL_OPTION,
      payload: "soilHeight",
    });
    p.pointsPanelState.soilHeight = true;
    rerender(<Points {...p} />);
    expect(container.innerHTML).toContain("orange");
  });

  it("expands soil height color section", () => {
    const p = fakeProps();
    const soilHeightPoint = fakePoint();
    soilHeightPoint.body.meta.color = "orange";
    soilHeightPoint.body.z = 90;
    tagAsSoilHeight(soilHeightPoint);
    const soilHeightPointRed = fakePoint();
    soilHeightPointRed.body.meta.color = "red";
    soilHeightPointRed.body.z = 100;
    tagAsSoilHeight(soilHeightPointRed);
    p.genericPoints = [fakePoint(), soilHeightPoint, soilHeightPointRed];
    const { container, ref } = renderWithRef(p);
    expect(container.innerHTML).not.toContain("soil-point-graphic");
    expect(container.textContent?.toLowerCase()).toContain("all soil height");
    expect(ref.current?.state.soilHeightColors).toEqual([]);
    fireEvent.click(container.querySelectorAll(".fa-caret-down")[2] as Element);
    expect(ref.current?.state.soilHeightColors).toEqual(["red"]);
    expect(container.innerHTML).toContain("soil-point-graphic");
    fireEvent.click(container.querySelectorAll(".fa-caret-up")[1] as Element);
    expect(ref.current?.state.soilHeightColors).toEqual([]);
  });

  it("expands grid points section", () => {
    const p = fakeProps();
    const gridPoint = fakePoint();
    gridPoint.body.meta.gridId = "123";
    gridPoint.body.name = "mesh";
    p.genericPoints = [fakePoint(), gridPoint];
    const { container, ref } = renderWithRef(p);
    expect(container.textContent?.toLowerCase()).toContain("mesh grid");
    expect(ref.current?.state.gridIds).toEqual([]);
    fireEvent.click(container.querySelectorAll(".fa-caret-down")[1] as Element);
    expect(ref.current?.state.gridIds).toEqual(["123"]);
    fireEvent.click(container.querySelectorAll(".fa-caret-up")[1] as Element);
    expect(ref.current?.state.gridIds).toEqual([]);
  });

  it("doesn't delete all section points", () => {
    const p = fakeProps();
    const gridPoint = fakePoint();
    gridPoint.body.meta.gridId = "123";
    p.genericPoints = [fakePoint(), gridPoint];
    window.confirm = () => false;
    const { container, ref } = renderWithRef(p);
    act(() => {
      ref.current?.setState({ gridIds: ["123"] });
    });
    fireEvent.click(container.querySelectorAll(".delete")[0] as Element);
    expect(deletePointsModule.deletePoints).not.toHaveBeenCalled();
    expect(deletePointsModule.deletePointsByIds).not.toHaveBeenCalled();
  });

  it("deletes all standard points", () => {
    const p = fakeProps();
    const gridPoint = fakePoint();
    gridPoint.body.meta.gridId = "123";
    p.genericPoints = [fakePoint(), gridPoint];
    window.confirm = () => true;
    const { container, ref } = renderWithRef(p);
    act(() => {
      ref.current?.setState({ gridIds: ["123"] });
    });
    fireEvent.click(container.querySelectorAll(".delete")[0] as Element);
    expect(deletePointsModule.deletePointsByIds).toHaveBeenCalledWith("points",
      [p.genericPoints[0].body.id]);
    expect(deletePointsModule.deletePoints).not.toHaveBeenCalled();
  });

  it("deletes all grid points", () => {
    const p = fakeProps();
    const gridPoint = fakePoint();
    gridPoint.body.meta.gridId = "123";
    p.genericPoints = [fakePoint(), gridPoint];
    window.confirm = () => true;
    const { container, ref } = renderWithRef(p);
    act(() => {
      ref.current?.setState({ gridIds: ["123"] });
    });
    fireEvent.click(container.querySelectorAll(".delete")[1] as Element);
    expect(deletePointsModule.deletePoints).toHaveBeenCalledWith("points",
      { meta: { gridId: "123" } });
    expect(deletePointsModule.deletePointsByIds).not.toHaveBeenCalled();
  });

  it("toggles grid point visibility", () => {
    const p = fakeProps();
    const gridPoint = fakePoint();
    gridPoint.body.meta.gridId = "123";
    p.genericPoints = [fakePoint(), gridPoint];
    const { container, ref } = renderWithRef(p);
    act(() => {
      ref.current?.setState({ gridIds: ["123"] });
    });
    fireEvent.click(container.querySelectorAll(".fb-toggle-button")[0] as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_GRID_ID, payload: "123"
    });
  });

  it("toggles height label visibility", () => {
    const p = fakeProps();
    p.pointsPanelState.soilHeight = true;
    const soilHeightPoint = fakePoint();
    tagAsSoilHeight(soilHeightPoint);
    p.genericPoints = [fakePoint(), soilHeightPoint];
    const { container } = render(<Points {...p} />);
    fireEvent.click(container.querySelectorAll(".fb-toggle-button")[0] as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SOIL_HEIGHT_LABELS, payload: undefined
    });
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const point = fakePoint();
    const discarded = fakePoint();
    state.resources = buildResourceIndex([point, discarded]);
    const props = mapStateToProps(state);
    expect(props.genericPoints).toEqual([point, discarded]);
  });
});
