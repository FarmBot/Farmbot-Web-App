let mockIsMobile = false;
import React from "react";
import { useTexture } from "@react-three/drei";
import {
  ActivePositionRef,
  BillboardRef,
  ImageRef,
  PointerObjects, PointerObjectsProps,
  PointerPlantRef,
  RadiusRef,
  soilClick, SoilClickProps,
  soilPointerMove, SoilPointerMoveProps,
  TorusRef,
  XCrosshairRef,
  YCrosshairRef,
} from "../pointer_objects";
import { render } from "@testing-library/react";
import { INITIAL } from "../../../config";
import { fakeAddPlantProps } from "../../../../__test_support__/fake_props";
import { clone } from "lodash";
import { Path } from "../../../../internal_urls";
import { Vector3 } from "three";
import { ThreeEvent } from "@react-three/fiber";
import * as plantActions from "../../../../farm_designer/map/layers/plants/plant_actions";
import * as screenSize from "../../../../screen_size";
import { PLANT_ICON_ATLAS } from "../../../garden/plant_icon_atlas";

let dropPlantSpy: jest.SpyInstance;
let isMobileSpy: jest.SpyInstance;
let requestAnimationFrameSpy: jest.SpyInstance;
type AnimationFrameHandler = Parameters<typeof window.requestAnimationFrame>[0];

beforeEach(() => {
  mockIsMobile = false;
  dropPlantSpy = jest.spyOn(plantActions, "dropPlant").mockImplementation(jest.fn());
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
  isMobileSpy.mockRestore();
  requestAnimationFrameSpy.mockRestore();
  delete PLANT_ICON_ATLAS["/crops/icons/mint.avif"];
});

describe("<PointerObjects />", () => {
  const fakeProps = (): PointerObjectsProps => ({
    config: clone(INITIAL),
    mapPoints: [],
    addPlantProps: fakeAddPlantProps(),
    pointerPlantRef: { current: { position: new Vector3(0, 0, 0) } } as PointerPlantRef,
    radiusRef: { current: { scale: new Vector3(0, 0, 0) } } as RadiusRef,
    torusRef: { current: { scale: new Vector3(0, 0, 0) } } as TorusRef,
    billboardRef: { current: { position: new Vector3(0, 0, 0) } } as BillboardRef,
    imageRef: { current: { scale: new Vector3(0, 0, 0) } } as ImageRef,
    xCrosshairRef: { current: { position: new Vector3(0, 0, 0) } } as XCrosshairRef,
    yCrosshairRef: { current: { position: new Vector3(0, 0, 0) } } as YCrosshairRef,
    activePositionRef: { current: { x: 0, y: 0 } } as ActivePositionRef,
  });

  it("renders", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const { container } = render(<PointerObjects {...fakeProps()} />);
    expect(container).toContainHTML("pointerPlant");
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
      gardenCoords: { x: 1360, y: 660 },
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
      gardenCoords: { x: 1360, y: 660 },
    }));
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
    activePositionRef: { current: { x: 0, y: 0 } } as ActivePositionRef,
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
  });
});
