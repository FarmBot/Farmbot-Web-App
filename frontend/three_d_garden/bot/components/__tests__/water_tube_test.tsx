import React from "react";
import { render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { Texture, TextureLoader } from "three";
import { WaterTube, WaterTubeProps } from "../water_tube";
import { easyCubicBezierCurve3 } from "../../../helpers";

describe("<WaterTube />", () => {
  let loadTextureSpy: jest.SpyInstance;
  let useFrameSpy: jest.SpyInstance;

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

  const fakeProps = (): WaterTubeProps => ({
    tubeName: "mock-tube",
    tubePath: easyCubicBezierCurve3([0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]),
    tubularSegments: 1,
    radius: 1,
    radialSegments: 1,
    waterFlow: false,
  });

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<WaterTube {...p} />);
    expect(container.innerHTML).toContain("mock-tube-tube");
    expect(container.innerHTML).not.toContain("mock-tube-water-stream");
    expect(loadTextureSpy).not.toHaveBeenCalled();
    expect(useFrameSpy).not.toHaveBeenCalled();
  });

  it("renders water stream while water is flowing", () => {
    const p = fakeProps();
    p.waterFlow = true;
    const { container } = render(<WaterTube {...p} />);
    expect(container.innerHTML).toContain("mock-tube-water-stream");
    expect(loadTextureSpy).toHaveBeenCalledTimes(1);
    expect(useFrameSpy).toHaveBeenCalledTimes(1);
  });
});
