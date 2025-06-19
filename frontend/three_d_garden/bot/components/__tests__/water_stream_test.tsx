import React from "react";
import { render, renderHook } from "@testing-library/react";
import {
  WaterStream, WaterStreamProps, useWaterFlowTexture,
} from "../water_stream";

let frameCallback: (state: unknown, delta: number) => void;
jest.mock("@react-three/fiber", () => ({
  addEffect: jest.fn(),
  useFrame: jest.fn((callback) => {
    frameCallback = callback;
  }),
}));

describe("<WaterStream />", () => {
  const fakeProps = (): WaterStreamProps => ({
    name: "mock-water-stream",
    args: [],
    waterFlow: true,
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
  });

  it("offsets texture when flowing", () => {
    const { result } = renderHook(() => useWaterFlowTexture(true));
    const initialOffset = result.current!.offset.x;
    const delta = 1;
    frameCallback({}, delta);
    expect(result.current!.offset.x).toBe(initialOffset - delta * 0.05);
  });
});
