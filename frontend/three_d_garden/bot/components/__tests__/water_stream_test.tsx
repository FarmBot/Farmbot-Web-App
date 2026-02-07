import React from "react";
import { render, renderHook } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { Texture, TextureLoader } from "three";
import {
  WaterStream, WaterStreamProps, useWaterFlowTexture,
} from "../water_stream";

let frameCallback: (state: unknown, delta: number) => void;
let loadTextureSpy: jest.SpyInstance;
let useFrameSpy: jest.SpyInstance;

beforeEach(() => {
  loadTextureSpy = jest.spyOn(TextureLoader.prototype, "load")
    .mockImplementation(() => new Texture());
  useFrameSpy = jest.spyOn(threeFiber, "useFrame").mockImplementation(
    callback => {
      frameCallback = callback as (state: unknown, delta: number) => void;
    });
});

afterEach(() => {
  loadTextureSpy.mockRestore();
  useFrameSpy.mockRestore();
});

describe("<WaterStream />", () => {
  const fakeProps = (): WaterStreamProps => ({
    name: "mock-water-stream",
    args: [],
    waterFlow: false,
  });

  it("renders", () => {
    const wrapper = render(<WaterStream {...fakeProps()} />);
    expect(wrapper.container).toContainHTML("mock-water-stream");
  });
});

describe("useWaterFlowTexture", () => {
  it("returns undefined texture when static", () => {
    const { result } = renderHook(() => useWaterFlowTexture(false));
    expect(result.current).toBeUndefined();
    expect(loadTextureSpy).not.toHaveBeenCalled();
  });

  it("offsets texture when flowing", () => {
    const { result } = renderHook(() => useWaterFlowTexture(true));
    expect(loadTextureSpy).toHaveBeenCalledTimes(1);
    const initialOffset = result.current!.offset.x;
    const delta = 1;
    frameCallback({}, delta);
    expect(result.current!.offset.x).toBe(initialOffset - delta * 0.05);
  });
});
