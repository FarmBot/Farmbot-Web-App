import React from "react";
import * as reactSpring from "@react-spring/three";
import * as THREE from "three";
import { act, render, waitFor } from "@testing-library/react";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import {
  CameraView, cameraViewPropsEqual, CameraViewProps, getCameraViewPoints,
} from "../camera_view";
import {
  createRenderer, unmountRenderer,
} from "../../../../__test_support__/test_renderer";

describe("<CameraView />", () => {
  const fakeProps = (): CameraViewProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    distanceToSoil: 500,
    cameraMountPosition: new THREE.Vector3(100, 200, 300),
    getZ: jest.fn(() => 0),
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.cameraView = true;
    const { container } = render(<CameraView {...p} />);
    expect(container).toContainHTML("camera-view");
    const wrapper = createRenderer(<CameraView {...p} />);
    const cameraView = wrapper.root.findAll(node =>
      node.props.name == "camera-view")[0];
    expect(cameraView.props.userData).toBeUndefined();
    unmountRenderer(wrapper);
  });

  it("doesn't render", () => {
    const p = fakeProps();
    p.config.cameraView = false;
    const { container } = render(<CameraView {...p} />);
    expect(container).not.toContainHTML("camera-view");
  });

  it("renders capture animation", () => {
    const p = fakeProps();
    p.config.lastImageCapture = 123;
    const { container } = render(<CameraView {...p} />);
    expect(container).toContainHTML("camera-view");
  });

  it("renders camera operation animations", () => {
    const p = fakeProps();
    p.config.cameraOperation = "calibration";
    p.config.lastCameraOperation = 123;
    const wrapper = createRenderer(<CameraView {...p} />);
    expect(wrapper.root.findByProps({ name: "camera-operation-animation" }))
      .toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("shows the uncropped view outline when requested", () => {
    const p = fakeProps();
    p.config.cameraView = true;
    p.config.cropImages = true;
    p.config.showUncroppedCameraView = true;
    p.config.imgRotation = 20;
    const wrapper = createRenderer(<CameraView {...p} />);
    expect(wrapper.root.findByProps({ name: "uncropped-camera-view" }))
      .toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("runs capture opacity pulse", async () => {
    const next = jest.fn(() => Promise.resolve());
    const start = jest.fn((config: { to(callback: typeof next): Promise<void> }) =>
      config.to(next));
    jest.spyOn(reactSpring, "useSpring")
      .mockImplementationOnce(() =>
        [
          { opacity: 0.25 },
          { start },
        ] as never);
    const p = fakeProps();
    p.config.lastImageCapture = 123;

    render(<CameraView {...p} />);

    await waitFor(() => expect(next).toHaveBeenCalledTimes(2));
    expect(next).toHaveBeenNthCalledWith(1, {
      opacity: 0.9,
      immediate: true,
    });
    expect(next).toHaveBeenNthCalledWith(2, expect.objectContaining({
      opacity: 0,
      delay: 0,
    }));
  });

  it("hides an operation after its display window", () => {
    jest.useFakeTimers();
    const start = jest.fn();
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(() => [
        { opacity: 0.25 },
        { start },
      ] as never);
    const p = fakeProps();
    p.config.cameraOperation = "weeds";
    p.config.lastCameraOperation = 123;

    render(<CameraView {...p} />);
    act(() => {
      jest.advanceTimersByTime(p.config.cameraOperationDurationMs);
    });

    expect(start).toHaveBeenCalledWith({ opacity: 0, immediate: true });
    springSpy.mockRestore();
    jest.useRealTimers();
  });

  it("updates opacity when the camera view is toggled off", () => {
    jest.useFakeTimers();
    const start = jest.fn();
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(() => [
        { opacity: 0.25 },
        { start },
      ] as never);
    const p = fakeProps();
    p.config.cameraView = true;
    p.config.cameraOperation = "weeds";
    p.config.lastCameraOperation = 123;
    const { rerender } = render(<CameraView {...p} />);
    act(() => {
      jest.advanceTimersByTime(p.config.cameraOperationDurationMs);
    });

    rerender(<CameraView {...p} config={{
      ...p.config,
      cameraView: false,
    }} />);

    expect(start).toHaveBeenCalledWith({ opacity: 0, immediate: true });
    springSpy.mockRestore();
    jest.useRealTimers();
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

  it("moves the frustum without rebuilding unchanged local geometry", () => {
    const normalsSpy = jest.spyOn(
      THREE.BufferGeometry.prototype,
      "computeVertexNormals",
    );
    const p = fakeProps();
    p.config.cameraView = true;
    const { rerender } = render(<CameraView {...p} />);
    rerender(<CameraView {...p} />);
    expect(normalsSpy).toHaveBeenCalledTimes(1);
    rerender(<CameraView {...p}
      cameraMountPosition={new THREE.Vector3(101, 200, 300)} />);
    expect(normalsSpy).toHaveBeenCalledTimes(1);
    rerender(<CameraView {...p}
      cameraMountPosition={new THREE.Vector3(101, 200, 300)}
      distanceToSoil={p.distanceToSoil + 1} />);
    expect(normalsSpy).toHaveBeenCalledTimes(2);
    normalsSpy.mockRestore();
  });

  it("accepts camera configuration after an incomplete initial layout", () => {
    const p = fakeProps();
    p.config.cameraView = true;
    p.distanceToSoil = 0;
    const { rerender } = render(<CameraView {...p} />);

    expect(() => rerender(<CameraView
      {...p}
      distanceToSoil={500} />)).not.toThrow();
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
    expect(cameraViewPropsEqual(p, {
      ...p,
      getZ: () => 1,
    })).toBeFalsy();
    expect(cameraViewPropsEqual(p, {
      ...p,
      config: { ...p.config, cameraOperation: "weeds" },
    })).toBeFalsy();
    expect(cameraViewPropsEqual(p, {
      ...p,
      config: { ...p.config, lastCameraOperation: 123 },
    })).toBeFalsy();
    expect(cameraViewPropsEqual(p, {
      ...p,
      config: { ...p.config, animate: !p.config.animate },
    })).toBeFalsy();
    expect(cameraViewPropsEqual(p, {
      ...p,
      config: { ...p.config, cropImages: !p.config.cropImages },
    })).toBeFalsy();
    expect(cameraViewPropsEqual(p, {
      ...p,
      config: {
        ...p.config,
        showUncroppedCameraView: !p.config.showUncroppedCameraView,
      },
    })).toBeFalsy();
  });
});
