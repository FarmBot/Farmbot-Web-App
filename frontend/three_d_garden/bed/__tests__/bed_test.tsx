let mockIsMobile = false;

const mockSetPlantPosition = jest.fn();
const mockSetRadiusScale = jest.fn();
const mockSetTorusScale = jest.fn();
const mockSetBillboardPosition = jest.fn();
const mockSetImageScale = jest.fn();
const mockSetXCrosshairPosition = jest.fn();
const mockSetYCrosshairPosition = jest.fn();
interface MockPlantRefCurrent {
  position: { set: Function; };
}
interface MockRadiusRefCurrent {
  scale: { set: Function; };
}
interface MockTorusRefCurrent {
  scale: { set: Function; };
}
interface MockBillboardRefCurrent {
  position: { set: Function; };
}
interface MockImageRefCurrent {
  scale: { set: Function; };
}
interface MockXCrosshairRefCurrent {
  position: { set: Function; };
}
interface MockYCrosshairRefCurrent {
  position: { set: Function; };
}
interface MockAlignmentRefCurrent {
  update: Function;
}
interface MockInstancesRefCurrent {
  geometry: { setAttribute: Function; };
}
interface MockPlantRef {
  current: MockPlantRefCurrent | undefined;
}
interface MockRadiusRef {
  current: MockRadiusRefCurrent | undefined;
}
interface MockTorusRef {
  current: MockTorusRefCurrent | undefined;
}
interface MockBillboardRef {
  current: MockBillboardRefCurrent | undefined;
}
interface MockImageRef {
  current: MockImageRefCurrent | undefined;
}
interface MockXCrosshairRef {
  current: MockXCrosshairRefCurrent | undefined;
}
interface MockYCrosshairRef {
  current: MockYCrosshairRefCurrent | undefined;
}
interface MockAlignmentRef {
  current: MockAlignmentRefCurrent | undefined;
}
interface MockInstancesRef {
  current: MockInstancesRefCurrent | undefined;
}
const mockPlantRef: MockPlantRef = { current: undefined };
const mockRadiusRef: MockRadiusRef = { current: undefined };
const mockTorusRef: MockTorusRef = { current: undefined };
const mockBillboardRef: MockBillboardRef = { current: undefined };
const mockImageRef: MockImageRef = { current: undefined };
const mockXCrosshairRef: MockXCrosshairRef = { current: undefined };
const mockYCrosshairRef: MockYCrosshairRef = { current: undefined };
const mockAlignmentRef: MockAlignmentRef = {
  current: { update: jest.fn() },
};
const mockInstancesRef: MockInstancesRef =
  { current: { geometry: { setAttribute: jest.fn() } } };

import React from "react";
import { useHelper, useTexture } from "@react-three/drei";
import { INITIAL, SurfaceDebugOption } from "../../config";
import {
  Bed, BedFrameMaterial, BedProps, getAxleGeometry, getBracketGeometry,
  getWheelGeometry,
} from "../bed";
import { clone } from "lodash";
import { fireEvent, render } from "@testing-library/react";
import { Path } from "../../../internal_urls";
import { fakeAddPlantProps } from "../../../__test_support__/fake_props";
import { Actions } from "../../../constants";
import { fakeDrawnPoint } from "../../../__test_support__/fake_designer_state";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import {
  fakeImage, fakePoint, fakeSensorReading,
} from "../../../__test_support__/fake_state/resources";
import { SpecialStatus } from "farmbot";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { Mode } from "../../../farm_designer/map/interfaces";
import * as mapUtil from "../../../farm_designer/map/util";
import * as plantActions from "../../plant_actions";
import * as screenSize from "../../../screen_size";
import { ASSETS } from "../../constants";

describe("<Bed />", () => {
  const originalPathname = location.pathname;

  const soilMesh = (container: HTMLElement) => {
    const soil = container.querySelector("mesh[name='soil']");
    if (!soil) { throw new Error("Soil mesh not found"); }
    return soil;
  };

  const actualUseRef = jest.requireActual("react")
    .useRef as typeof React.useRef;
  let getModeSpy: jest.SpyInstance;
  let requestAnimationFrameSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    mockIsMobile = false;
    mockPlantRef.current = undefined;
    mockRadiusRef.current = undefined;
    mockTorusRef.current = undefined;
    mockBillboardRef.current = undefined;
    mockImageRef.current = undefined;
    mockXCrosshairRef.current = undefined;
    mockYCrosshairRef.current = undefined;
    mockAlignmentRef.current = { update: jest.fn() };
    getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
    jest.spyOn(plantActions, "dropPlant3D")
      .mockImplementation(jest.fn());
    jest.spyOn(screenSize, "isMobile")
      .mockImplementation(() => mockIsMobile);
    requestAnimationFrameSpy = jest.spyOn(window, "requestAnimationFrame")
      .mockImplementation(callback => {
        callback(0);
        return 1;
      });
    jest.spyOn(React, "useRef")
      .mockImplementationOnce(() => mockPlantRef)
      .mockImplementationOnce(() => mockRadiusRef)
      .mockImplementationOnce(() => mockTorusRef)
      .mockImplementationOnce(() => mockBillboardRef)
      .mockImplementationOnce(() => mockImageRef)
      .mockImplementationOnce(() => mockXCrosshairRef)
      .mockImplementationOnce(() => mockYCrosshairRef)
      .mockImplementationOnce(() => mockAlignmentRef)
      .mockImplementationOnce(() => mockInstancesRef)
      .mockImplementation(actualUseRef);
  });

  afterEach(() => {
    requestAnimationFrameSpy.mockRestore();
    location.pathname = originalPathname;
  });

  const fakeProps = (): BedProps => ({
    config: clone(INITIAL),
    activeFocus: "",
    mapPoints: [],
    plants: [],
    weeds: [],
    showPlants: true,
    showPoints: true,
    showWeeds: true,
    soilSurfaceGeometry: new BufferGeometry(),
    getZ: () => 0,
    showMoistureMap: true,
    sensors: [],
    sensorReadings: [],
    showMoistureReadings: true,
    activePositionRef: { current: { x: 0, y: 0 } },
  });

  it("renders bed", () => {
    const p = fakeProps();
    p.config.extraLegsX = 0;
    const { container } = render(<Bed {...p} />);
    expect(container).toContainHTML("bed-group");
  });

  it("renders object highlight wrappers", () => {
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const { container } = render(<Bed {...p} />);
    expect(container.querySelector("[name='connectivity-highlight']"))
      .toBeTruthy();
    expect(container.querySelector("[name='soil-surface-highlight']"))
      .toBeTruthy();
  });

  it("renders bed supports with instanced geometry", () => {
    const p = fakeProps();
    p.config.bedZOffset = 100;
    const { container } = render(<Bed {...p} />);
    const supports = container.querySelector("[name='bed-supports']");

    expect(supports).not.toBeNull();
    expect(container.querySelectorAll("instancedmesh[name='bed-leg-wood']").length)
      .toEqual(1);
    expect(container.querySelectorAll("instancedmesh[name='caster-bracket']").length)
      .toEqual(1);
    expect(container.querySelectorAll("instancedmesh[name='wheel']").length)
      .toEqual(1);
    expect(container.querySelectorAll("instancedmesh[name='axle']").length)
      .toEqual(1);
  });

  it("hides bed support casters at zero bed Z offset", () => {
    const p = fakeProps();
    p.config.bedZOffset = 0;
    const { container } = render(<Bed {...p} />);

    expect(container.querySelectorAll("instancedmesh[name='bed-leg-wood']").length)
      .toEqual(1);
    expect(container.querySelectorAll("instancedmesh[name='caster-bracket']").length)
      .toEqual(0);
    expect(container.querySelectorAll("instancedmesh[name='wheel']").length)
      .toEqual(0);
    expect(container.querySelectorAll("instancedmesh[name='axle']").length)
      .toEqual(0);
  });

  it("reuses bed support caster geometries by leg size", () => {
    expect(getBracketGeometry(100)).toBe(getBracketGeometry(100));
    expect(getWheelGeometry(100)).toBe(getWheelGeometry(100));
    expect(getAxleGeometry(100)).toBe(getAxleGeometry(100));
    expect(getBracketGeometry(100)).not.toBe(getBracketGeometry(120));
    expect(getWheelGeometry(100)).not.toBe(getWheelGeometry(120));
    expect(getAxleGeometry(100)).not.toBe(getAxleGeometry(120));
  });

  it("memoizes unchanged bed props", () => {
    const p = fakeProps();
    render(<Bed {...p} />);
    const memoized = Bed as unknown as { $$typeof: symbol };
    expect(memoized.$$typeof.toString()).toContain("react.memo");
  });

  it("skips visible bed rerenders on unrelated config churn", () => {
    (React.useRef as unknown as jest.Mock).mockRestore();
    const p = fakeProps();
    p.config.axes = true;
    p.config.xyDimensions = true;
    p.config.moistureDebug = true;
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(() => false);
    const { rerender } = render(<Bed {...p} />);
    const textureCalls = (useTexture as unknown as jest.Mock).mock.calls.length;
    const helperCalls = (useHelper as unknown as jest.Mock).mock.calls.length;

    rerender(<Bed {...p} config={{
      ...p.config,
      clouds: !p.config.clouds,
      heading: p.config.heading + 45,
      perspective: !p.config.perspective,
      viewpointHeading: p.config.viewpointHeading + 90,
    }} />);

    expect(useTexture).toHaveBeenCalledTimes(textureCalls);
    expect(useHelper).toHaveBeenCalledTimes(helperCalls);
  });

  it("rerenders when visible bed config or resources change", () => {
    (React.useRef as unknown as jest.Mock).mockRestore();
    const p = fakeProps();
    p.config.moistureDebug = true;
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.getConfigValue = jest.fn(() => false);
    const { rerender } = render(<Bed {...p} />);
    const initialHelperCalls =
      (useHelper as unknown as jest.Mock).mock.calls.length;

    const changedConfig = {
      ...p.config,
      bedBrightness: p.config.bedBrightness + 1,
    };
    rerender(<Bed {...p} config={changedConfig} />);
    const configHelperCalls =
      (useHelper as unknown as jest.Mock).mock.calls.length;

    rerender(<Bed {...p}
      config={changedConfig}
      images={[fakeImage()]}
      sensorReadings={[fakeSensorReading()]} />);

    expect(configHelperCalls).toBeGreaterThan(initialHelperCalls);
    expect(useHelper).toHaveBeenCalledTimes(configHelperCalls + 1);
  });

  it("renders bed with extra legs", () => {
    const p = fakeProps();
    p.config.extraLegsX = 2;
    p.config.extraLegsY = 2;
    p.config.legsFlush = false;
    const { container } = render(<Bed {...p} />);
    expect(container).toContainHTML("bed-group");
  });

  it("renders low-detail bed and soil without the soil texture", () => {
    const p = fakeProps();
    p.config.lowDetail = true;
    const { container } = render(<Bed {...p} />);
    expect(container.querySelectorAll("[name='soil']").length).toEqual(1);
    const loadedTextures = (useTexture as unknown as jest.Mock).mock.calls
      .map(([url]) => url);
    expect(loadedTextures).not.toContain(ASSETS.textures.soil + "?=soilT");
    expect(container).toContainHTML("#29231e");
  });

  it("uses a plain bed material in low-detail mode", () => {
    const { container } = render(<BedFrameMaterial
      bedColor={"#abcdef"}
      lowDetail={true} />);
    expect(container).toContainHTML("#ad7039");
    expect(useTexture).not.toHaveBeenCalled();
  });

  it("renders textured bed material", () => {
    render(<BedFrameMaterial bedColor={"#abcdef"} lowDetail={false} />);

    expect(useTexture).toHaveBeenCalledWith(ASSETS.textures.wood);
  });

  it("renders height debug soil material", () => {
    const p = fakeProps();
    p.config.surfaceDebug = SurfaceDebugOption.height;
    const { container } = render(<Bed {...p} />);

    expect(container.querySelector("[name='soil']")).not.toBeNull();
  });

  it("hides cable carrier support rails with the carrier layer", () => {
    const p = fakeProps();
    p.config.cableCarriers = false;
    const { container } = render(<Bed {...p} />);
    expect(container.querySelectorAll("[name='lower-cc-support']").length)
      .toEqual(0);
    expect(container.querySelectorAll("[name='upper-cc-support']").length)
      .toEqual(0);
  });

  it.each<[string, SpecialStatus]>([
    ["doesn't render", SpecialStatus.DIRTY],
    ["renders", SpecialStatus.SAVED],
  ])("%s pointer point", (title, gridPointSpecialStatus) => {
    getModeSpy.mockReturnValue(Mode.createPoint);
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const point0 = fakePoint();
    point0.specialStatus = gridPointSpecialStatus;
    point0.body.meta = { gridId: "123" };
    p.mapPoints = [point0];
    const point = fakeDrawnPoint();
    point.cx = undefined;
    point.cy = undefined;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    const { container } = render(<Bed {...p} />);
    if (title == "renders") {
      expect(container.querySelector("[name='point-drawn-point']"))
        .not.toBeNull();
    } else {
      expect(container.querySelector("[name='point-drawn-point']"))
        .toBeNull();
    }
  });

  it("adds a plant", () => {
    getModeSpy.mockReturnValue(Mode.clickToAdd);
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.click(soil);
    expect(plantActions.dropPlant3D).toHaveBeenCalledWith(expect.objectContaining({
      gardenCoords: { x: 1350, y: 660 },
    }));
  });

  it("doesn't add a drawn point", () => {
    getModeSpy.mockReturnValue(Mode.createPoint);
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps();
    addPlantProps.designer.drawnPoint = undefined;
    p.addPlantProps = addPlantProps;
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.click(soil);
    expect(p.addPlantProps.dispatch).not.toHaveBeenCalled();
  });

  it("adds a drawn point: xy", () => {
    getModeSpy.mockReturnValue(Mode.createPoint);
    location.pathname = Path.mock(Path.points("add"));
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps();
    const point = fakeDrawnPoint();
    point.cx = undefined;
    point.cy = undefined;
    point.r = 0;
    addPlantProps.designer.drawnPoint = point;
    p.addPlantProps = addPlantProps;
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.click(soil);
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...point, cx: 1350, cy: 660, z: 0 },
    });
    expect(p.addPlantProps.dispatch).toHaveBeenCalledTimes(1);
  });

  it("adds a drawn point: radius", () => {
    getModeSpy.mockReturnValue(Mode.createPoint);
    location.pathname = Path.mock(Path.points("add"));
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps();
    const innerDispatch = jest.fn();
    addPlantProps.dispatch = mockDispatch(innerDispatch);
    const point = fakeDrawnPoint();
    point.cx = 10;
    point.cy = 20;
    addPlantProps.designer.drawnPoint = point;
    p.addPlantProps = addPlantProps;
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.click(soil);
    expect(p.addPlantProps.dispatch).toHaveBeenCalled();
    expect((p.addPlantProps.dispatch as jest.Mock).mock.calls[0]?.[0])
      .toBeDefined();
    expect(innerDispatch.mock.calls.length).toBeGreaterThanOrEqual(0);
  });

  it("updates pointer plant position", () => {
    getModeSpy.mockReturnValue(Mode.clickToAdd);
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockXCrosshairRef.current = { position: { set: mockSetXCrosshairPosition } };
    mockYCrosshairRef.current = { position: { set: mockSetYCrosshairPosition } };
    const p = fakeProps();
    p.config.columnLength = 100;
    p.addPlantProps = fakeAddPlantProps();
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.pointerMove(soil);
    expect(mockSetXCrosshairPosition).toHaveBeenCalledWith(0, 0, 0);
    expect(mockSetYCrosshairPosition).toHaveBeenCalledWith(0, 0, 0);
  });

  it("handles missing ref", () => {
    getModeSpy.mockReturnValue(Mode.clickToAdd);
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    mockPlantRef.current = undefined;
    mockXCrosshairRef.current = undefined;
    mockYCrosshairRef.current = undefined;
    mockInstancesRef.current = undefined;
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
  });

  it("handles missing crosshair refs", () => {
    getModeSpy.mockReturnValue(Mode.clickToAdd);
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockXCrosshairRef.current = undefined;
    mockYCrosshairRef.current = undefined;
    const p = fakeProps();
    p.config.columnLength = 100;
    p.addPlantProps = fakeAddPlantProps();
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.pointerMove(soil);
    expect(mockSetXCrosshairPosition).not.toHaveBeenCalled();
    expect(mockSetYCrosshairPosition).not.toHaveBeenCalled();
  });

  it("doesn't update pointer plant position: mobile", () => {
    getModeSpy.mockReturnValue(Mode.clickToAdd);
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = true;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockXCrosshairRef.current = { position: { set: mockSetXCrosshairPosition } };
    mockYCrosshairRef.current = { position: { set: mockSetYCrosshairPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
  });

  it("doesn't update pointer point position", () => {
    getModeSpy.mockReturnValue(Mode.createPoint);
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockXCrosshairRef.current = { position: { set: mockSetXCrosshairPosition } };
    mockYCrosshairRef.current = { position: { set: mockSetYCrosshairPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    p.addPlantProps.designer.drawnPoint = undefined;
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
  });

  it("updates pointer point position", () => {
    getModeSpy.mockReturnValue(Mode.createPoint);
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockXCrosshairRef.current = { position: { set: mockSetXCrosshairPosition } };
    mockYCrosshairRef.current = { position: { set: mockSetYCrosshairPosition } };
    const p = fakeProps();
    p.config.columnLength = 100;
    p.addPlantProps = fakeAddPlantProps();
    const point = fakeDrawnPoint();
    point.cx = undefined;
    point.cy = undefined;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.pointerMove(soil);
    expect(mockSetXCrosshairPosition).toHaveBeenCalledWith(0, 0, 0);
    expect(mockSetYCrosshairPosition).toHaveBeenCalledWith(0, 0, 0);
  });

  it("updates pointer point radius", () => {
    getModeSpy.mockReturnValue(Mode.createPoint);
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockRadiusRef.current = { scale: { set: mockSetRadiusScale } };
    mockTorusRef.current = { scale: { set: mockSetTorusScale } };
    mockBillboardRef.current = { position: { set: mockSetBillboardPosition } };
    mockImageRef.current = { scale: { set: mockSetImageScale } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const point = fakeDrawnPoint();
    point.cx = 1;
    point.cy = 1;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
    expect(mockSetRadiusScale).toHaveBeenCalledWith(1500, 1500, 1500);
    expect(mockSetTorusScale).toHaveBeenCalledWith(1500, 1500, 400);
    expect(mockSetBillboardPosition).toHaveBeenCalledWith(0, 0, 667.5);
    expect(mockSetImageScale).toHaveBeenCalledWith(1335, 1335, 1335);
  });

  it("doesn't update pointer point radius: no ref", () => {
    getModeSpy.mockReturnValue(Mode.createPoint);
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockRadiusRef.current = undefined;
    mockTorusRef.current = undefined;
    mockBillboardRef.current = undefined;
    mockImageRef.current = undefined;
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const point = fakeDrawnPoint();
    point.cx = 1;
    point.cy = 1;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
    expect(mockSetRadiusScale).not.toHaveBeenCalled();
    expect(mockSetTorusScale).not.toHaveBeenCalled();
    expect(mockSetBillboardPosition).not.toHaveBeenCalled();
    expect(mockSetImageScale).not.toHaveBeenCalled();
  });

  it("doesn't update pointer point radius: already set", () => {
    getModeSpy.mockReturnValue(Mode.createPoint);
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockRadiusRef.current = { scale: { set: mockSetRadiusScale } };
    mockTorusRef.current = { scale: { set: mockSetTorusScale } };
    mockBillboardRef.current = { position: { set: mockSetBillboardPosition } };
    mockImageRef.current = { scale: { set: mockSetImageScale } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps();
    const point = fakeDrawnPoint();
    point.cx = 1;
    point.cy = 1;
    point.r = 100;
    p.addPlantProps.designer.drawnPoint = point;
    const { container } = render(<Bed {...p} />);
    const soil = soilMesh(container);
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
    expect(mockSetRadiusScale).not.toHaveBeenCalled();
    expect(mockSetTorusScale).not.toHaveBeenCalled();
    expect(mockSetBillboardPosition).not.toHaveBeenCalled();
    expect(mockSetImageScale).not.toHaveBeenCalled();
  });

  it("mirrors the rendered soil surface geometry", () => {
    const p = fakeProps();
    p.config.mirrorX = true;
    p.config.mirrorY = true;
    p.config.bedLengthOuter = 1000;
    p.config.bedWidthOuter = 800;
    p.config.bedWallThickness = 100;
    p.config.bedXOffset = 50;
    p.config.bedYOffset = 25;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute([
      150, 200, 10,
      300, 400, 20,
    ], 3));
    geometry.setAttribute("normal", new Float32BufferAttribute([
      1, 2, 3,
      4, 5, 6,
    ], 3));
    p.soilSurfaceGeometry = geometry;
    const cloneSpy = jest.spyOn(geometry, "clone");

    render(<Bed {...p} />);

    const mirroredGeometry = cloneSpy.mock.results[0]?.value as BufferGeometry;
    const position = mirroredGeometry.getAttribute("position");
    const normal = mirroredGeometry.getAttribute("normal");
    expect(position.getX(0)).toEqual(750);
    expect(position.getY(0)).toEqual(550);
    expect(position.getX(1)).toEqual(600);
    expect(position.getY(1)).toEqual(350);
    expect(normal.getX(0)).toEqual(-1);
    expect(normal.getY(0)).toEqual(-2);
    expect(normal.getZ(0)).toEqual(3);
    expect(normal.getX(1)).toEqual(-4);
    expect(normal.getY(1)).toEqual(-5);
    expect(normal.getZ(1)).toEqual(6);
  });

  it("reuses mirrored soil geometry on unrelated config churn", () => {
    (React.useRef as unknown as jest.Mock).mockRestore();
    const p = fakeProps();
    p.config.mirrorX = true;
    p.config.mirrorY = false;
    p.config.bedLengthOuter = 1000;
    p.config.bedWidthOuter = 800;
    p.config.bedXOffset = 50;
    p.config.bedYOffset = 25;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute([
      150, 200, 10,
      300, 400, 20,
    ], 3));
    geometry.setAttribute("normal", new Float32BufferAttribute([
      1, 2, 3,
      4, 5, 6,
    ], 3));
    p.soilSurfaceGeometry = geometry;
    const cloneSpy = jest.spyOn(geometry, "clone");

    const { rerender } = render(<Bed {...p} />);
    rerender(<Bed {...p} config={{
      ...p.config,
      heading: p.config.heading + 10,
      label: "unrelated config churn",
    }} />);
    expect(cloneSpy).toHaveBeenCalledTimes(1);
    rerender(<Bed {...p} config={{ ...p.config, mirrorY: true }} />);

    expect(cloneSpy).toHaveBeenCalledTimes(2);
  });
});
