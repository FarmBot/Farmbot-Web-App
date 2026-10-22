import React from "react";
import { render } from "@testing-library/react";
import * as fiber from "@react-three/fiber";
import * as drei from "@react-three/drei";
import {
  Box3, BoxGeometry, Group, Mesh, OrthographicCamera, Sphere, Vector3,
} from "three";
import { ToolPreviewCamera } from "../tool_preview_camera";

describe("<ToolPreviewCamera />", () => {
  let camera: OrthographicCamera;
  let container: Group;
  let parent: Group;
  let center: jest.SpyInstance;
  let useThree: jest.SpyInstance;
  const onCentered = jest.fn();
  const invalidate = jest.fn();

  beforeEach(() => {
    onCentered.mockReset();
    invalidate.mockReset();
    camera = new OrthographicCamera(-100, 100, 60, -60, 0.1, 1000);
    camera.position.set(200, 0, 0);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    container = new Group();
    container.add(new Mesh(new BoxGeometry(40, 100, 20)));
    parent = new Group();
    parent.add(container);
    useThree = jest.spyOn(fiber, "useThree")
      .mockImplementation(() => ({ camera, invalidate }));
    center = jest.spyOn(drei, "Center").mockImplementation(() => <div />);
  });

  afterEach(() => {
    center.mockRestore();
    useThree.mockRestore();
  });

  const finishLoading = () => {
    const props = center.mock.calls[center.mock.calls.length - 1][0] as
      React.ComponentProps<typeof drei.Center>;
    container.visible = props.visible ?? true;
    const boundingBox = new Box3().setFromObject(container);
    const size = boundingBox.getSize(new Vector3());
    props.onCentered?.({
      parent,
      container,
      width: size.x,
      height: size.y,
      depth: size.z,
      boundingBox,
      boundingSphere: boundingBox.getBoundingSphere(new Sphere()),
      center: boundingBox.getCenter(new Vector3()),
      verticalAlignment: 0,
      horizontalAlignment: 0,
      depthAlignment: 0,
    });
  };

  const expectInFrame = () => {
    const box = new Box3().setFromObject(container);
    for (const x of [box.min.x, box.max.x]) {
      for (const y of [box.min.y, box.max.y]) {
        for (const z of [box.min.z, box.max.z]) {
          const point = new Vector3(x, y, z).project(camera);
          expect(Math.abs(point.x)).toBeLessThan(1);
          expect(Math.abs(point.y)).toBeLessThan(1);
          expect(Math.abs(point.z)).toBeLessThan(1);
        }
      }
    }
  };

  it("fits and clips the camera before revealing the loaded model", () => {
    render(<ToolPreviewCamera margin={3} onCentered={onCentered}>
      <group />
    </ToolPreviewCamera>);
    expect(center.mock.calls[0][0].visible).toEqual(false);
    expect(invalidate).not.toHaveBeenCalled();
    onCentered.mockImplementation(() => {
      expect(container.visible).toEqual(false);
      expect(camera.zoom).toBeCloseTo(2 / 3);
      expectInFrame();
    });
    invalidate.mockImplementation(() => {
      expect(container.visible).toEqual(true);
      expect(camera.zoom).toBeCloseTo(2 / 3);
      expect(onCentered).toHaveBeenCalledTimes(1);
    });
    finishLoading();
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(camera.getWorldDirection(new Vector3()).x).toBeCloseTo(-1);
  });

  it("refits a changed model and viewport before drawing again", () => {
    const { rerender } = render(<ToolPreviewCamera
      margin={3} onCentered={onCentered}><group /></ToolPreviewCamera>);
    finishLoading();
    expect(camera.zoom).toBeCloseTo(2 / 3);
    container.scale.y = 2;
    rerender(<ToolPreviewCamera margin={3} onCentered={onCentered}>
      <group />
    </ToolPreviewCamera>);
    finishLoading();
    expect(camera.zoom).toBeCloseTo(1 / 3);
    expectInFrame();
    camera.left = -200;
    camera.right = 200;
    rerender(<ToolPreviewCamera margin={3} onCentered={onCentered}>
      <group />
    </ToolPreviewCamera>);
    finishLoading();
    expect(camera.zoom).toBeCloseTo(2 / 3);
    expect(invalidate).toHaveBeenCalledTimes(3);
    expectInFrame();
  });

  it("preserves the viewing direction when refitting after orbiting", () => {
    render(<ToolPreviewCamera margin={1.2} onCentered={onCentered}>
      <group />
    </ToolPreviewCamera>);
    camera.position.set(200, 100, 50);
    camera.lookAt(0, 0, 0);
    const direction = camera.getWorldDirection(new Vector3());
    finishLoading();
    expect(camera.getWorldDirection(new Vector3()).distanceTo(direction))
      .toBeLessThan(0.000001);
    expectInFrame();
  });

  it("handles an empty slot without invalid camera values", () => {
    container.clear();
    render(<ToolPreviewCamera margin={1.2} onCentered={onCentered}>
      <group />
    </ToolPreviewCamera>);
    finishLoading();
    expect(camera.zoom).toEqual(1);
    expect(container.visible).toEqual(true);
    expect(invalidate).toHaveBeenCalledTimes(1);
  });
});
