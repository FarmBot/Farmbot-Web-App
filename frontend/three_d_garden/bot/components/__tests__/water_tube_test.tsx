import React from "react";
import { render, renderHook } from "@testing-library/react";
import { WaterTube, useWaterFlowTexture } from "../water_tube";

let frameCallback: (state: unknown, delta: number) => void;
jest.mock("@react-three/fiber", () => ({
  useFrame: jest.fn((callback) => {
    frameCallback = callback;
  }),
}));

describe("<WaterTube />", () => {
  it("renders static", () => {
    const wrapper = render(<WaterTube
      name="mock-tube"
      args={[]}
      waterFlow={false} />);
    const material = wrapper.container.querySelector("meshphongmaterial");
    expect(material).not.toHaveAttribute("map");
    expect(material).toHaveAttribute("opacity", "0.5");
  });

  it("renders flowing", () => {
    const wrapper = render(<WaterTube
      name="mock-tube"
      args={[]}
      waterFlow={true} />);
    const material = wrapper.container.querySelector("meshphongmaterial");
    expect(material).toHaveAttribute("map");
    expect(material).toHaveAttribute("opacity", "0.75");
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
    expect(result.current!.offset.x).toBe(initialOffset - delta * 0.25);
  });
});
