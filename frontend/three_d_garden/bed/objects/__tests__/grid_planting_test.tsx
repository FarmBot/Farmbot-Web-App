import React from "react";
import { clone } from "lodash";
import { Vector3 } from "three";
import { ThreeEvent } from "@react-three/fiber";
import {
  GridPlanting,
  GridPlantingControls,
  GridPlantingController,
  GridPlantingProps,
  PointRadiusControl,
  gridActionControlPosition,
  gridDragUpdate,
  quantizePointRadius,
  saveGridPlanting,
  useGridControlHandlers,
} from "../grid_planting";
import { INITIAL } from "../../../config";
import { fakeAddPlantProps } from "../../../../__test_support__/fake_props";
import { fakeDrawnPoint } from
  "../../../../__test_support__/fake_designer_state";
import {
  act, fireEvent, render, renderHook, screen,
} from "@testing-library/react";
import { get3DPositionFunc, zZero } from "../../../helpers";
import { Actions } from "../../../../constants";
import { PlantGridData } from "../../../../plants/grid/interfaces";
import {
  ControlArrow, ControlDragEvent, ControlHandle, ControlSphere,
} from "../../../controls";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../../../__test_support__/test_renderer";
import { Path } from "../../../../internal_urls";

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
      mapPoints: [],
      plants: [],
      weeds: [],
      showPlants: true,
      showPoints: true,
      showWeeds: true,
      // eslint-disable-next-line no-null/no-null
      activePositionRef: { current: null },
      navigate: jest.fn(),
      getZ: () => 0,
    };
  };

  const fakePointProps = (): GridPlantingProps => {
    const props = fakeProps();
    props.addPlantProps.designer.drawnPoint = fakeDrawnPoint();
    props.addPlantProps.designer.gridPlanting = {
      token: "point-grid-token",
      gridId: "point-grid-token",
      gridType: "point",
      itemName: "Survey Point",
      defaultSpacing: 100,
      radius: 0,
      z: 5,
      meta: {
        color: "green",
        at_soil_level: "false",
      },
    };
    return props;
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

  const clickControl = (container: HTMLElement, name: string) => {
    const control = container.querySelector(`[name='${name}']`);
    if (!control) { throw new Error(`${name} not found.`); }
    fireEvent.click(control);
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

  it("keeps both placement modes at the live cursor position", () => {
    const props = fakeProps();
    const get3DPosition = get3DPositionFunc(props.config);
    props.activePositionRef.current =
      get3DPosition({ x: 340, y: 460 });
    const ref = React.createRef<GridPlantingController>();
    render(<GridPlanting ref={ref} {...props} />);

    expect(screen.getByText("(340, 460)")).toBeInTheDocument();

    act(() =>
      ref.current?.onPointerMove(eventAt(props, { x: 570, y: 680 })));

    expect(props.activePositionRef.current)
      .toEqual(get3DPosition({ x: 570, y: 680 }));
    expect(screen.getByText("(570, 680)")).toBeInTheDocument();
  });

  it("places spacing controls above their highest relevant soil point", () => {
    const config = clone(INITIAL);
    const getZ = (x: number, y: number) => {
      if (x == 200 && y == 400) { return 95; }
      if (x == 400 && y == 500) { return 200; }
      return 35;
    };
    const wrapper = createRenderer(<GridPlantingControls
      config={config}
      grid={{
        startX: 100,
        startY: 200,
        spacingH: 100,
        spacingV: 100,
        numPlantsH: 4,
        numPlantsV: 4,
      }}
      gridSize={{ x: 1000, y: 1000 }}
      getZ={getZ}
      onChange={jest.fn()} />);
    const startZ = zZero(config) + getZ(100, 200);
    const spacingZ = zZero(config) + 95 + 20;
    const arrowStartZ = (name: string) =>
      wrapper.root.find(node =>
        node.props.name == name && Array.isArray(node.props.start))
        .props.start[2];
    expect(arrowStartZ("grid-start-x-arrow-shape"))
      .toEqual(startZ + 125);
    expect(wrapper.root.find(node =>
      node.props.name == "grid-start-marker"
      && typeof node.props.radius == "number").props.position[2])
      .toEqual(startZ + 125);
    expect(wrapper.root.find(node =>
      node.props.name == "grid-extent-marker"
      && typeof node.props.radius == "number").props.position[2])
      .toEqual(zZero(config) + 200 + 150);
    expect(arrowStartZ("grid-spacing-x-arrow"))
      .toEqual(spacingZ);
    expect(arrowStartZ("grid-spacing-y-arrow"))
      .toEqual(spacingZ);
    wrapper.root.findAllByType(ControlArrow).forEach(arrow => {
      expect(arrow.props.width).toEqual(10);
      expect(arrow.props.depthTest).toEqual(true);
      expect(arrow.props.depthWrite).toEqual(true);
    });
    wrapper.root.findAllByType(ControlSphere).forEach(sphere => {
      expect(sphere.props.depthTest).toEqual(true);
      expect(sphere.props.depthWrite).toEqual(true);
    });

    const spacingControl = wrapper.root.findAll(node =>
      `${node.type}` == "group"
      && node.props.name == "grid-spacing-x-control")[0];
    actRenderer(() => spacingControl.props.onPointerOver({
      stopPropagation: jest.fn(),
    }));
    const firstGuide = wrapper.root.findByProps({
      name: "grid-spacing-x-first-row-guide",
    });
    const secondGuide = wrapper.root.findByProps({
      name: "grid-spacing-x-second-row-guide",
    });
    const worldPosition = get3DPositionFunc(config);
    expect(firstGuide.props.points).toEqual([
      [
        worldPosition({ x: 100, y: 100 }).x,
        worldPosition({ x: 100, y: 100 }).y,
        spacingZ,
      ],
      [
        worldPosition({ x: 100, y: 500 }).x,
        worldPosition({ x: 100, y: 500 }).y,
        spacingZ,
      ],
    ]);
    expect(secondGuide.props.points).toEqual([
      [
        worldPosition({ x: 200, y: 100 }).x,
        worldPosition({ x: 200, y: 100 }).y,
        spacingZ,
      ],
      [
        worldPosition({ x: 200, y: 500 }).x,
        worldPosition({ x: 200, y: 500 }).y,
        spacingZ,
      ],
    ]);
    expect(firstGuide.props.color).toEqual("dodgerblue");
    expect(secondGuide.props.color).toEqual("dodgerblue");
    actRenderer(() => spacingControl.props.onPointerOut({
      stopPropagation: jest.fn(),
    }));
    expect(wrapper.root.findAllByProps({
      name: "grid-spacing-x-first-row-guide",
    })).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("positions final action buttons 200mm above the grid start", () => {
    const config = clone(INITIAL);
    const grid: PlantGridData = {
      startX: 100,
      startY: 200,
      spacingH: 100,
      spacingV: 100,
      numPlantsH: 2,
      numPlantsV: 2,
    };
    const world = get3DPositionFunc(config)({ x: 100, y: 200 });

    expect(gridActionControlPosition(config, grid, () => 25)).toEqual([
      world.x,
      world.y,
      zZero(config) + 225,
    ]);
  });

  it("hides spacing controls for axes with only one grid point", () => {
    const config = clone(INITIAL);
    const view = (grid: PlantGridData) =>
      <GridPlantingControls
        config={config}
        grid={grid}
        gridSize={{ x: 1000, y: 1000 }}
        getZ={() => 0}
        onChange={jest.fn()} />;
    const grid: PlantGridData = {
      startX: 100,
      startY: 200,
      spacingH: 100,
      spacingV: 100,
      numPlantsH: 1,
      numPlantsV: 3,
    };
    const wrapper = createRenderer(view(grid));

    expect(wrapper.root.findAllByProps({
      name: "grid-spacing-x-control",
    })).toHaveLength(0);
    expect(wrapper.root.findAllByProps({
      name: "grid-spacing-y-control",
    }).length).toBeGreaterThan(0);

    actRenderer(() => wrapper.update(view({
      ...grid,
      numPlantsH: 3,
      numPlantsV: 1,
    })));

    expect(wrapper.root.findAllByProps({
      name: "grid-spacing-x-control",
    }).length).toBeGreaterThan(0);
    expect(wrapper.root.findAllByProps({
      name: "grid-spacing-y-control",
    })).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("places, sizes, edits, and saves a native grid", async () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    const { container, unmount } = render(
      <GridPlanting ref={ref} {...props} />);

    expect(screen.getByText("(100, 200)"))
      .toBeInTheDocument();
    expect(container.querySelector("[name='grid-start-helpers']"))
      .toBeInTheDocument();
    expect(container.querySelectorAll(".line")).toHaveLength(2);
    expect(container.querySelector("[name='alignment-indicators']"))
      .toBeInTheDocument();
    expect(container.querySelector("[name='grid-start-spread-sphere']"))
      .toBeInTheDocument();
    const startPreviewMeshes =
      container.querySelectorAll("[name='plant-icon-instances']");
    expect(startPreviewMeshes[0]).toHaveAttribute("count", "1");
    expect(startPreviewMeshes[1]).toHaveAttribute("count", "3");

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    expect(screen.getByText("2 x 2")).toBeInTheDocument();
    expect(container.querySelector("[name='plant-icon-instances']"))
      .toHaveAttribute("count", "4");
    expect(container.querySelector("[name='plant-spread-instances']"))
      .toHaveAttribute("count", "4");

    act(() =>
      ref.current?.onPointerMove(eventAt(props, { x: 400, y: 500 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 400, y: 500 })));
    expect(container.querySelector("[name='plant-spread-instances']"))
      .toHaveAttribute("count", "16");
    expect(container.querySelector("[name='grid-planting-popup']"))
      .not.toBeInTheDocument();
    expect(screen.queryByText("Add Grid or Row")).not.toBeInTheDocument();
    const actionControls = container.querySelector(
      "[data-testid='grid-action-controls']");
    expect(actionControls?.closest(".html")).toBeInTheDocument();
    expect(container.querySelector("[name='grid-cancel-control']"))
      .toHaveClass("grid-action-cancel", "fa-times");
    expect(container.querySelector("[name='grid-cancel-control']"))
      .toHaveAttribute("title", "Cancel");
    expect(container.querySelector("[name='grid-save-control']"))
      .toHaveClass("grid-action-save", "fa-check");
    expect(container.querySelector("[name='grid-save-control']"))
      .toHaveAttribute("title", "Save");
    expect(actionControls?.textContent).toEqual("");
    const startMarker =
      container.querySelector("[name='grid-start-marker']");
    expect(startMarker).toHaveAttribute("renderorder", "1001");
    const extentMarker =
      container.querySelector("[name='grid-extent-marker']");
    expect(extentMarker).toHaveAttribute("renderorder", "1001");
    expect(container.querySelector("[name='grid-spacing-x-arrow']"))
      .toHaveAttribute("renderorder", "1001");
    expect(container.querySelector("[name='grid-spacing-y-arrow']"))
      .toHaveAttribute("renderorder", "1001");
    expect(screen.queryByText("4 x 4")).not.toBeInTheDocument();
    expect(screen.queryByText("(100, 200)")).not.toBeInTheDocument();
    const startControl = container.querySelector(
      "[name='grid-start-marker-control']");
    fireEvent.pointerOver(startControl as Element);
    expect(screen.getByText("(100, 200)")).toBeInTheDocument();
    fireEvent.pointerOut(startControl as Element);
    expect(screen.queryByText("(100, 200)")).not.toBeInTheDocument();
    const spacingControl = container.querySelector(
      "[name='grid-spacing-x-control']");
    fireEvent.pointerOver(spacingControl as Element);
    expect(screen.getByText("100mm")).toBeInTheDocument();
    fireEvent.pointerOut(spacingControl as Element);
    expect(screen.queryByText("100mm")).not.toBeInTheDocument();
    const extentControl = container.querySelector(
      "[name='grid-extent-marker-control']");
    fireEvent.pointerOver(extentControl as Element);
    expect(screen.getByText("4 x 4")).toBeInTheDocument();
    fireEvent.pointerOut(extentControl as Element);
    expect(screen.queryByText("4 x 4")).not.toBeInTheDocument();
    expect(container.querySelector(
      "[name='grid-start-x-arrow-shape-label']"))
      .not.toBeInTheDocument();
    expect(container.querySelector(
      "[name='grid-start-y-arrow-shape-label']"))
      .not.toBeInTheDocument();
    expect(container.querySelector("[name='grid-spacing-x-arrow']")
      ?.querySelector("[color='dodgerblue']"))
      .toBeInTheDocument();
    expect(container.querySelector("[name='grid-spacing-y-arrow']")
      ?.querySelector("[color='dodgerblue']"))
      .toBeInTheDocument();
    expect(container.querySelector("[name='grid-spacing-x-marker']"))
      .not.toBeInTheDocument();
    expect(container.querySelector("[name='grid-spacing-y-marker']"))
      .not.toBeInTheDocument();
    expect(container.querySelector("[name='grid-count-x-arrow']"))
      .not.toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    const batchAction = (props.addPlantProps.dispatch as jest.Mock)
      .mock.calls.map(call => call[0])
      .find(action => action.type == Actions.BATCH_INIT);
    expect(batchAction.payload).toHaveLength(16);
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_START,
      payload: { x: 100, y: 200 },
    });
    const nextGridRequest = (props.addPlantProps.dispatch as jest.Mock)
      .mock.calls.map(call => call[0])
      .find(action => action.type == Actions.SET_GRID_PLANTING);
    expect(nextGridRequest.payload).toEqual({
      ...props.addPlantProps.designer.gridPlanting,
      gridId: expect.any(String),
    });
    expect(nextGridRequest.payload.gridId).not.toEqual("grid-token");
    expect(container.querySelector("[data-testid='grid-action-controls']"))
      .not.toBeInTheDocument();
    expect(container.querySelector("[name='grid-start-helpers']"))
      .toBeInTheDocument();
    expect(screen.getByText("(100, 200)")).toBeInTheDocument();
    unmount();
  });

  it("places, sizes, colors, and saves a native point grid", async () => {
    const props = fakePointProps();
    const ref = React.createRef<GridPlantingController>();
    const view = render(
      <GridPlanting ref={ref} {...props} />);
    const { container } = view;

    expect(screen.getByText("(100, 200)")).toBeInTheDocument();
    expect(container.querySelector("[name='grid-start-spread-sphere']"))
      .not.toBeInTheDocument();

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    expect(screen.getByText("2 x 2")).toBeInTheDocument();
    expect(container.querySelector("[name='grid-point-radius-arrow']"))
      .not.toBeInTheDocument();

    act(() =>
      ref.current?.onPointerMove(eventAt(props, { x: 400, y: 500 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 400, y: 500 })));

    expect(container.querySelector("[name='grid-point-radius-arrow']"))
      .toBeInTheDocument();
    const colorButton = container.querySelector(
      "[name='grid-point-color-control']") as HTMLButtonElement;
    expect(colorButton).toHaveClass(
      "grid-action-color", "fa-paint-brush", "green");
    fireEvent.click(colorButton);
    expect(container.querySelectorAll(
      ".grid-point-color-menu .saucer")).toHaveLength(8);
    expect(container.querySelectorAll(
      ".grid-point-color-menu .icon-saucer")).toHaveLength(0);
    const blueChoice =
      document.querySelector("[title='blue']") as HTMLElement;
    expect(blueChoice).toBeInTheDocument();
    fireEvent.click(blueChoice);
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: {
        ...props.addPlantProps.designer.gridPlanting,
        meta: {
          color: "blue",
          at_soil_level: "false",
        },
      },
    });
    const request = props.addPlantProps.designer.gridPlanting;
    if (!request) { throw new Error("Point grid request not found."); }
    request.meta = { ...request.meta, color: "blue" };
    view.rerender(<GridPlanting ref={ref} {...props} />);
    expect(container.querySelector("[name='grid-point-color-control']"))
      .toHaveClass("blue");
    expect(container.querySelector("[name='grid-point-radius-arrow']")
      ?.querySelector("[color='blue']")).toBeInTheDocument();
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...fakeDrawnPoint(), color: "blue" },
    });

    const radiusControl = container.querySelector(
      "[name='grid-point-radius-control']");
    fireEvent.pointerOver(radiusControl as Element);
    expect(screen.getByText("r0").querySelector("[color='blue']"))
      .toBeInTheDocument();
    fireEvent.pointerOut(radiusControl as Element);
    expect(screen.queryByText("r0")).not.toBeInTheDocument();

    await act(async () => {
      clickControl(container, "grid-save-control");
      await Promise.resolve();
      await Promise.resolve();
    });
    const batchAction = (props.addPlantProps.dispatch as jest.Mock)
      .mock.calls.map(call => call[0])
      .find(action => action.type == Actions.BATCH_INIT);
    expect(batchAction.payload).toHaveLength(16);
    expect(batchAction.payload[0]).toEqual(expect.objectContaining({
      kind: "Point",
      body: expect.objectContaining({
        name: "Survey Point",
        pointer_type: "GenericPointer",
        radius: 0,
        z: 5,
        meta: expect.objectContaining({
          color: "blue",
          gridId: "point-grid-token",
        }),
      }),
    }));
    expect(props.addPlantProps.dispatch).not.toHaveBeenCalledWith({
      type: Actions.SET_COMPANION_INDEX,
      payload: undefined,
    });
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
    expect(props.navigate).toHaveBeenCalledWith(Path.points());
  });

  it("synchronizes point grid color changes from the panel", () => {
    const props = fakePointProps();
    const ref = React.createRef<GridPlantingController>();
    const view = render(<GridPlanting ref={ref} {...props} />);
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 200, y: 300 })));
    expect(view.container.querySelector(
      "[name='grid-point-color-control']")).toHaveClass("green");
    const request = props.addPlantProps.designer.gridPlanting;
    if (!request) { throw new Error("Point grid request not found."); }
    request.meta = { ...request.meta, color: "blue" };

    view.rerender(<GridPlanting ref={ref} {...props} />);

    expect(view.container.querySelector(
      "[name='grid-point-color-control']")).toHaveClass("blue");
  });

  it("resets point radius when canceling a point grid", () => {
    const props = fakePointProps();
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(
      <GridPlanting ref={ref} {...props} />);
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 200, y: 300 })));
    (props.addPlantProps.dispatch as jest.Mock).mockClear();

    clickControl(container, "grid-cancel-control");

    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...fakeDrawnPoint(), r: 0 },
    });
  });

  it("backsteps through point grid placement with Escape", () => {
    const props = fakePointProps();
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(
      <GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    expect(screen.getByText("2 x 2")).toBeInTheDocument();
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 300, y: 400 })));
    expect(container.querySelector("[data-testid='grid-action-controls']"))
      .toBeInTheDocument();

    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(screen.getByText("3 x 3")).toBeInTheDocument();
    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(screen.getByText("(100, 200)")).toBeInTheDocument();
    (props.addPlantProps.dispatch as jest.Mock).mockClear();
    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
  });

  it("adjusts point radius without jumping from a shaft grab", () => {
    const config = clone(INITIAL);
    const onChange = jest.fn();
    const grid: PlantGridData = {
      startX: 100,
      startY: 200,
      spacingH: 80,
      spacingV: 80,
      numPlantsH: 2,
      numPlantsV: 2,
    };
    const wrapper = createRenderer(
      <PointRadiusControl
        config={config}
        grid={grid}
        radius={40}
        color={"purple"}
        z={20}
        onChange={onChange} />);
    const handle = wrapper.root.findByType(ControlHandle);
    const dragAt = (position: { x: number, y: number }) => {
      const world = get3DPositionFunc(config)(position);
      return {
        point: new Vector3(world.x, world.y, 20),
        delta: new Vector3(),
        dragged: true,
        event: {} as ThreeEvent<PointerEvent>,
      };
    };
    const shaftGrab = dragAt({
      x: 100 - 30 * Math.sqrt(2),
      y: 200 - 30 * Math.sqrt(2),
    });
    actRenderer(() => handle.props.onDragStart(shaftGrab));
    actRenderer(() => handle.props.onDrag(shaftGrab));
    expect(onChange).toHaveBeenLastCalledWith(40);

    actRenderer(() => handle.props.onDrag(dragAt({
      x: 100 - 35 * Math.sqrt(2),
      y: 200 - 35 * Math.sqrt(2),
    })));
    expect(onChange).toHaveBeenLastCalledWith(50);

    const headGrab = dragAt({
      x: 100 - 20 * Math.sqrt(2),
      y: 200 - 20 * Math.sqrt(2),
    });
    actRenderer(() => handle.props.onDragStart(headGrab));
    actRenderer(() => handle.props.onDrag(dragAt({
      x: 100 + 10 * Math.sqrt(2),
      y: 200 + 10 * Math.sqrt(2),
    })));
    expect(onChange).toHaveBeenLastCalledWith(0);
    const arrow = wrapper.root.findByType(ControlArrow);
    expect(arrow.props.width).toEqual(10);
    expect(arrow.props.color).toEqual("purple");
    expect(arrow.props.label).toEqual("r40");
    const arrowStart =
      arrow.props.start as [number, number, number];
    const arrowEnd =
      arrow.props.end as [number, number, number];
    const getWorld = get3DPositionFunc(config);
    const expectedStart = getWorld({
      x: 100 - 70 * Math.sqrt(2),
      y: 200 - 70 * Math.sqrt(2),
    });
    const expectedEnd = getWorld({
      x: 100 - 20 * Math.sqrt(2),
      y: 200 - 20 * Math.sqrt(2),
    });
    expect(arrowStart).toEqual([
      expectedStart.x,
      expectedStart.y,
      20,
    ]);
    expect(arrowEnd).toEqual([
      expectedEnd.x,
      expectedEnd.y,
      20,
    ]);
    expect(new Vector3(...arrowStart)
      .distanceTo(new Vector3(...arrowEnd)))
      .toBeCloseTo(100);
    unmountRenderer(wrapper);
  });

  it("keeps finalized spacing independent from point radius", () => {
    const props = fakePointProps();
    const ref = React.createRef<GridPlantingController>();
    const wrapper = createRenderer(
      <GridPlanting ref={ref} {...props} />);
    actRenderer(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    actRenderer(() =>
      ref.current?.onClick(eventAt(props, { x: 220, y: 320 })));
    let controls = wrapper.root.findByType(GridPlantingControls);
    expect(controls.props.grid.spacingH).toEqual(100);
    expect(controls.props.grid.spacingV).toEqual(100);
    let radiusControl = wrapper.root.findByType(PointRadiusControl);
    expect(radiusControl.props.radius).toEqual(0);

    actRenderer(() => radiusControl.props.onChange(55));

    radiusControl = wrapper.root.findByType(PointRadiusControl);
    expect(radiusControl.props.radius).toEqual(60);
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...fakeDrawnPoint(), r: 60 },
    });
    controls = wrapper.root.findByType(GridPlantingControls);
    expect(controls.props.grid.spacingH).toEqual(100);
    expect(controls.props.grid.spacingV).toEqual(100);

    actRenderer(() =>
      wrapper.root.findByType(PointRadiusControl).props.onChange(-5));

    expect(wrapper.root.findByType(PointRadiusControl).props.radius)
      .toEqual(0);
    controls = wrapper.root.findByType(GridPlantingControls);
    expect(controls.props.grid.spacingH).toEqual(100);
    expect(controls.props.grid.spacingV).toEqual(100);
    unmountRenderer(wrapper);
  });

  it("starts point grids with zero radius and 100 millimeter spacing", () => {
    const props = fakePointProps();
    if (!props.addPlantProps.designer.gridPlanting) {
      throw new Error("Point grid request not found.");
    }
    props.addPlantProps.designer.gridPlanting.radius = 70;
    props.addPlantProps.designer.gridPlanting.defaultSpacing = 140;
    const ref = React.createRef<GridPlantingController>();
    const wrapper = createRenderer(
      <GridPlanting ref={ref} {...props} />);

    actRenderer(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    actRenderer(() =>
      ref.current?.onClick(eventAt(props, { x: 200, y: 200 })));

    const controls = wrapper.root.findByType(GridPlantingControls);
    expect(controls.props.grid).toEqual(expect.objectContaining({
      spacingH: 100,
      spacingV: 100,
      numPlantsH: 2,
      numPlantsV: 1,
    }));
    expect(wrapper.root.findByType(PointRadiusControl).props.radius)
      .toEqual(0);
    unmountRenderer(wrapper);
  });

  it("quantizes point radius to ten millimeters", () => {
    expect(quantizePointRadius(-10)).toEqual(0);
    expect(quantizePointRadius(0)).toEqual(0);
    expect(quantizePointRadius(34)).toEqual(30);
    expect(quantizePointRadius(35)).toEqual(40);
  });

  it("rounds extents to the nearest grid point", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    render(<GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onPointerMove(eventAt(props, { x: 140, y: 240 })));

    expect(screen.getByText("1 x 1")).toBeInTheDocument();
  });

  it("quantizes the selected starting position to 10 millimeters", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(<GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 104, y: 206 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 104, y: 206 })));

    const startControl = container.querySelector(
      "[name='grid-start-marker-control']");
    fireEvent.pointerOver(startControl as Element);
    expect(screen.getByText("(100, 210)")).toBeInTheDocument();
  });

  it("points the initial grid inward near the planting-area edge", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(<GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 950, y: 950 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 950, y: 950 })));

    const extentControl = container.querySelector(
      "[name='grid-extent-marker-control']");
    fireEvent.pointerOver(extentControl as Element);
    expect(screen.getByText("1 x 1")).toBeInTheDocument();
  });

  it("allows a one-plant grid when the default spacing cannot fit", () => {
    const props = fakeProps();
    props.addPlantProps.gridSize = { x: 50, y: 50 };
    props.addPlantProps.designer.gridStart = { x: 25, y: 25 };
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(<GridPlanting ref={ref} {...props} />);

    expect(container.querySelectorAll("[name='plant-icon-instances']")[0])
      .toHaveAttribute("count", "1");
    expect(container.querySelectorAll("[name='plant-icon-instances']")[1])
      .toHaveAttribute("count", "3");
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 25, y: 25 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 25, y: 25 })));
    expect(container.querySelector("[data-testid='grid-action-controls']"))
      .toBeInTheDocument();
    expect(screen.queryByText(
      "All plants must be within the planting area.")).not.toBeInTheDocument();
  });

  it("supports negative extents and restarts on Cancel", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(<GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 500, y: 500 })));
    act(() =>
      ref.current?.onPointerMove(eventAt(props, { x: 200, y: 100 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 200, y: 100 })));
    const extentControl = container.querySelector(
      "[name='grid-extent-marker-control']");
    fireEvent.pointerOver(extentControl as Element);
    expect(screen.getByText("4 x 5")).toBeInTheDocument();
    (props.addPlantProps.dispatch as jest.Mock).mockClear();

    clickControl(container, "grid-cancel-control");

    expect(container.querySelector("[data-testid='grid-action-controls']"))
      .not.toBeInTheDocument();
    expect(container.querySelector("[name='grid-start-helpers']"))
      .toBeInTheDocument();
    expect(screen.getByText("(100, 200)")).toBeInTheDocument();
    expect(props.addPlantProps.dispatch).not.toHaveBeenCalled();
  });

  it("stashes the preview when saving fails", async () => {
    const props = fakeProps();
    const dispatch = jest.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("save failed"))
      .mockResolvedValueOnce(undefined);
    props.addPlantProps.dispatch = dispatch;
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(<GridPlanting ref={ref} {...props} />);
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));

    await act(async () => {
      clickControl(container, "grid-save-control");
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(typeof dispatch.mock.calls[1][0]).toEqual("function");
    expect(typeof dispatch.mock.calls[2][0]).toEqual("function");
    expect(container.querySelector("[name='grid-save-control']"))
      .toBeInTheDocument();
  });

  it("saves grids in saved gardens as plant templates", async () => {
    const props = fakeProps();
    props.addPlantProps.designer.openedSavedGarden = 42;
    const ref = React.createRef<GridPlantingController>();
    const { container } = render(<GridPlanting ref={ref} {...props} />);
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));

    await act(async () => {
      clickControl(container, "grid-save-control");
      await Promise.resolve();
    });

    const batchAction = (props.addPlantProps.dispatch as jest.Mock)
      .mock.calls.map(call => call[0])
      .find(action => action.type == Actions.BATCH_INIT);
    expect(batchAction.payload).toHaveLength(1);
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
    const { container } = render(<GridPlanting ref={ref} {...props} />);

    act(() =>
      ref.current?.onClick(eventAt(props, { x: 500, y: 500 }, 2)));
    expect(screen.getByText("(100, 200)"))
      .toBeInTheDocument();
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
    expect(container.querySelector("[data-testid='grid-action-controls']"))
      .toBeInTheDocument();
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

  it("backsteps through grid placement phases with Escape", () => {
    const props = fakeProps();
    const ref = React.createRef<GridPlantingController>();
    const panelEscapeHandler = jest.fn();
    window.addEventListener("keydown", panelEscapeHandler);
    const { container, unmount } =
      render(<GridPlanting ref={ref} {...props} />);
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
    act(() =>
      ref.current?.onClick(eventAt(props, { x: 300, y: 400 })));
    expect(container.querySelector("[data-testid='grid-action-controls']"))
      .toBeInTheDocument();
    (props.addPlantProps.dispatch as jest.Mock).mockClear();

    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(container.querySelector("[data-testid='grid-action-controls']"))
      .not.toBeInTheDocument();
    expect(screen.getByText("3 x 3")).toBeInTheDocument();
    expect(props.addPlantProps.dispatch).not.toHaveBeenCalled();

    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(screen.getByText("(100, 200)"))
      .toBeInTheDocument();
    expect(props.addPlantProps.dispatch).not.toHaveBeenCalled();

    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(props.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
    expect(panelEscapeHandler).not.toHaveBeenCalled();
    window.removeEventListener("keydown", panelEscapeHandler);
    unmount();
  });

  it("shows existing-object alignment helpers while moving the final start",
    () => {
      const props = fakeProps();
      const ref = React.createRef<GridPlantingController>();
      const { container } = render(
        <GridPlanting ref={ref} {...props} />);
      act(() =>
        ref.current?.onClick(eventAt(props, { x: 100, y: 200 })));
      act(() =>
        ref.current?.onClick(eventAt(props, { x: 300, y: 400 })));
      expect(container.querySelector("[name='grid-start-helpers']"))
        .not.toBeInTheDocument();

      const startControl = container.querySelector(
        "[name='grid-start-marker-control']");
      if (!startControl) { throw new Error("Start control not found."); }
      fireEvent.pointerOver(startControl);

      const helpers = container.querySelector(
        "[name='grid-start-helpers']");
      expect(helpers).toBeInTheDocument();
      expect(helpers?.querySelectorAll(".line")).toHaveLength(2);
      expect(container.querySelector("[name='alignment-indicators']"))
        .toBeInTheDocument();
      expect(container.querySelector("[name='grid-start-spread-sphere']"))
        .not.toBeInTheDocument();

      fireEvent.pointerOut(startControl);
      expect(container.querySelector("[name='grid-start-helpers']"))
        .not.toBeInTheDocument();
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
    gridSize: { x: 1000, y: 1000 },
    getZ: () => 0,
    onChange: jest.fn(),
    onStartInteractionChange: jest.fn(),
    startControlZ: 475,
    extentControlZ: 500,
    spacingZ: 370,
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

  const dragEvent = (
    pointerEvent: ThreeEvent<PointerEvent>,
  ): ControlDragEvent => ({
    event: pointerEvent,
    point: pointerEvent.point,
    delta: new Vector3(),
    dragged: (pointerEvent.delta || 0) > 1,
  });

  it("handles movement, release, and cancellation", () => {
    const props = fakeProps();
    const { result } = renderHook(() => useGridControlHandlers(props));
    const current = (
      kind: Parameters<typeof result.current.handlers>[0],
    ) => result.current.handlers(kind);
    const idleMove = event({ x: 100, y: 100 });

    expect(current("start").constraint).toMatchObject({
      origin: [0, 0, 475],
    });
    expect(current("extent").constraint).toMatchObject({
      origin: [0, 0, 500],
    });
    expect(current("spacing-x").constraint).toMatchObject({
      origin: [0, 0, 370],
    });
    act(() => current("start").onDrag(dragEvent(idleMove)));
    expect(props.onChange).not.toHaveBeenCalled();

    const down = event({ x: 100, y: 100 });
    act(() => current("start").onDragStart(dragEvent(down)));
    expect(props.onStartInteractionChange).toHaveBeenLastCalledWith(true);
    act(() => current("start")
      .onDrag(dragEvent(event({ x: 300, y: 400 }, 2))));
    expect(props.onChange).toHaveBeenLastCalledWith({
      ...grid,
      startX: 300,
      startY: 400,
    });
    act(() => current("start")
      .onDragEnd(dragEvent(event({ x: 300, y: 400 }, 2))));
    expect(props.onStartInteractionChange).toHaveBeenLastCalledWith(false);

    props.onStartInteractionChange.mockClear();
    act(() => current("spacing-y")
      .onDragStart(dragEvent(event({ x: 100, y: 150 }))));
    act(() => current("spacing-y")
      .onDrag(dragEvent(event({ x: 100, y: 150 }, 2))));
    expect(props.onChange).toHaveBeenLastCalledWith({
      ...grid,
      spacingV: 100,
    });
    act(() => current("spacing-y")
      .onDrag(dragEvent(event({ x: 100, y: 180 }, 2))));
    expect(props.onChange).toHaveBeenLastCalledWith({
      ...grid,
      spacingV: 130,
    });
    expect(props.onStartInteractionChange).not.toHaveBeenCalled();
    act(() => current("spacing-y").onDragCancel());
    act(() => current("spacing-y").onDragCancel());

    act(() => current("spacing-x")
      .onDragStart(dragEvent(event({ x: 150, y: 100 }))));
    act(() => current("spacing-x")
      .onDrag(dragEvent(event({ x: 150, y: 100 }, 2))));
    expect(props.onChange).toHaveBeenLastCalledWith({
      ...grid,
      spacingH: 100,
    });
    act(() => current("spacing-x").onDragCancel());

    act(() => current("start-x")
      .onDragStart(dragEvent(event({ x: 100, y: 100 }))));
    act(() => current("start-x").onDragCancel());
    expect(props.onStartInteractionChange.mock.calls)
      .toEqual([[true], [false]]);
  });

  it("resizes both grid dimensions from the terminal sphere", () => {
    const props = fakeProps();
    const { result } = renderHook(() => useGridControlHandlers(props));
    const current = () => result.current.handlers("extent");

    act(() => current()
      .onDragStart(dragEvent(event({ x: 225, y: 185 }))));
    act(() => current()
      .onDrag(dragEvent(event({ x: 225, y: 185 }, 2))));
    expect(props.onChange).toHaveBeenLastCalledWith(grid);
    act(() => current()
      .onDrag(dragEvent(event({ x: 475, y: 335 }, 2))));
    expect(props.onChange).toHaveBeenLastCalledWith({
      ...grid,
      numPlantsH: 5,
      numPlantsV: 4,
    });
    act(() => current()
      .onDragEnd(dragEvent(event({ x: 475, y: 335 }, 2))));
    act(() => current()
      .onDragStart(dragEvent(event({ x: 100, y: 100 }))));
    act(() => current().onDragCancel());
  });

  it("keeps a dragged start clamped at the planting boundary", () => {
    const props = fakeProps();
    const onChange = jest.fn();
    const { result } = renderHook(() => {
      const [currentGrid, setCurrentGrid] = React.useState(grid);
      return useGridControlHandlers({
        ...props,
        grid: currentGrid,
        onChange: next => {
          onChange(next);
          setCurrentGrid(next);
        },
      });
    });
    const current = () => result.current.handlers("start");

    act(() => current()
      .onDragStart(dragEvent(event({ x: 100, y: 100 }))));
    [950, 990, 1010].forEach(x => {
      act(() => current()
        .onDrag(dragEvent(event({ x, y: 100 }, 2))));
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      ...grid,
      startX: 900,
    });
    act(() => current()
      .onDrag(dragEvent(event({ x: 850, y: 100 }, 2))));
    expect(onChange).toHaveBeenLastCalledWith({
      ...grid,
      startX: 850,
    });
    act(() => current().onDragCancel());
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
    expect(update("start", { x: 303, y: 407 }))
      .toEqual({ ...grid, startX: 300, startY: 410 });
    expect(gridDragUpdate({
      drag: {
        kind: "start-x",
        startGrid: { ...grid, startY: 103 },
        offset: { x: 0, y: 0 },
      },
      point: { x: 303, y: 407 },
      gridSize: { x: 1000, y: 1000 },
      offsetPacking: false,
    })).toEqual({ ...grid, startX: 300, startY: 103 });
  });

  it("sets signed spacing and both plant counts", () => {
    expect(update("spacing-x", { x: 47, y: 100 }).spacingH)
      .toEqual(-50);
    expect(update("spacing-y", { x: 100, y: 347 }).spacingV)
      .toEqual(250);
    expect(update("extent", { x: 500, y: 400 }).numPlantsH)
      .toEqual(5);
    expect(update("extent", { x: 500, y: 400 }).numPlantsV)
      .toEqual(4);
    expect(update("extent", { x: 0, y: 400 })).toEqual({
      ...grid,
      spacingH: -100,
      numPlantsH: 2,
      numPlantsV: 4,
    });
  });

  it("keeps spacing within the planting area at each boundary", () => {
    const boundaryUpdate = (
      startGrid: PlantGridData,
      kind: "spacing-x" | "spacing-y",
      point: { x: number, y: number },
    ) => gridDragUpdate({
      drag: {
        kind,
        startGrid,
        offset: { x: 0, y: 0 },
      },
      point,
      gridSize: { x: 1000, y: 1000 },
      offsetPacking: false,
    });
    const xBoundary = {
      ...grid,
      startX: 1000,
      spacingH: -100,
    };
    const yBoundary = {
      ...grid,
      startY: 0,
      spacingV: 100,
    };

    expect(boundaryUpdate(
      xBoundary, "spacing-x", { x: 1001, y: 100 },
    )).toEqual(xBoundary);
    expect(boundaryUpdate(
      yBoundary, "spacing-y", { x: 100, y: -1 },
    )).toEqual(yBoundary);
    expect(boundaryUpdate({
      ...grid,
      startX: 20,
      spacingH: 100,
      numPlantsH: 3,
    }, "spacing-x", { x: 0, y: 100 }).spacingH).toEqual(-10);
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
      onSuccess: jest.fn(),
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
      onSuccess: jest.fn(),
    });
    expect(addPlantProps.dispatch).not.toHaveBeenCalled();
    expect(setSaving).not.toHaveBeenCalled();
  });
});
