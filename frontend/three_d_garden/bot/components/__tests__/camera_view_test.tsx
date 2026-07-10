import React from "react";
import * as reactSpring from "@react-spring/three";
import * as THREE from "three";
import { render, waitFor } from "@testing-library/react";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import {
  CameraView, cameraViewPropsEqual, CameraViewProps, getCameraViewPoints,
} from "../camera_view";
import { ConvexGeometry } from "three-stdlib";

describe("<CameraView />", () => {
  const fakeProps = (): CameraViewProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    distanceToSoil: 500,
    cameraMountPosition: new THREE.Vector3(100, 200, 300),
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.cameraView = true;
    const { container } = render(<CameraView {...p} />);
    expect(container).toContainHTML("camera-view");
  });

  it("doesn't render", () => {
    const p = fakeProps();
    p.config.cameraView = false;
    const { container } = render(<CameraView {...p} />);
    expect(container).not.toContainHTML("camera-view");
  });

  it("renders capture animation", () => {
    const p = fakeProps();
    p.config.cameraView = true;
    p.config.lastImageCapture = 123;
    const { container } = render(<CameraView {...p} />);
    expect(container).toContainHTML("camera-view");
  });

  it("runs capture opacity pulse", async () => {
    const next = jest.fn(() => Promise.resolve());
    const start = jest.fn((config: { to(callback: typeof next): Promise<void> }) =>
      config.to(next));
    jest.spyOn(reactSpring, "useSpring")
      .mockImplementationOnce(() => [
        { opacity: 0.25 },
        { start },
      ] as never);
    const p = fakeProps();
    p.config.cameraView = true;
    p.config.lastImageCapture = 123;

    render(<CameraView {...p} />);

    await waitFor(() => expect(next).toHaveBeenCalledTimes(2));
    expect(next).toHaveBeenNthCalledWith(1, {
      opacity: 0.9,
      immediate: true,
    });
    expect(next).toHaveBeenNthCalledWith(2, expect.objectContaining({
      opacity: 0.25,
      delay: 0,
    }));
  });

  it("computes camera view points from props", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    p.config.imgCenterX = 100;
    p.config.imgCenterY = 50;
    p.config.imgScale = 1;

    const result = getCameraViewPoints(p);

    expect(result.cameraLensPosition.x).toBeCloseTo(p.cameraMountPosition.x);
    expect(result.cameraLensPosition.y).toBeGreaterThan(
      p.cameraMountPosition.y);
    expect(result.points.length).toEqual(8);
  });

  it("reuses unchanged frustum geometry and rebuilds when inputs change", () => {
    const normalsSpy = jest.spyOn(
      ConvexGeometry.prototype,
      "computeVertexNormals",
    );
    const p = fakeProps();
    p.config.cameraView = true;
    const { rerender } = render(<CameraView {...p} />);
    rerender(<CameraView {...p} />);
    expect(normalsSpy).toHaveBeenCalledTimes(1);
    rerender(<CameraView {...p}
      cameraMountPosition={new THREE.Vector3(101, 200, 300)} />);
    expect(normalsSpy).toHaveBeenCalledTimes(2);
    normalsSpy.mockRestore();
  });

  it("compares camera-view-relevant inputs", () => {
    const p = fakeProps();
    p.config.cameraView = true;
    expect(cameraViewPropsEqual(p, {
      ...p,
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(cameraViewPropsEqual(p, {
      ...p,
      config: { ...p.config, imgScale: p.config.imgScale + 1 },
    })).toBeFalsy();
    expect(cameraViewPropsEqual(p, {
      ...p,
      cameraMountPosition: new THREE.Vector3(101, 200, 300),
    })).toBeFalsy();
    expect(cameraViewPropsEqual(p, {
      ...p,
      config: { ...p.config, lastImageCapture: p.config.lastImageCapture + 1 },
    })).toBeFalsy();
  });
});
