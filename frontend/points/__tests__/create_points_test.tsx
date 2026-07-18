import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import {
  createPoint,
  CreatePointProps,
  RawCreatePoints as CreatePoints,
  CreatePointsProps,
  mapStateToProps,
} from "../create_points";
import * as crud from "../../api/crud";
import { Actions } from "../../constants";
import {
  changeBlurableInput,
  clickButton,
} from "../../__test_support__/helpers";
import { fakeState } from "../../__test_support__/fake_state";
import { inputEvent } from "../../__test_support__/fake_html_events";
import { Path } from "../../internal_urls";
import { fakeDrawnPoint } from "../../__test_support__/fake_designer_state";
import { success } from "../../toast/toast";
import { renderWithContext } from "../../__test_support__/mount_with_context";

beforeEach(() => {
  jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
});


describe("mapStateToProps", () => {
  it("maps state to props: drawn point", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.drawnPoint = fakeDrawnPoint();
    state.resources.consumers.farm_designer.legacyPointGrid = true;
    const props = mapStateToProps(state);
    expect(props.drawnPoint?.cx).toEqual(10);
    expect(props.drawnPoint?.cy).toEqual(20);
    expect(props.legacyPointGrid).toBeTruthy();
  });
});

describe("createPoint()", () => {
  const fakeProps = (): CreatePointProps => ({
    navigate: jest.fn(),
    dispatch: jest.fn(),
    drawnPoint: fakeDrawnPoint(),
  });

  it("creates point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const point = fakeDrawnPoint();
    point.name = "";
    point.cx = undefined;
    point.cy = undefined;
    point.at_soil_level = true;
    p.drawnPoint = point;
    createPoint(p);
    expect(crud.initSave).toHaveBeenCalledWith("Point", {
      meta: {
        color: "green", created_by: "farm-designer", type: "point",
        at_soil_level: "true",
      },
      name: "Created Point",
      pointer_type: "GenericPointer",
      plant_stage: "active",
      radius: 30, x: 0, y: 0, z: 0,
    });
    expect(success).toHaveBeenCalledWith("Point created.");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: undefined,
    });
  });

  it("creates weed", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    const point = fakeDrawnPoint();
    point.name = "";
    point.cx = undefined;
    point.cy = undefined;
    p.drawnPoint = point;
    createPoint(p);
    expect(crud.initSave).toHaveBeenCalledWith("Point", {
      meta: {
        color: "green", created_by: "farm-designer", type: "weed",
      },
      name: "Created Weed",
      pointer_type: "Weed",
      plant_stage: "active",
      radius: 30, x: 0, y: 0, z: 0,
    });
    expect(success).toHaveBeenCalledWith("Weed created.");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: undefined,
    });
  });
});

describe("<CreatePoints />", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.points("add"));
  });

  const fakeProps = (): CreatePointsProps => ({
    dispatch: jest.fn(),
    drawnPoint: undefined,
    botPosition: { x: 1.23, y: 3.21, z: 1 },
    xySwap: false,
  });

  const renderCreatePoints = (props: CreatePointsProps) => {
    const ref = React.createRef<CreatePoints>();
    const view = render(<CreatePoints ref={ref} {...props} />);
    return { ref, ...view };
  };

  it("renders for points", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    const { container } = render(<CreatePoints {...p} />);
    const text = container.textContent?.toLowerCase() || "";
    ["x", "y", "z", "radius"].map(string =>
      expect(text).toContain(string));
    expect(text.includes("add point") || text.includes("save")).toBeTruthy();
  });

  it("uses the panel header for 3D point grid mode", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    p.threeDGrid = true;
    const { container } = render(<CreatePoints {...p} />);

    expect(container).not.toHaveTextContent("Add Grid or Row");
    expect(container.querySelector(".save")).not.toBeInTheDocument();
    const gridButton =
      container.querySelector(".plus-grid-btn") as HTMLButtonElement;
    expect(gridButton).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(gridButton);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: expect.objectContaining({
        token: expect.any(String),
        gridId: expect.any(String),
        gridType: "point",
        itemName: "Fake Point",
        defaultSpacing: 100,
        radius: 0,
        z: 0,
        meta: {
          color: "green",
          at_soil_level: "false",
        },
      }),
    });
  });

  it("keeps the legacy save button for 3D weeds", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    p.threeDGrid = true;

    const { container } = render(<CreatePoints {...p} />);

    expect(container.querySelector(".save")).toBeInTheDocument();
  });

  it("opens and consumes a requested legacy point grid", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    p.legacyPointGrid = true;
    p.dispatch = jest.fn(() => Promise.resolve());

    const { container } = render(<CreatePoints {...p} />);

    expect(container.querySelector(".fa-chevron-up")).toBeInTheDocument();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_LEGACY_POINT_GRID,
      payload: false,
    });
  });

  it("opens a legacy point grid requested after mounting", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    p.dispatch = jest.fn(() => Promise.resolve());
    const view = render(<CreatePoints {...p} />);
    expect(view.container.querySelector(".fa-chevron-down"))
      .toBeInTheDocument();

    view.rerender(<CreatePoints {...p} legacyPointGrid={true} />);

    expect(view.container.querySelector(".fa-chevron-up"))
      .toBeInTheDocument();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_LEGACY_POINT_GRID,
      payload: false,
    });
  });

  it("exits active 3D point grid mode from the header", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    p.threeDGrid = true;
    p.gridPlanting = {
      token: "point-grid",
      gridId: "point-grid",
      gridType: "point",
      itemName: "Fake Point",
      defaultSpacing: 60,
      radius: 30,
    };
    const { container } = render(<CreatePoints {...p} />);
    const gridButton =
      container.querySelector(".plus-grid-btn") as HTMLButtonElement;
    expect(gridButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(gridButton);

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
  });

  it("toggles 3D point grid mode with the g hotkey", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    p.threeDGrid = true;
    render(<CreatePoints {...p} />);
    jest.clearAllMocks();

    fireEvent.keyDown(window, { key: "g" });

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: expect.objectContaining({
        gridType: "point",
        itemName: "Fake Point",
      }),
    });
  });

  it("exits 3D point grid mode with the g hotkey", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    p.threeDGrid = true;
    p.gridPlanting = {
      token: "point-grid",
      gridId: "point-grid",
      gridType: "point",
      itemName: "Fake Point",
      defaultSpacing: 60,
      radius: 30,
    };
    const { container } = render(<CreatePoints {...p} />);
    jest.clearAllMocks();

    fireEvent.keyDown(window, { key: "G" });

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
    jest.clearAllMocks();

    const radiusInput =
      container.querySelector("input[name='r']") as HTMLInputElement;
    fireEvent.keyDown(radiusInput, { key: "g" });
    fireEvent.keyDown(window, { key: "g", ctrlKey: true });

    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("does not start a point grid without point data", () => {
    const p = fakeProps();
    p.threeDGrid = true;
    const { ref } = renderCreatePoints(p);
    jest.clearAllMocks();

    act(() => ref.current?.toggleThreeDGrid());

    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("initializes point data", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    render(<CreatePoints {...p} />);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: {
        name: "Created Point",
        cx: undefined,
        cy: undefined,
        z: 0,
        r: 0,
        color: "green",
        at_soil_level: false,
      },
    });
  });

  it("keeps existing point data", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.drawnPoint = {
      name: "Location Point",
      cx: 300,
      cy: 540,
      z: 0,
      r: 0,
      color: "gray",
      at_soil_level: false,
    };
    render(<CreatePoints {...p} />);
    expect(p.dispatch).not.toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: {
        name: "Created Point",
        cx: undefined,
        cy: undefined,
        z: 0,
        r: 0,
        color: "green",
        at_soil_level: false,
      },
    });
  });

  it("renders for weeds", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    const { container } = render(<CreatePoints {...p} />);
    const text = container.textContent?.toLowerCase() || "";
    ["x", "y", "z", "radius"].map(string =>
      expect(text).toContain(string));
    expect(text.includes("add weed") || text.includes("save")).toBeTruthy();
  });

  it("updates specific fields", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    const { ref } = renderCreatePoints(p);
    act(() => ref.current?.updateValue("color")(inputEvent("cheerful hue")));
    expect(ref.current?.props.drawnPoint).toBeTruthy();
    expect(ref.current?.props.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...p.drawnPoint, color: "cheerful hue" },
    });
  });

  it("updates radius", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    const { ref } = renderCreatePoints(p);
    act(() => ref.current?.updateValue("r")(inputEvent("100")));
    expect(ref.current?.props.drawnPoint).toBeTruthy();
    expect(ref.current?.props.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...p.drawnPoint, r: 100 },
    });
  });

  it("synchronizes active point grid attributes", () => {
    const p = fakeProps();
    const point = fakeDrawnPoint();
    p.drawnPoint = point;
    p.gridPlanting = {
      token: "point-grid",
      gridId: "point-grid",
      gridType: "point",
      itemName: "Fake Point",
      defaultSpacing: 100,
      radius: 0,
      z: 0,
      meta: {
        color: "green",
        at_soil_level: "false",
      },
    };
    const { ref } = renderCreatePoints(p);
    jest.clearAllMocks();

    act(() => ref.current?.setDrawnPoint({
      ...point,
      name: "Updated Grid",
      r: 40,
      z: 70,
      color: "blue",
      at_soil_level: true,
    }));

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: {
        ...p.gridPlanting,
        itemName: "Updated Grid",
        z: 70,
        meta: {
          color: "blue",
          at_soil_level: "true",
        },
      },
    });
  });

  it("doesn't update fields without current point", () => {
    const p = fakeProps();
    const { ref } = renderCreatePoints(p);
    jest.clearAllMocks();
    act(() => ref.current?.updateValue("r")(inputEvent("1")));
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("adds soil height flag", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    const { ref } = renderCreatePoints(p);
    const panel = render(ref.current?.PointProperties({ drawnPoint: p.drawnPoint }));
    const soilLevelInput =
      panel.container.querySelector("input[name='at_soil_level']") as Element;
    fireEvent.click(soilLevelInput);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...p.drawnPoint, at_soil_level: true }
    });
  });

  it("creates point with soil height flag", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const point = fakeDrawnPoint();
    point.at_soil_level = true;
    p.drawnPoint = point;
    const view = render(<CreatePoints {...p} />);
    clickButton(view, 0, "save");
    expect(crud.initSave).toHaveBeenCalledWith("Point", {
      meta: {
        color: "green", created_by: "farm-designer", type: "point",
        at_soil_level: "true",
      },
      name: "Fake Point",
      pointer_type: "GenericPointer",
      plant_stage: "active",
      radius: 30, x: 10, y: 20, z: 0,
    });
  });

  it.each<[string, string, string]>([
    ["Created Point", "green", Path.points("add")],
    ["Created Weed", "red", Path.weeds("add")],
  ])("uses current location: %s %s %s", (pointName, color, path) => {
    location.pathname = Path.mock(path);
    const p = fakeProps();
    p.drawnPoint = {
      name: pointName,
      cx: undefined,
      cy: undefined,
      z: 0,
      r: 0,
      color,
      at_soil_level: false,
    };
    p.botPosition = { x: 1, y: 2, z: 3 };
    const view = render(<CreatePoints {...p} />);
    jest.clearAllMocks();
    const button = view.container
      .querySelector(".fa-crosshairs")
      ?.closest("button");
    expect(button).toBeTruthy();
    fireEvent.click(button as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: {
        name: pointName,
        cx: 1, cy: 2, z: 3, r: 0, color,
        at_soil_level: false,
      },
      type: Actions.SET_DRAWN_POINT_DATA,
    });
  });

  it("doesn't use current location", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    const view = render(<CreatePoints {...p} />);
    jest.clearAllMocks();
    const button = view.container
      .querySelector(".fa-crosshairs")
      ?.closest("button");
    expect(button).toBeTruthy();
    fireEvent.click(button as Element);
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("updates weed name", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    const { ref } = renderCreatePoints(p);
    const panel = render(ref.current?.PointProperties({ drawnPoint: p.drawnPoint }));
    changeBlurableInput(panel, "new name", 0);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...p.drawnPoint, name: "new name" },
    });
  });

  it("creates point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    const view = render(<CreatePoints {...p} />);
    clickButton(view, 0, "save");
    expect(crud.initSave).toHaveBeenCalledWith("Point", {
      meta: { color: "green", created_by: "farm-designer", type: "point" },
      name: p.drawnPoint.name,
      pointer_type: "GenericPointer",
      plant_stage: "active",
      radius: 30, x: 10, y: 20, z: 0,
    });
  });

  it("changes point color", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    const { ref } = renderCreatePoints(p);
    act(() => ref.current?.updateAttr("color", "blue"));
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { ...p.drawnPoint, color: "blue" },
      type: Actions.SET_DRAWN_POINT_DATA
    });
  });

  it("changes point color from the picker", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    const { container } = render(<CreatePoints {...p} />);
    fireEvent.click(container.querySelector(".saucer") as Element);
    fireEvent.click(document.querySelector("[title='blue']") as Element);

    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { ...p.drawnPoint, color: "blue" },
      type: Actions.SET_DRAWN_POINT_DATA,
    });
  });

  it("updates value", () => {
    const p = fakeProps();
    p.drawnPoint = fakeDrawnPoint();
    p.drawnPoint.cx = undefined;
    p.drawnPoint.cy = undefined;
    const { ref } = renderCreatePoints(p);
    const panel = render(ref.current?.PointProperties({ drawnPoint: p.drawnPoint }));
    changeBlurableInput(panel, "100", 2);
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { ...p.drawnPoint, cx: 100 },
      type: Actions.SET_DRAWN_POINT_DATA
    });
  });

  it("closes panel", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const ref = React.createRef<CreatePoints>();
    renderWithContext(<CreatePoints ref={ref} {...p} />);
    act(() => ref.current?.closePanel());
    expect(mockNavigate).toHaveBeenCalledWith(Path.points());
  });

  it("unmounts", () => {
    const p = fakeProps();
    const view = render(<CreatePoints {...p} />);
    jest.clearAllMocks();
    view.unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: undefined
    });
  });

  it("exits point grid mode when unmounting", () => {
    const p = fakeProps();
    p.gridPlanting = {
      token: "point-grid",
      gridId: "point-grid",
      gridType: "point",
      itemName: "Point",
      defaultSpacing: 60,
    };
    const view = render(<CreatePoints {...p} />);
    jest.clearAllMocks();

    view.unmount();

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.CLEAR_GRID_PLANTING,
      payload: "point-grid",
    });
  });
});
