import { renderHook } from "@testing-library/react";
import { useWaterFlowTexture } from "../water_flow_texture";
import { RepeatWrapping } from "three";

jest.mock("@react-three/fiber", () => ({
  useFrame: jest.fn(callback => callback({}, 0.1)), // Simulate some time passing
}));

jest.mock("three", () => ({
  ...jest.requireActual("three"),
  TextureLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(() => ({
      wrapS: undefined,
      wrapT: undefined,
      offset: { x: 0 },
    })),
  })),
  RepeatWrapping: "RepeatWrapping",
}));

describe("useWaterFlowTexture", () => {
  it("initializes texture with repeat wrapping", () => {
    const { result } = renderHook(() => useWaterFlowTexture(false));
    expect(result.current.wrapS).toBe(RepeatWrapping);
    expect(result.current.wrapT).toBe(RepeatWrapping);
  });

  it("does not update texture offset when waterFlow is false", () => {
    const { result } = renderHook(() => useWaterFlowTexture(false));
    expect(result.current.offset.x).toBe(0);
  });

  it("updates texture offset when waterFlow is true", () => {
    const { result } = renderHook(() => useWaterFlowTexture(true));
    expect(result.current.offset.x).toBeLessThan(0);
  });
});