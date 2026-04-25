import React from "react";
import { act, render, screen } from "@testing-library/react";
import {
  applyFocusMaterialOpacity,
  applySmoothCameraState,
  cameraTransitionValue,
  createFocusMaterialBinding,
  FOCUS_TRANSITION_MS,
  FocusTransitionProvider,
  FocusVisibilityDiv,
  interpolateCameraState,
  readSmoothCameraState,
  shouldUnmountFocusVisibilityGroup,
} from "../focus_transition";
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";

describe("focus transitions", () => {
  it("keeps exiting DOM content mounted until the fade completes", () => {
    jest.useFakeTimers();
    const { rerender } = render(
      <FocusTransitionProvider enabled={true}>
        <FocusVisibilityDiv visible={true} className={"panel"}>
          panel
        </FocusVisibilityDiv>
      </FocusTransitionProvider>,
    );
    rerender(
      <FocusTransitionProvider enabled={true}>
        <FocusVisibilityDiv visible={false} className={"panel"}>
          panel
        </FocusVisibilityDiv>
      </FocusTransitionProvider>,
    );
    expect(screen.queryByText("panel")).not.toBeNull();
    act(() => {
      jest.advanceTimersByTime(FOCUS_TRANSITION_MS - 1);
    });
    expect(screen.queryByText("panel")).not.toBeNull();
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.queryByText("panel")).toBeNull();
    jest.useRealTimers();
  });

  it("keeps expensive groups mounted when requested", () => {
    expect(shouldUnmountFocusVisibilityGroup(false, false, true))
      .toEqual(false);
    expect(shouldUnmountFocusVisibilityGroup(false, false, false))
      .toEqual(true);
    expect(shouldUnmountFocusVisibilityGroup(false, true, false))
      .toEqual(false);
    expect(shouldUnmountFocusVisibilityGroup(true, false, false))
      .toEqual(false);
  });

  it("isolates material opacity changes and restores originals", () => {
    const root = new Object3D();
    const material = new MeshBasicMaterial({
      opacity: 0.5,
      transparent: false,
      depthWrite: true,
    });
    const mesh = new Mesh(new BoxGeometry(), material);
    root.add(mesh);

    const binding = createFocusMaterialBinding(root);
    const clone = mesh.material;
    expect(clone).not.toBe(material);

    binding.apply(0.25);
    expect(clone.opacity).toEqual(0.125);
    expect(clone.transparent).toEqual(true);
    expect(clone.depthWrite).toEqual(false);

    binding.apply(1);
    expect(clone.opacity).toEqual(0.5);
    expect(clone.transparent).toEqual(false);
    expect(clone.depthWrite).toEqual(true);

    binding.restore();
    expect(mesh.material).toBe(material);
  });

  it("applies material opacity without destroying original material state", () => {
    const material = new MeshBasicMaterial({
      opacity: 0.4,
      transparent: true,
      depthWrite: true,
    });
    applyFocusMaterialOpacity(material, {
      opacity: 0.4,
      transparent: true,
      depthWrite: true,
    }, 0.5);
    expect(material.opacity).toEqual(0.2);
    expect(material.transparent).toEqual(true);
    expect(material.depthWrite).toEqual(false);
  });

  it("can preserve depth writing while fading material opacity", () => {
    const material = new MeshBasicMaterial({
      opacity: 0.4,
      transparent: true,
      depthWrite: true,
    });
    applyFocusMaterialOpacity(material, {
      opacity: 0.4,
      transparent: true,
      depthWrite: true,
    }, 0.5, true);
    expect(material.opacity).toEqual(0.2);
    expect(material.transparent).toEqual(true);
    expect(material.depthWrite).toEqual(true);
  });

  it("keeps final camera coordinates unchanged", () => {
    const fallback = {
      position: [1, 2, 3] as [number, number, number],
      target: [4, 5, 6] as [number, number, number],
      zoom: 1,
    };
    const value = cameraTransitionValue({
      position: [7, 8, 9],
      target: [10, 11, 12],
      zoom: 2,
    }, fallback);
    expect(value).toEqual({
      position: [7, 8, 9],
      target: [10, 11, 12],
      zoom: 2,
    });
  });

  it("interpolates camera state", () => {
    const from = {
      position: [0, 0, 0] as [number, number, number],
      target: [10, 20, 30] as [number, number, number],
      zoom: 1,
    };
    const to = {
      position: [10, 20, 30] as [number, number, number],
      target: [20, 40, 60] as [number, number, number],
      zoom: 3,
    };
    expect(interpolateCameraState(from, to, 0.5)).toEqual({
      position: [5, 10, 15],
      target: [15, 30, 45],
      zoom: 2,
    });
  });

  it("applies camera state to camera and controls objects", () => {
    const camera = {
      position: { set: jest.fn() },
      zoom: 1,
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
    };
    const controls = {
      target: { set: jest.fn() },
      update: jest.fn(),
    };
    applySmoothCameraState({
      position: [1, 2, 3],
      target: [4, 5, 6],
      zoom: 2,
    }, camera, controls);
    expect(camera.position.set).toHaveBeenCalledWith(1, 2, 3);
    expect(camera.zoom).toEqual(2);
    expect(camera.lookAt).toHaveBeenCalledWith(4, 5, 6);
    expect(camera.updateProjectionMatrix).toHaveBeenCalled();
    expect(controls.target.set).toHaveBeenCalledWith(4, 5, 6);
    expect(controls.update).toHaveBeenCalled();
  });

  it("reads live camera and controls state", () => {
    const fallback = {
      position: [1, 2, 3] as [number, number, number],
      target: [4, 5, 6] as [number, number, number],
      zoom: 1,
    };
    const camera = {
      position: { x: 7, y: 8, z: 9, set: jest.fn() },
      zoom: 2,
    };
    const controls = {
      target: { x: 10, y: 11, z: 12, set: jest.fn() },
    };
    expect(readSmoothCameraState(fallback, camera, controls)).toEqual({
      position: [7, 8, 9],
      target: [10, 11, 12],
      zoom: 2,
    });
  });
});
