import React from "react";
import { clone } from "lodash";
import { Vector3 } from "three";
import { ThreeEvent } from "@react-three/fiber";
import * as reactSpring from "@react-spring/three";
import {
  GridPlanting,
  GridPlantingController,
  GridPlantingProps,
  gridDragUpdate,
  saveGridPlanting,
  useGridControlHandlers,
} from "../grid_planting";
import { INITIAL } from "../../../config";
import { fakeAddPlantProps } from "../../../../__test_support__/fake_props";
import {
  act, fireEvent, render, renderHook, screen,
} from "@testing-library/react";
import { get3DPositionFunc } from "../../../helpers";
import { Actions } from "../../../../constants";
import { PlantGridData } from "../../../../plants/grid/interfaces";

describe("3D grid planting", () => {
  let requestAnimationFrameSpy: jest.SpyInstance;

  const fakeProps = (): GridPlantingProps => {
    const addPlantProps = fakeAddPlantProps();
    addPlantProps.gridSize = { x: 1000, y: 1000 };
    addPlantProps.designer.gridStart = { x: 100, y: 200 };
    addPlantProps.designer.gridPlanting = {
      token: "grid-token",
      gridId: "grid-token",
      cropSlug: "mint",
      itemName: "Mint",
      defaultSpacing: 100,
    };
    addPlantProps.dispatch = jest.fn(() => Promise.resolve());
    return {
      config: clone(INITIAL),
      addPlantProps,
      getZ: () => 0,
    };
  };

  const eventAt = (
    props: GridPlantingProps,
    position: { x: number, y: number },
    delta = 0,
  ) => {
    const world = get3DPositionFunc(props.config)(position);
    return {
      point: new Vector3(world.x, world.y, 0),
      delta,
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
    } as unknown as ThreeEvent<MouseEvent>;
  };

  beforeEach(() => {
    requestAnimationFrameSpy = jest.spyOn(window, "requestAnimationFrame")
      .mockImplementation(callback => {
        callback(0);
        return 1;
      });
  });

  afterEach(() => {
    requestAnimationFrameSpy.mockRestore();
  });

  it("renders nothing without an active request", () => {
    const props = fakeProps();
    props.addPlantProps.designer.gridPlanting = undefined;
    const { container } = render(<GridPlanting {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("places, sizes, edits, and saves a native grid", async () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    const { container, unmount } = render(
      <GridPlanting ref={ref} {...props} />);

    expect(screen.getByText("Click to set grid start")).toBeInTheDocument();
    expect(container.querySelector("[name='plant-icon-instances']"))
      .toHaveAttribute("count", "4");

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    expect(screen.getByText("Click to set grid size")).toBeInTheDocument();
    expect(container.querySelector("[name='plant-icon-instances']"))
      .toHaveAttribute("count", "4");

    act(() =>
      ref.current?.onPointerMove(eventAt(props, { x: 400, y: 500 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 400, y: 500 })));
    expect(screen.getByLabelText("Start X")).toHaveValue(100);
    expect(screen.getByLabelText("Start Y")).toHaveValue(200);
    expect(screen.getByLabelText("# of plants X")).toHaveValue(5);
    expect(screen.getByLabelText("# of plants Y")).toHaveValue(5);
    expect(container.querySelector("[name='grid-start-marker']"))
      .toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Increase # of plants X"));
    expect(screen.getByLabelText("# of plants X")).toHaveValue(6);
    fireEvent.change(screen.getByLabelText("# of plants Y"), {
      target: { value: "1" },
    });
    expect(screen.getByLabelText("# of plants Y")).toHaveValue(1);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      await Promise.resolve();
    });
    const batchAction = (props.addPlantProps.dispatch as jest.Mock)
      .mock.calls.map(call => call[0])
      .find(action => action.type == Actions.BATCH_INIT);
    expect(batchAction.payload).toHaveLength(6);
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_START,
      payload: { x: 100, y: 200 },
    });
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
    unmount();
  });

  it("keeps the initial 2x2 grid through sub-spacing movement", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(<GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onPointerMove(eventAt(props, { x: 99, y: 199 })));

    expect(container.querySelector("[name='plant-icon-instances']"))
      .toHaveAttribute("count", "4");
  });

  it("points the initial grid inward near the planting-area edge", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    render(<GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 950, y: 950 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 950, y: 950 })));

    expect(screen.getByLabelText("Spacing (MM) X")).toHaveValue(-100);
    expect(screen.getByLabelText("Spacing (MM) Y")).toHaveValue(-100);
    expect(screen.getByLabelText("# of plants X")).toHaveValue(2);
    expect(screen.getByLabelText("# of plants Y")).toHaveValue(2);
  });

  it("retains a 2x2 preview when the default spacing cannot fit", () => {
    const props = fakeProps();
    props.addPlantProps.gridSize = { x: 50, y: 50 };
    props.addPlantProps.designer.gridStart = { x: 25, y: 25 };
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(<GridPlanting ref={ref} {...props} />);

    expect(container.querySelector("[name='plant-icon-instances']"))
      .toHaveAttribute("count", "4");
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 25, y: 25 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 25, y: 25 })));
    expect(screen.getByLabelText("# of plants X")).toHaveValue(2);
    expect(screen.getByLabelText("# of plants Y")).toHaveValue(2);
    expect(screen.getByText(
      "All plants must be within the planting area.")).toBeInTheDocument();
  });

  it("supports negative extents, current position, packing, and cancel", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(<GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 500, y: 500 })));
    act(() =>
      ref.current?.onPointerMove(eventAt(props, { x: 200, y: 100 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 200, y: 100 })));
    expect(screen.getByLabelText("Spacing (MM) X")).toHaveValue(-100);
    expect(screen.getByLabelText("Spacing (MM) Y")).toHaveValue(-100);
    expect(screen.getByLabelText("# of plants X")).toHaveValue(4);
    expect(screen.getByLabelText("# of plants Y")).toHaveValue(5);

    const currentPositionButton =
      container.querySelector("button[title='(0, 0, 0)']");
    fireEvent.click(currentPositionButton as Element);
    expect(screen.getByLabelText("Start X")).toHaveValue(300);
    expect(screen.getByLabelText("Start Y")).toHaveValue(400);

    fireEvent.click(screen.getByTitle("toggle packing method"));
    expect(screen.getByLabelText("Spacing (MM) X")).toHaveValue(-87);
    fireEvent.click(screen.getByTitle("toggle packing method"));
    expect(screen.getByLabelText("Spacing (MM) X")).toHaveValue(-87);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
  });

  it("reports invalid manual grid values", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    render(<GridPlanting ref={ref} {...props} />);
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));

    fireEvent.change(screen.getByLabelText("# of plants X"), {
      target: { value: "101" },
    });
    expect(screen.getByText(
      "A grid can contain at most 200 plants.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("stashes the preview when saving fails", async () => {
    const props = fakeProps();
    const dispatch = jest.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("save failed"))
      .mockResolvedValueOnce(undefined);
    props.addPlantProps.dispatch = dispatch;
    const ref = React.createRef<GridPlantingController>();
    render(<GridPlanting ref={ref} {...props} />);
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(typeof dispatch.mock.calls[1][0]).toEqual("function");
    expect(typeof dispatch.mock.calls[2][0]).toEqual("function");
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("saves grids in saved gardens as plant templates", async () => {
    const props = fakeProps();
    props.addPlantProps.designer.openedSavedGarden = 42;
    const ref = React.createRef<GridPlantingController>();
    render(<GridPlanting ref={ref} {...props} />);
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      await Promise.resolve();
    });

    const batchAction = (props.addPlantProps.dispatch as jest.Mock)
      .mock.calls.map(call => call[0])
      .find(action => action.type == Actions.BATCH_INIT);
    expect(batchAction.payload).toHaveLength(4);
    expect(batchAction.payload).toEqual(
      expect.arrayContaining([expect.objectContaining({
        kind: "PlantTemplate",
        body: expect.objectContaining({
          saved_garden_id: 42,
          openfarm_slug: "mint",
        }),
      })]),
    );
  });

  it("ignores dragged placement clicks and clicks after editing", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    render(<GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 500, y: 500 }, 2)));
    expect(screen.getByText("Click to set grid start")).toBeInTheDocument();
    act(() => {
      ref.current?.onPointerMove(eventAt(props, { x: 300, y: 300 }));
      ref.current?.onPointerMove(eventAt(props, { x: 400, y: 400 }));
    });
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 900, y: 900 })));
    expect(screen.getByLabelText("Start X")).toHaveValue(100);
    expect(screen.getByLabelText("Start Y")).toHaveValue(200);
  });

  it("cancels the mode with Escape", () => {
    const props = fakeProps();
    const { unmount } = render(<GridPlanting {...props} />);

    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));

    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
    unmount();
  });
});

describe("useGridControlHandlers()", () => {
  const config = clone(INITIAL);
  const grid: PlantGridData = {
    startX: 100,
    startY: 100,
    spacingH: 100,
    spacingV: 100,
    numPlantsH: 2,
    numPlantsV: 2,
  };
  const fakeProps = () => ({
    config,
    grid,
    offsetPacking: false,
    gridSize: { x: 1000, y: 1000 },
    getZ: () => 0,
    onChange: jest.fn(),
    controlZ: 500,
  });
  const event = (
    position: { x: number, y: number },
    delta = 0,
  ) => {
    const world = get3DPositionFunc(config)(position);
    return {
      point: new Vector3(world.x, world.y, 0),
      delta,
      pointerId: 1,
      stopPropagation: jest.fn(),
      nativeEvent: { stopImmediatePropagation: jest.fn() },
      target: {
        setPointerCapture: jest.fn(),
        releasePointerCapture: jest.fn(),
      },
    } as unknown as ThreeEvent<PointerEvent>;
  };

  it("handles hover, movement, release, and cancellation", () => {
    const props = fakeProps();
    const { result } = renderHook(() => useGridControlHandlers(props));
    const current = (
      name: string,
      kind: Parameters<typeof result.current.handlers>[1],
    ) => result.current.handlers(name, kind);
    const idleMove = event({ x: 100, y: 100 });

    act(() => current("start", "start").onPointerMove(idleMove));
    expect(props.onChange).not.toHaveBeenCalled();
    act(() => current("start", "start").onPointerOver(idleMove));
    expect(current("start", "start").hovered).toBeTruthy();
    act(() => current("start", "start").onPointerOut(idleMove));
    expect(current("start", "start").hovered).toBeFalsy();

    const down = event({ x: 100, y: 100 });
    act(() => current("start", "start").onPointerDown(down));
    act(() => current("start", "start")
      .onPointerMove(event({ x: 300, y: 400 }, 2)));
    expect(props.onChange).toHaveBeenLastCalledWith({
      ...grid,
      startX: 300,
      startY: 400,
    });
    act(() => current("start", "start")
      .onPointerUp(event({ x: 300, y: 400 }, 2)));
    const downTarget = down.target as unknown as {
      setPointerCapture: jest.Mock;
    };
    expect(downTarget.setPointerCapture).toHaveBeenCalledWith(1);

    act(() => current("spacing", "spacing-y")
      .onPointerDown(event({ x: 100, y: 100 })));
    act(() => current("spacing", "spacing-y")
      .onPointerMove(event({ x: 100, y: 100 }, 2)));
    expect(props.onChange).toHaveBeenLastCalledWith({
      ...grid,
      spacingV: 1,
    });
    act(() => current("spacing", "spacing-y")
      .onPointerCancel(event({ x: 100, y: 100 }, 2)));
    act(() => current("spacing", "spacing-y")
      .onPointerCancel(event({ x: 100, y: 100 }, 2)));
  });

  it("adds and drags plant counts before snapping the handle", () => {
    const props = fakeProps();
    const { result } = renderHook(() => useGridControlHandlers(props));
    const current = (
      kind: "count-x" | "count-y",
    ) => result.current.handlers(kind, kind);

    act(() => current("count-x")
      .onPointerDown(event({ x: 100, y: 100 })));
    act(() => current("count-x")
      .onPointerMove(event({ x: 500, y: 100 }, 2)));
    expect(props.onChange).toHaveBeenLastCalledWith({
      ...grid,
      numPlantsH: 5,
    });
    expect(result.current.countDragTip).toEqual({ axis: "x", value: 500 });
    act(() => current("count-x")
      .onPointerUp(event({ x: 500, y: 100 }, 2)));

    act(() => current("count-y")
      .onPointerDown(event({ x: 100, y: 100 })));
    act(() => current("count-y")
      .onPointerUp(event({ x: 100, y: 100 })));
    expect(props.onChange).toHaveBeenLastCalledWith({
      ...grid,
      numPlantsV: 3,
    });

    act(() => current("count-y")
      .onPointerDown(event({ x: 100, y: 100 })));
    act(() => current("count-y")
      .onPointerCancel(event({ x: 100, y: 100 }, 2)));
  });

  it("animates a dragged count handle back to its grid point", () => {
    const start = jest.fn(options => {
      options.onChange?.({ value: { tip: 450 } });
      options.onChange?.({ value: {} });
      options.onRest?.();
    });
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockReturnValue([{}, { start }] as never);
    const props = fakeProps();
    const { result } = renderHook(() => useGridControlHandlers(props));
    const current = () =>
      result.current.handlers("count-x", "count-x");

    act(() => current()
      .onPointerDown(event({ x: 100, y: 100 })));
    act(() => current()
      .onPointerMove(event({ x: 500, y: 100 }, 2)));
    act(() => current()
      .onPointerUp(event({ x: 500, y: 100 }, 2)));

    expect(start).toHaveBeenCalled();
    expect(result.current.countDragTip).toBeUndefined();
    springSpy.mockRestore();
  });
});

describe("gridDragUpdate()", () => {
  const grid: PlantGridData = {
    startX: 100,
    startY: 100,
    spacingH: 100,
    spacingV: 100,
    numPlantsH: 2,
    numPlantsV: 2,
  };
  const update = (
    kind: Parameters<typeof gridDragUpdate>[0]["drag"]["kind"],
    point: { x: number, y: number },
  ) => gridDragUpdate({
    drag: {
      kind,
      startGrid: grid,
      offset: { x: 0, y: 0 },
    },
    point,
    gridSize: { x: 1000, y: 1000 },
    offsetPacking: false,
  });

  it("moves a grid on both axes or one axis at a time", () => {
    expect(update("start", { x: 300, y: 400 }))
      .toEqual({ ...grid, startX: 300, startY: 400 });
    expect(update("start-x", { x: 300, y: 400 }))
      .toEqual({ ...grid, startX: 300 });
    expect(update("start-y", { x: 300, y: 400 }))
      .toEqual({ ...grid, startY: 400 });
  });

  it("sets signed spacing and plant counts by axis", () => {
    expect(update("spacing-x", { x: 50, y: 100 }).spacingH)
      .toEqual(-50);
    expect(update("spacing-y", { x: 100, y: 350 }).spacingV)
      .toEqual(250);
    expect(update("count-x", { x: 500, y: 100 }).numPlantsH)
      .toEqual(5);
    expect(update("count-y", { x: 100, y: 400 }).numPlantsV)
      .toEqual(4);
  });
});

describe("saveGridPlanting()", () => {
  it("does not save an invalid or already-saving grid", async () => {
    const addPlantProps = fakeAddPlantProps();
    const setSaving = jest.fn();
    const request = {
      token: "grid-token",
      gridId: "grid-token",
      cropSlug: "mint",
      itemName: "Mint",
      defaultSpacing: 100,
    };
    const grid: PlantGridData = {
      startX: 100,
      startY: 100,
      spacingH: 100,
      spacingV: 100,
      numPlantsH: 2,
      numPlantsV: 2,
    };
    await saveGridPlanting({
      validation: {
        valid: false,
        errors: ["Invalid grid."],
        points: [],
      },
      saving: false,
      grid,
      request,
      offsetPacking: false,
      addPlantProps,
      setSaving,
    });
    await saveGridPlanting({
      validation: {
        valid: true,
        errors: [],
        points: [],
      },
      saving: true,
      grid,
      request,
      offsetPacking: false,
      addPlantProps,
      setSaving,
    });
    expect(addPlantProps.dispatch).not.toHaveBeenCalled();
    expect(setSaving).not.toHaveBeenCalled();
  });
});
