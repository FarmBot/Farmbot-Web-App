import React from "react";
import * as THREE from "three";
import { render } from "@testing-library/react";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { CameraView, CameraViewProps } from "../camera_view";

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
});
