import React from "react";
import { render, renderHook } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { RepeatWrapping, Texture, TextureLoader } from "three";
import {
  WaterFlowTextureProvider,
  WaterStream,
  WaterStreamProps,
  useWaterFlowTexture,
} from "../water_stream";

let frameCallback: (state: unknown, delta: number) => void;
let loadTextureSpy: jest.SpyInstance;
let useFrameSpy: jest.SpyInstance;

describe("<WaterStream />", () => {
  const fakeProps = (): WaterStreamProps => ({
    name: "mock-water-stream",
    args: [],
    waterFlow: true,
    waterTexture: new Texture(),
  });

  beforeEach(() => {
    useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(() => undefined as never);
    loadTextureSpy = jest.spyOn(TextureLoader.prototype, "load")
      .mockImplementation(() => new Texture());
  });

  afterEach(() => {
    loadTextureSpy.mockRestore();
    useFrameSpy.mockRestore();
  });

  it("renders when water is flowing", () => {
    expect(() => render(<WaterStream {...fakeProps()} />)).not.toThrow();
    expect(loadTextureSpy).not.toHaveBeenCalled();
    expect(useFrameSpy).not.toHaveBeenCalled();
  });

  it("renders when water flow is disabled", () => {
    const props = { ...fakeProps(), waterFlow: false };
    expect(() => render(<WaterStream {...props} />)).not.toThrow();
    expect(loadTextureSpy).not.toHaveBeenCalled();
    expect(useFrameSpy).not.toHaveBeenCalled();
  });
});

describe("useWaterFlowTexture", () => {
  beforeEach(() => {
    frameCallback = jest.fn() as
      (state: unknown, delta: number) => void;
    loadTextureSpy = jest.spyOn(TextureLoader.prototype, "load")
      .mockImplementation(() => new Texture());
    useFrameSpy = jest.spyOn(threeFiber, "useFrame").mockImplementation(
      (callback) => {
        frameCallback = callback as (state: unknown, delta: number) => void;
        return undefined as never;
      },
    );
  });

  afterEach(() => {
    loadTextureSpy.mockRestore();
    useFrameSpy.mockRestore();
  });

  it("returns undefined texture when static", () => {
    const { result } = renderHook(() => useWaterFlowTexture(false));
    expect(result.current).toBeUndefined();
    expect(loadTextureSpy).not.toHaveBeenCalled();
    expect(useFrameSpy).toHaveBeenCalled();
  });

  it("offsets texture when flowing", () => {
    const { result } = renderHook(() => useWaterFlowTexture(true));
    expect(result.current).toBeDefined();
    expect(loadTextureSpy).toHaveBeenCalledTimes(1);
    expect(result.current!.wrapS).toEqual(RepeatWrapping);
    expect(result.current!.wrapT).toEqual(RepeatWrapping);
    const initialOffset = result.current!.offset.x;
    const delta = 1;
    frameCallback({}, delta);
    expect(result.current!.offset.x).toBe(initialOffset - delta * 0.05);
  });
});

describe("<WaterFlowTextureProvider />", () => {
  beforeEach(() => {
    loadTextureSpy = jest.spyOn(TextureLoader.prototype, "load")
      .mockImplementation(() => new Texture());
    useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    loadTextureSpy.mockRestore();
    useFrameSpy.mockRestore();
  });

  it("doesn't load a texture while water is off", () => {
    render(<WaterFlowTextureProvider waterFlow={false}>
      <div />
    </WaterFlowTextureProvider>);
    expect(loadTextureSpy).not.toHaveBeenCalled();
    expect(useFrameSpy).toHaveBeenCalledTimes(1);
  });

  it("loads one shared animated texture while water is on", () => {
    render(<WaterFlowTextureProvider waterFlow={true}>
      <div />
    </WaterFlowTextureProvider>);
    expect(loadTextureSpy).toHaveBeenCalledTimes(1);
    expect(useFrameSpy).toHaveBeenCalledTimes(1);
  });
});
