import React from "react";
import { render, renderHook } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { RepeatWrapping, Texture, TextureLoader } from "three";
import {
  WaterStream, WaterStreamProps, useWaterFlowTexture,
} from "../water_stream";

let frameCallback: (state: unknown, delta: number) => void;
let loadTextureSpy: jest.SpyInstance;
let useFrameSpy: jest.SpyInstance;

describe("<WaterStream />", () => {
  const fakeProps = (): WaterStreamProps => ({
    name: "mock-water-stream",
    args: [],
    waterFlow: true,
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
    expect(loadTextureSpy).toHaveBeenCalledTimes(1);
    expect(useFrameSpy).toHaveBeenCalledTimes(1);
  });

  it("renders when water flow is disabled", () => {
    const props = { ...fakeProps(), waterFlow: false };
    expect(() => render(<WaterStream {...props} />)).not.toThrow();
    expect(loadTextureSpy).not.toHaveBeenCalled();
    expect(useFrameSpy).toHaveBeenCalledTimes(1);
  });
});

describe("useWaterFlowTexture", () => {
  beforeEach(() => {
    frameCallback = jest.fn() as unknown as
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
