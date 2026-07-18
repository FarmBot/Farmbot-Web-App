let mockIsMobile = false;
import React from "react";
import { useTexture } from "@react-three/drei";
import {
  BillboardRef,
  ImageRef,
  PlantPlacementSphere,
  PointerObjects, PointerObjectsProps,
  PointerPlantRef,
  pointPlacementPhase,
  RadiusRef,
  SinglePointFinalControls,
  soilClick, SoilClickProps,
  soilPointerMove, SoilPointerMoveProps,
  SinglePointRadiusControl,
  SinglePointRadiusControlRef,
  singlePointRadiusFromCursor,
  TorusRef,
  XCrosshairRef,
  YCrosshairRef,
} from "../pointer_objects";
import {
  act, fireEvent, render, screen,
} from "@testing-library/react";
import { INITIAL } from "../../../config";
import { fakeAddPlantProps } from "../../../../__test_support__/fake_props";
import { fakeDrawnPoint } from "../../../../__test_support__/fake_designer_state";
import { clone } from "lodash";
import { Path } from "../../../../internal_urls";
import {
  Vector3, WebGLProgramParametersWithUniforms,
} from "three";
import { ThreeEvent } from "@react-three/fiber";
import * as plantActions from "../../../plant_actions";
import * as pointActions from "../../../../points/create_point_action";
import * as screenSize from "../../../../screen_size";
import { PLANT_ICON_ATLAS } from "../../../garden/plant_icon_atlas";
import { fakePoint } from "../../../../__test_support__/fake_state/resources";
import { SpecialStatus } from "farmbot";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../../../__test_support__/test_renderer";
import {
  get3DPositionFunc, getGardenPositionFunc,
} from "../../../helpers";
import { Actions } from "../../../../constants";
import {
  ControlArrow, ControlHandle, ControlSphere,
} from "../../../controls";
import { Mode } from "../../../../farm_designer/map/interfaces";

let dropPlantSpy: jest.SpyInstance;
let createPointSpy: jest.SpyInstance;
let isMobileSpy: jest.SpyInstance;
let requestAnimationFrameSpy: jest.SpyInstance;
type AnimationFrameHandler = Parameters<typeof window.requestAnimationFrame>[0];

beforeEach(() => {
  mockIsMobile = false;
  dropPlantSpy = jest.spyOn(plantActions, "dropPlant3D").mockImplementation(jest.fn());
  createPointSpy = jest.spyOn(pointActions, "createPoint")
    .mockImplementation(jest.fn());
  isMobileSpy = jest.spyOn(screenSize, "isMobile")
    .mockImplementation(() => mockIsMobile);
  requestAnimationFrameSpy = jest.spyOn(window, "requestAnimationFrame")
    .mockImplementation(callback => {
      callback(0);
      return 1;
    });
});

afterEach(() => {
  dropPlantSpy.mockRestore();
  createPointSpy.mockRestore();
  isMobileSpy.mockRestore();
  requestAnimationFrameSpy.mockRestore();
  delete PLANT_ICON_ATLAS["/crops/icons/mint.avif"];
});

describe("<PointerObjects />", () => {
  const fakeProps = (): PointerObjectsProps => ({
    config: clone(INITIAL),
    mapPoints: [],
    plants: [],
    weeds: [],
    showPlants: true,
    showPoints: true,
    showWeeds: true,
    navigate: jest.fn(),
    getZ: () => 0,
    addPlantProps: fakeAddPlantProps(),
    pointerPlantRef: { current: { position: new Vector3(0, 0, 0) } } as PointerPlantRef,
    radiusRef: { current: { scale: new Vector3(0, 0, 0) } } as RadiusRef,
    torusRef: { current: { scale: new Vector3(0, 0, 0) } } as TorusRef,
    billboardRef: { current: { position: new Vector3(0, 0, 0) } } as BillboardRef,
    imageRef: { current: { scale: new Vector3(0, 0, 0) } } as ImageRef,
    xCrosshairRef: { current: { position: new Vector3(0, 0, 0) } } as XCrosshairRef,
    yCrosshairRef: { current: { position: new Vector3(0, 0, 0) } } as YCrosshairRef,
    alignmentIndicatorRef: { current: { update: jest.fn() } },
    // eslint-disable-next-line no-null/no-null
    placementCoordinateLabelRef: { current: null },
    // eslint-disable-next-line no-null/no-null
    singlePointRadiusRef: { current: null },
    activePositionRef: { current: { x: 0, y: 0 } },
  });

  it("renders", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const p = fakeProps();
    const { container } = render(<PointerObjects {...p} />);
    expect(container).toContainHTML("pointerPlant");
    expect(container).toContainHTML("alignment-indicators");
    act(() => p.placementCoordinateLabelRef.current?.update({
      x: 100.04,
      y: 200.05,
      z: 3.66,
    }));
    expect(screen.getByText("(100, 200.1)"))
      .toBeInTheDocument();
  });

  it("restores the live cursor position when single placement mounts", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.activePositionRef.current =
      get3DPositionFunc(p.config)({ x: 320, y: 470 });

    render(<PointerObjects {...p} />);

    expect(screen.getByText("(320, 470)")).toBeInTheDocument();
  });

  it.each([
    ["point", Path.points("add")],
    ["weed", Path.weeds("add")],
  ])("shows coordinates while setting a %s location", (_label, path) => {
    location.pathname = Path.mock(path);
    const p = fakeProps();
    p.addPlantProps.designer.drawnPoint = {
      ...fakeDrawnPoint(),
      cx: undefined,
      cy: undefined,
    };
    render(<PointerObjects {...p} />);

    act(() => p.placementCoordinateLabelRef.current?.update({
      x: 10,
      y: 20,
      z: 30,
    }));

    expect(screen.getByText("(10, 20)"))
      .toBeInTheDocument();
  });

  it("hides indicators during a grid preview", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const point = fakePoint();
    point.specialStatus = SpecialStatus.DIRTY;
    point.body.meta.gridId = "preview";
    p.mapPoints = [point];

    const { container } = render(<PointerObjects {...p} />);

    expect(container).not.toContainHTML("alignment-indicators");
    expect(p.placementCoordinateLabelRef.current).toBeNull();
  });

  it("hides indicators while setting a point radius", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const point = fakeDrawnPoint();
    point.cx = 100;
    point.cy = 200;
    p.addPlantProps.designer.drawnPoint = point;

    const { container } = render(<PointerObjects {...p} />);

    expect(container).not.toContainHTML("alignment-indicators");
  });

  it("shows the live radius arrow and label for a single point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.addPlantProps.designer.drawnPoint = {
      ...fakeDrawnPoint(),
      cx: 100,
      cy: 200,
      r: 0,
      color: "purple",
    };
    const { container, rerender } = render(<PointerObjects {...p} />);

    expect(container.querySelector(
      "[name='single-point-radius-arrow']")).toBeInTheDocument();
    expect(container.querySelector("[name='single-point-radius-arrow']")
      ?.querySelector("[color='purple']")).toBeInTheDocument();
    expect(screen.getByText("r0").querySelector("[color='purple']"))
      .toBeInTheDocument();
    act(() => p.singlePointRadiusRef.current?.update({
      x: 70,
      y: 160,
    }));
    expect(screen.getByText("r50")).toBeInTheDocument();
    act(() => p.singlePointRadiusRef.current?.update({
      x: 130,
      y: 240,
    }));
    expect(screen.getByText("r50")).toBeInTheDocument();

    p.addPlantProps = {
      ...p.addPlantProps,
      designer: {
        ...p.addPlantProps.designer,
        drawnPoint: {
          ...p.addPlantProps.designer.drawnPoint,
          color: "blue",
        },
      },
    };
    rerender(<PointerObjects {...p} />);
    expect(container.querySelector("[name='single-point-radius-arrow']")
      ?.querySelector("[color='blue']")).toBeInTheDocument();
    expect(screen.getByText("r50").querySelector("[color='blue']"))
      .toBeInTheDocument();
  });

  it("moves the radius arrow around the cursor radius", () => {
    const center = { x: 100, y: 200 };

    expect(singlePointRadiusFromCursor(
      center, { x: 70, y: 160 })).toEqual(50);
    expect(singlePointRadiusFromCursor(
      center, { x: 100, y: 200 })).toEqual(0);
    expect(singlePointRadiusFromCursor(
      center, { x: 130, y: 240 })).toEqual(50);

    const config = clone(INITIAL);
    const ref = React.createRef<SinglePointRadiusControlRef>();
    const wrapper = createRenderer(
      <SinglePointRadiusControl
        ref={ref}
        config={config}
        point={{
          ...fakeDrawnPoint(),
          cx: center.x,
          cy: center.y,
          r: 0,
        }} />);
    const getGardenPosition = getGardenPositionFunc(config);
    const arrowEnd = () => {
      const end = wrapper.root.findByType(ControlArrow)
        .props.end as [number, number, number];
      return getGardenPosition(new Vector3(...end));
    };
    actRenderer(() => ref.current?.update({ x: 130, y: 240 }));
    expect(arrowEnd().x).toBeGreaterThan(center.x);
    expect(arrowEnd().y).toBeGreaterThan(center.y);
    actRenderer(() => ref.current?.update({ x: 70, y: 160 }));
    expect(arrowEnd().x).toBeLessThan(center.x);
    expect(arrowEnd().y).toBeLessThan(center.y);
    unmountRenderer(wrapper);
  });

  it("derives point placement phases", () => {
    expect(pointPlacementPhase(Mode.createPoint, undefined))
      .toEqual("position");
    expect(pointPlacementPhase(Mode.createPoint, {
      ...fakeDrawnPoint(),
      cx: undefined,
      cy: undefined,
    })).toEqual("position");
    expect(pointPlacementPhase(Mode.createPoint, fakeDrawnPoint()))
      .toEqual("radius");
    expect(pointPlacementPhase(Mode.createPoint, {
      ...fakeDrawnPoint(),
      placementPhase: "finalize",
    })).toEqual("finalize");
  });

  it("shows point finalization controls and actions", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const point = {
      ...fakeDrawnPoint(),
      cx: 100,
      cy: 200,
      r: 30,
      placementPhase: "finalize" as const,
    };
    p.addPlantProps.designer.drawnPoint = point;
    const { container } = render(<PointerObjects {...p} />);

    expect(container.querySelector(
      "[data-testid='single-point-action-controls']"))
      .toBeInTheDocument();
    expect(container.querySelector(
      "[name='single-point-start-marker'] [color='white']"))
      .toBeInTheDocument();
    expect(container.querySelector(
      "[name='single-point-start-x-arrow-shape']"))
      .toBeInTheDocument();
    expect(container.querySelector(
      "[name='single-point-start-y-arrow-shape']"))
      .toBeInTheDocument();
    expect(container.querySelector(
      "[name='single-point-radius-control']"))
      .toBeInTheDocument();

    fireEvent.pointerOver(container.querySelector(
      "[name='single-point-start-marker-control']") as Element);
    expect(screen.getByText("(100, 200)")).toBeInTheDocument();

    fireEvent.click(container.querySelector(
      "[name='single-point-color-control']") as Element);
    expect(container.querySelectorAll(
      ".grid-point-color-menu .saucer")).toHaveLength(8);
    fireEvent.click(document.querySelector("[title='blue']") as Element);
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...point, color: "blue" },
    });

    (p.addPlantProps.dispatch as jest.Mock).mockClear();
    fireEvent.click(container.querySelector(
      "[name='single-point-cancel-control']") as Element);
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: {
        ...point,
        cx: undefined,
        cy: undefined,
        r: 0,
        placementPhase: "position",
      },
    });

    fireEvent.click(container.querySelector(
      "[name='single-point-save-control']") as Element);
    expect(createPointSpy).toHaveBeenCalledWith({
      dispatch: p.addPlantProps.dispatch,
      drawnPoint: point,
      navigate: p.navigate,
    });
    createPointSpy.mockClear();
    fireEvent.keyDown(window, { key: "Enter" });
    expect(createPointSpy).toHaveBeenCalled();
  });

  it("quantizes independent X and Y final position controls", () => {
    const config = clone(INITIAL);
    const onChange = jest.fn();
    const point = {
      ...fakeDrawnPoint(),
      cx: 100,
      cy: 200,
      placementPhase: "finalize" as const,
    };
    const wrapper = createRenderer(<SinglePointFinalControls
      config={config}
      point={point}
      gridSize={{ x: 500, y: 500 }}
      getZ={x => x / 10}
      onChange={onChange}
      onCancel={jest.fn()}
      onSave={jest.fn()} />);
    const handles = wrapper.root.findAllByType(ControlHandle);
    const xHandle = handles.find(handle =>
      handle.props.name == "single-point-start-x-arrow");
    if (!xHandle) { throw new Error("X point position control not found."); }
    const dragAt = (position: { x: number, y: number }) => {
      const world = get3DPositionFunc(config)(position);
      return {
        point: new Vector3(world.x, world.y, 125),
        delta: new Vector3(),
        dragged: true,
        event: {} as ThreeEvent<PointerEvent>,
      };
    };
    actRenderer(() =>
      xHandle.props.onDragStart(dragAt({ x: 150, y: 200 })));
    actRenderer(() =>
      xHandle.props.onDrag(dragAt({ x: 174, y: 260 })));
    actRenderer(() =>
      xHandle.props.onDragEnd(dragAt({ x: 174, y: 260 })));
    actRenderer(() => xHandle.props.onDragCancel());

    expect(onChange).toHaveBeenCalledWith({
      ...point,
      cx: 120,
      cy: 200,
      z: 12,
    });
    expect(wrapper.root.findByType(ControlSphere).props.colorType)
      .toEqual("origin");
    const arrows = wrapper.root.findAllByType(ControlArrow);
    expect(arrows.map(arrow => arrow.props.width)).toEqual([10, 10]);
    expect(arrows.map(arrow => arrow.props.colorType))
      .toEqual(["x", "y"]);
    unmountRenderer(wrapper);
  });

  it("dispatches finalized radius adjustments", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const center = { x: 100, y: 200 };
    p.addPlantProps.designer.drawnPoint = {
      ...fakeDrawnPoint(),
      cx: center.x,
      cy: center.y,
      r: 40,
      placementPhase: "finalize",
    };
    const wrapper = createRenderer(<PointerObjects {...p} />);
    const handle = wrapper.root.findAllByType(ControlHandle)
      .find(node => node.props.name == "single-point-radius-control");
    if (!handle) { throw new Error("Point radius control not found."); }
    const direction = {
      x: -1 / Math.sqrt(2),
      y: -1 / Math.sqrt(2),
    };
    const dragAt = (distance: number) => {
      const garden = {
        x: center.x + direction.x * distance,
        y: center.y + direction.y * distance,
      };
      const world = get3DPositionFunc(p.config)(garden);
      return {
        point: new Vector3(world.x, world.y, 20),
        delta: new Vector3(),
        dragged: true,
        event: {} as ThreeEvent<PointerEvent>,
      };
    };
    actRenderer(() => handle.props.onDragStart(dragAt(70)));
    actRenderer(() => handle.props.onDrag(dragAt(80)));

    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: expect.objectContaining({ r: 50 }),
    });
    unmountRenderer(wrapper);
  });

  it("adjusts finalized radius without jumping from the shaft", () => {
    const config = clone(INITIAL);
    const onChange = jest.fn();
    const center = { x: 100, y: 200 };
    const direction = {
      x: -1 / Math.sqrt(2),
      y: -1 / Math.sqrt(2),
    };
    const wrapper = createRenderer(<SinglePointRadiusControl
      config={config}
      point={{
        ...fakeDrawnPoint(),
        cx: center.x,
        cy: center.y,
        r: 40,
      }}
      editable={true}
      onChange={onChange} />);
    const handle = wrapper.root.findByType(ControlHandle);
    const dragAt = (distance: number) => {
      const garden = {
        x: center.x + direction.x * distance,
        y: center.y + direction.y * distance,
      };
      const world = get3DPositionFunc(config)(garden);
      return {
        point: new Vector3(world.x, world.y, 20),
        delta: new Vector3(),
        dragged: true,
        event: {} as ThreeEvent<PointerEvent>,
      };
    };
    actRenderer(() => handle.props.onDragStart(dragAt(70)));
    actRenderer(() => handle.props.onDrag(dragAt(70)));
    expect(onChange).toHaveBeenLastCalledWith(40);
    actRenderer(() => handle.props.onDrag(dragAt(80)));
    expect(onChange).toHaveBeenLastCalledWith(50);
    actRenderer(() => handle.props.onDrag(dragAt(-10)));
    expect(onChange).toHaveBeenLastCalledWith(0);
    unmountRenderer(wrapper);
  });

  it("loads the atlas texture for the pointer plant preview", () => {
    PLANT_ICON_ATLAS["/crops/icons/mint.avif"] = {
      atlasUrl: "/crops/icons/atlas.avif",
      textureWidth: 256,
      textureHeight: 256,
      x: 0,
      y: 0,
      width: 64,
      height: 64,
    };
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;

    render(<PointerObjects {...fakeProps()} />);

    expect(useTexture).toHaveBeenCalledWith("/crops/icons/atlas.avif");
  });

  it("shows placement controls while the crop texture loads", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    (useTexture as unknown as jest.Mock).mockImplementationOnce(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw new Promise(() => undefined);
    });

    const { container } = render(<PointerObjects {...fakeProps()} />);

    expect(container).toContainHTML("pointerPlant");
    expect(container).toContainHTML("x-crosshair");
    expect(container).toContainHTML("y-crosshair");
    expect(container).toContainHTML("alignment-indicators");
  });

  it("skips hidden preview work in ordinary designer mode", () => {
    location.pathname = Path.mock(Path.designer());
    mockIsMobile = false;
    const useTextureMock = useTexture as unknown as jest.Mock;
    useTextureMock.mockClear();
    const gridMetaReads = { current: 0 };
    const point = fakePoint();
    point.specialStatus = SpecialStatus.DIRTY;
    Object.defineProperty(point.body, "meta", {
      get: () => {
        gridMetaReads.current += 1;
        return { gridId: 1 };
      },
    });
    const p = fakeProps();
    p.mapPoints = [point];

    const { container } = render(<PointerObjects {...p} />);

    expect(container).not.toContainHTML("hover-elements");
    expect(useTextureMock).not.toHaveBeenCalled();
    expect(gridMetaReads.current).toEqual(0);
  });

  it("keeps the active preview stable across unrelated config churn", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const useTextureMock = useTexture as unknown as jest.Mock;
    useTextureMock.mockClear();
    const p = fakeProps();
    const { rerender } = render(<PointerObjects {...p} />);
    expect(useTextureMock).toHaveBeenCalledTimes(1);

    rerender(<PointerObjects
      {...p}
      config={{
        ...p.config,
        grid: !p.config.grid,
        stats: !p.config.stats,
        lightsDebug: !p.config.lightsDebug,
      }} />);
    expect(useTextureMock).toHaveBeenCalledTimes(1);

    rerender(<PointerObjects
      {...p}
      config={{
        ...p.config,
        bedLengthOuter: p.config.bedLengthOuter + 10,
      }} />);
    expect(useTextureMock).toHaveBeenCalledTimes(2);
  });
});

describe("<PlantPlacementSphere />", () => {
  it("provides white placement color and computed bounds to the shader", () => {
    const wrapper = createRenderer(<PlantPlacementSphere
      config={clone(INITIAL)}
      spread={100} />);
    const material = wrapper.root.find(node =>
      typeof node.props.onBeforeCompile == "function");
    const shader = {
      vertexShader: [
        "#include <common>",
        "#include <color_vertex>",
        "#include <worldpos_vertex>",
      ].join("\n"),
      fragmentShader: [
        "#include <common>",
        "#include <color_fragment>",
      ].join("\n"),
      uniforms: {},
    } as unknown as WebGLProgramParametersWithUniforms;

    material.props.onBeforeCompile(shader);

    expect(shader.uniforms.uBoundsCenter.value).toBeInstanceOf(Vector3);
    expect(shader.uniforms.uHalfSize.value).toBeInstanceOf(Vector3);
    expect(shader.uniforms.uInside.value.getHexString()).toEqual("ffffff");
    unmountRenderer(wrapper);
  });
});

describe("soilClick()", () => {
  const fakeProps = (): SoilClickProps => ({
    config: clone(INITIAL),
    navigate: jest.fn(),
    addPlantProps: fakeAddPlantProps(),
    pointerPlantRef: { current: { position: new Vector3(0, 0, 0) } } as PointerPlantRef,
    getZ: () => 0,
  });

  it("creates plant", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const p = fakeProps();
    const e = {
      stopPropagation: jest.fn(),
      point: { x: 1, y: 2 },
    } as unknown as ThreeEvent<MouseEvent>;
    soilClick(p)(e);
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(dropPlantSpy).toHaveBeenCalledWith(expect.objectContaining({
      gardenCoords: { x: 1350, y: 660 },
    }));
  });

  it("creates plant with mirrored garden coordinates", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const p = fakeProps();
    p.config.mirrorX = true;
    p.config.mirrorY = true;
    p.config.botSizeX = 2000;
    p.config.botSizeY = 1000;
    const e = {
      stopPropagation: jest.fn(),
      point: { x: 1, y: 2 },
    } as unknown as ThreeEvent<MouseEvent>;
    soilClick(p)(e);
    expect(dropPlantSpy).toHaveBeenCalledWith(expect.objectContaining({
      gardenCoords: { x: 1350, y: 660 },
    }));
  });

  it("doesn't create a plant after a drag", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const p = fakeProps();
    const e = {
      stopPropagation: jest.fn(),
      point: { x: 1, y: 2 },
      delta: 3,
    } as unknown as ThreeEvent<MouseEvent>;
    soilClick(p)(e);
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(dropPlantSpy).not.toHaveBeenCalled();
  });

  it.each([
    ["point", Path.points("add")],
    ["weed", Path.weeds("add")],
  ])("doesn't set %s location after a drag", (_label, path) => {
    location.pathname = Path.mock(path);
    mockIsMobile = false;
    const p = fakeProps();
    const point = fakeDrawnPoint();
    point.cx = undefined;
    point.cy = undefined;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    const e = {
      stopPropagation: jest.fn(),
      point: { x: 1, y: 2 },
      delta: 3,
    } as unknown as ThreeEvent<MouseEvent>;
    soilClick(p)(e);
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(p.addPlantProps.dispatch).not.toHaveBeenCalled();
  });

  it.each([
    ["point", Path.points("add"), "finalize"],
    ["weed", Path.weeds("add"), undefined],
  ] as const)("handles a zero-radius %s", (
    _label, path, placementPhase,
  ) => {
    location.pathname = Path.mock(path);
    mockIsMobile = false;
    const p = fakeProps();
    const eventPoint = { x: 1, y: 2 };
    const center = getGardenPositionFunc(p.config)(eventPoint);
    p.addPlantProps.designer.drawnPoint = {
      ...fakeDrawnPoint(),
      cx: center.x,
      cy: center.y,
      r: 30,
    };

    soilClick(p)({
      stopPropagation: jest.fn(),
      point: eventPoint,
    } as unknown as ThreeEvent<MouseEvent>);

    const expectedPoint = expect.objectContaining({
      cx: center.x,
      cy: center.y,
      r: 0,
      ...(placementPhase ? { placementPhase } : {}),
    });
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: expectedPoint,
    });
    expect(createPointSpy).not.toHaveBeenCalled();
  });

  it("finalizes a point radius in any cursor direction", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    const p = fakeProps();
    const center = { x: 100, y: 200 };
    const cursor = { x: 140, y: 240 };
    p.addPlantProps.designer.drawnPoint = {
      ...fakeDrawnPoint(),
      cx: center.x,
      cy: center.y,
      r: 30,
    };

    soilClick(p)({
      stopPropagation: jest.fn(),
      point: get3DPositionFunc(p.config)(cursor),
    } as unknown as ThreeEvent<MouseEvent>);

    const expectedPoint = expect.objectContaining({
      r: 60,
      placementPhase: "finalize",
    });
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: expectedPoint,
    });
    expect(createPointSpy).not.toHaveBeenCalled();
  });

  it("ignores soil clicks while finalizing a point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.addPlantProps.designer.drawnPoint = {
      ...fakeDrawnPoint(),
      placementPhase: "finalize",
    };

    soilClick(p)({
      stopPropagation: jest.fn(),
      point: new Vector3(),
    } as unknown as ThreeEvent<MouseEvent>);

    expect(p.addPlantProps.dispatch).not.toHaveBeenCalled();
    expect(createPointSpy).not.toHaveBeenCalled();
  });

  it("sets a weed location before sizing it", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    p.addPlantProps.designer.drawnPoint = {
      ...fakeDrawnPoint(),
      cx: undefined,
      cy: undefined,
    };

    soilClick(p)({
      stopPropagation: jest.fn(),
      point: new Vector3(1, 2, 0),
    } as unknown as ThreeEvent<MouseEvent>);

    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: expect.objectContaining({
        cx: 1350,
        cy: 660,
      }),
    });
    expect(createPointSpy).not.toHaveBeenCalled();
  });

  it("creates a weed after setting a positive radius", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    const center = { x: 100, y: 200 };
    p.addPlantProps.designer.drawnPoint = {
      ...fakeDrawnPoint(),
      cx: center.x,
      cy: center.y,
    };

    soilClick(p)({
      stopPropagation: jest.fn(),
      point: get3DPositionFunc(p.config)({ x: 130, y: 240 }),
    } as unknown as ThreeEvent<MouseEvent>);

    expect(createPointSpy).toHaveBeenCalledWith({
      dispatch: p.addPlantProps.dispatch,
      drawnPoint: expect.objectContaining({ r: 50 }),
      navigate: p.navigate,
    });
  });
});

describe("soilPointerMove()", () => {
  const flushAnimationFrame = (callback: AnimationFrameHandler | null) => {
    if (!callback) {
      throw new Error("Missing animation frame callback");
    }
    callback(0);
  };

  const fakeProps = (): SoilPointerMoveProps => ({
    config: clone(INITIAL),
    addPlantProps: fakeAddPlantProps(),
    getZ: () => 0,
    pointerPlantRef: { current: { position: { set: jest.fn() } } } as unknown as PointerPlantRef,
    radiusRef: { current: { scale: { set: jest.fn() } } } as unknown as RadiusRef,
    torusRef: { current: { scale: { set: jest.fn() } } } as unknown as TorusRef,
    billboardRef: { current: { position: { set: jest.fn() } } } as unknown as BillboardRef,
    imageRef: { current: { scale: { set: jest.fn() } } } as unknown as ImageRef,
    xCrosshairRef: { current: { position: { set: jest.fn() } } } as unknown as XCrosshairRef,
    yCrosshairRef: { current: { position: { set: jest.fn() } } } as unknown as YCrosshairRef,
    alignmentIndicatorRef: { current: { update: jest.fn() } },
    placementCoordinateLabelRef: {
      current: { update: jest.fn() },
    },
    singlePointRadiusRef: {
      current: { update: jest.fn() },
    },
    activePositionRef: { current: { x: 0, y: 0 } },
  });

  it("updates plant position", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const p = fakeProps();
    p.config.columnLength = 100;
    const e = {
      stopPropagation: jest.fn(),
      point: { x: 100, y: 200 },
    } as unknown as ThreeEvent<MouseEvent>;
    soilPointerMove(p)(e);
    expect(p.pointerPlantRef.current?.position.set)
      .toHaveBeenCalledWith(100, 200, 0);
    expect(p.alignmentIndicatorRef.current?.update)
      .toHaveBeenCalledWith({ x: 1450, y: 860 });
    expect(p.placementCoordinateLabelRef.current?.update)
      .toHaveBeenCalledWith({ x: 1450, y: 860, z: 0 });
  });

  it("coalesces pointer updates into one animation frame", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    // eslint-disable-next-line no-null/no-null
    let frameCallback: AnimationFrameHandler | null = null;
    requestAnimationFrameSpy.mockImplementation(callback => {
      frameCallback = callback;
      return 1;
    });
    const p = fakeProps();
    p.config.columnLength = 100;
    const handler = soilPointerMove(p);
    handler({
      stopPropagation: jest.fn(),
      point: { x: 100, y: 200 },
    } as unknown as ThreeEvent<MouseEvent>);
    handler({
      stopPropagation: jest.fn(),
      point: { x: 110, y: 210 },
    } as unknown as ThreeEvent<MouseEvent>);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    flushAnimationFrame(frameCallback);
    expect(p.pointerPlantRef.current?.position.set)
      .toHaveBeenCalledTimes(1);
    expect(p.pointerPlantRef.current?.position.set)
      .toHaveBeenCalledWith(110, 210, 0);
    expect(p.alignmentIndicatorRef.current?.update)
      .toHaveBeenCalledTimes(1);
    expect(p.alignmentIndicatorRef.current?.update)
      .toHaveBeenCalledWith({ x: 1460, y: 870 });
  });

  it("updates plant position with mirrored world coordinates", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const p = fakeProps();
    p.config.columnLength = 100;
    p.config.botSizeX = 1000;
    p.config.botSizeY = 800;
    p.config.mirrorX = true;
    p.config.mirrorY = true;
    const e = {
      stopPropagation: jest.fn(),
      point: { x: 100, y: 200 },
    } as unknown as ThreeEvent<MouseEvent>;
    soilPointerMove(p)(e);
    expect(p.pointerPlantRef.current?.position.set)
      .toHaveBeenCalledWith(100, 200, 0);
  });

  it("skips re-rendering the same pointer position", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    // eslint-disable-next-line no-null/no-null
    let frameCallback: AnimationFrameHandler | null = null;
    requestAnimationFrameSpy.mockImplementation(callback => {
      frameCallback = callback;
      return 1;
    });
    const p = fakeProps();
    const getZ = jest.fn(() => 0);
    p.getZ = getZ;
    p.config.columnLength = 100;
    const handler = soilPointerMove(p);
    const event = {
      stopPropagation: jest.fn(),
      point: { x: 100, y: 200 },
    } as unknown as ThreeEvent<MouseEvent>;
    handler(event);
    flushAnimationFrame(frameCallback);
    handler(event);
    flushAnimationFrame(frameCallback);
    expect(p.pointerPlantRef.current?.position.set)
      .toHaveBeenCalledTimes(1);
    expect(p.xCrosshairRef.current?.position.set)
      .toHaveBeenCalledTimes(1);
    expect(p.yCrosshairRef.current?.position.set)
      .toHaveBeenCalledTimes(1);
    expect(p.alignmentIndicatorRef.current?.update)
      .toHaveBeenCalledTimes(1);
    expect(getZ).toHaveBeenCalledTimes(1);
  });

  it("updates the point preview radius around its center", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    const p = fakeProps();
    const center = { x: 100, y: 200 };
    p.addPlantProps.designer.drawnPoint = {
      ...fakeDrawnPoint(),
      cx: center.x,
      cy: center.y,
      r: 0,
    };
    const moveTo = (cursor: { x: number, y: number }) =>
      soilPointerMove(p)({
        stopPropagation: jest.fn(),
        point: get3DPositionFunc(p.config)(cursor),
      } as unknown as ThreeEvent<MouseEvent>);

    moveTo({ x: 140, y: 240 });
    expect(p.radiusRef.current?.scale.set)
      .toHaveBeenLastCalledWith(60, 60, 60);
    moveTo({ x: 50, y: 150 });
    expect(p.radiusRef.current?.scale.set)
      .toHaveBeenLastCalledWith(70, 70, 70);
  });
});
