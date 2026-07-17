import React from "react";
import * as reactSpring from "@react-spring/three";
import TestRenderer from "react-test-renderer";
import { act, render, screen } from "@testing-library/react";
import {
  applyFocusMaterialOpacity,
  applySmoothCameraState,
  cameraTransitionValue,
  createFocusMaterialBinding,
  cssEase,
  easeInOutCubic,
  FOCUS_TRANSITION_MS,
  FocusTransitionProvider,
  FocusVisibilityDiv,
  FocusVisibilityGroup,
  interpolateCameraState,
  interpolateLinearCameraState,
  interpolateZUpSphericalDirection,
  readSmoothCameraState,
  shouldUnmountFocusVisibilityGroup,
  SmoothCameraState,
  useSmoothCamera,
} from "../focus_transition";
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";

const originalUseSpring = reactSpring.useSpring;

describe("focus transitions", () => {
  it("eases opacity symmetrically", () => {
    expect(easeInOutCubic(0)).toEqual(0);
    expect(easeInOutCubic(0.25)).toEqual(0.0625);
    expect(easeInOutCubic(0.75)).toEqual(0.9375);
    expect(easeInOutCubic(1)).toEqual(1);
  });

  it("matches the CSS ease timing function", () => {
    expect(cssEase(-1)).toEqual(0);
    expect(cssEase(0.25)).toBeCloseTo(0.4085106);
    expect(cssEase(0.5)).toBeCloseTo(0.8024034);
    expect(cssEase(0.75)).toBeCloseTo(0.960459);
    expect(cssEase(2)).toEqual(1);
  });

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

  it("updates DOM visibility classes across animation frames", () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    const frames: FrameRequestCallback[] = [];
    window.requestAnimationFrame = jest.fn(callback => {
      frames.push(callback);
      return frames.length;
    });
    window.cancelAnimationFrame = jest.fn();

    try {
      const { rerender } = render(
        <FocusTransitionProvider enabled={true}>
          <FocusVisibilityDiv visible={true} className={"panel"}>
            panel
          </FocusVisibilityDiv>
        </FocusTransitionProvider>,
      );
      act(() => frames.shift()?.(1));
      act(() => frames.shift()?.(2));
      expect(screen.getByText("panel").className)
        .toContain("focus-transition-visible");

      rerender(
        <FocusTransitionProvider enabled={true}>
          <FocusVisibilityDiv visible={false} className={"panel"}>
            panel
          </FocusVisibilityDiv>
        </FocusTransitionProvider>,
      );
      act(() => frames.shift()?.(3));
      expect(screen.getByText("panel").className)
        .toContain("focus-transition-hidden");
    } finally {
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;
    }
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

  it("skips group spring setup when transitions are disabled", () => {
    const useSpringSpy = jest.spyOn(reactSpring, "useSpring");
    render(<FocusVisibilityGroup visible={false}>
      <div>hidden</div>
    </FocusVisibilityGroup>);
    expect(useSpringSpy).not.toHaveBeenCalled();
  });

  it("uses group spring setup when transitions are enabled", () => {
    const useSpringSpy = jest.spyOn(reactSpring, "useSpring");
    const { container } = render(
      <FocusTransitionProvider enabled={true}>
        <FocusVisibilityGroup visible={true}>
          <div>shown</div>
        </FocusVisibilityGroup>
      </FocusTransitionProvider>,
    );
    expect(container.innerHTML).toContain("shown");
    expect(useSpringSpy).toHaveBeenCalled();
  });

  it("unmounts initially hidden groups when transitions are enabled", () => {
    const { container } = render(
      <FocusTransitionProvider enabled={true}>
        <FocusVisibilityGroup visible={false}>
          <div>hidden</div>
        </FocusVisibilityGroup>
      </FocusTransitionProvider>,
    );
    expect(container.innerHTML).not.toContain("hidden");
  });

  it("runs transitioned group spring callbacks", () => {
    let springProps: {
      onChange(result: { value: { opacity?: number } }): void;
      onRest(): void;
    } | undefined;
    const callbackRef = jest.fn();
    const objectRef = React.createRef<Object3D>();
    const material = new MeshBasicMaterial({ opacity: 0.5 });
    const root = new Object3D();
    root.add(new Mesh(new BoxGeometry(), material));
    const springImpl = (props: unknown) => {
      springProps = props as typeof springProps;
      return {} as never;
    };
    const useSpringSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(springImpl);
    let view: TestRenderer.ReactTestRenderer | undefined;

    TestRenderer.act(() => {
      view = TestRenderer.create(
        <FocusTransitionProvider enabled={true}>
          <FocusVisibilityGroup
            visible={true}
            materialBindingKey={"a"}
            ref={callbackRef}>
            <div>shown</div>
          </FocusVisibilityGroup>
          <FocusVisibilityGroup visible={true} ref={objectRef}>
            <div>also shown</div>
          </FocusVisibilityGroup>
        </FocusTransitionProvider>,
        { createNodeMock: node => node.type == "group" ? root : {} },
      );
    });
    TestRenderer.act(() =>
      springProps?.onChange({ value: { opacity: 0.5 } }));
    TestRenderer.act(() => {
      view?.update(
        <FocusTransitionProvider enabled={true}>
          <FocusVisibilityGroup
            visible={false}
            materialBindingKey={"b"}
            ref={callbackRef}>
            <div>shown</div>
          </FocusVisibilityGroup>
          <FocusVisibilityGroup visible={true} ref={objectRef}>
            <div>also shown</div>
          </FocusVisibilityGroup>
        </FocusTransitionProvider>,
      );
    });
    TestRenderer.act(() => springProps?.onRest());

    expect(useSpringSpy).toHaveBeenCalled();
    expect(callbackRef).toHaveBeenCalledWith(root);
    expect(objectRef.current).toBe(root);
    TestRenderer.act(() => view?.unmount());
    useSpringSpy.mockImplementation(originalUseSpring as never);
  });

  it("keeps hidden transitioned groups mounted when requested", () => {
    let springProps: { onRest(): void } | undefined;
    const useSpringSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(props => {
        springProps = props as typeof springProps;
        return {} as never;
      });
    render(
      <FocusTransitionProvider enabled={true}>
        <FocusVisibilityGroup visible={false} keepMounted={true}>
          <div>hidden</div>
        </FocusVisibilityGroup>
      </FocusTransitionProvider>,
    );

    act(() => springProps?.onRest());

    expect(useSpringSpy).toHaveBeenCalled();
    useSpringSpy.mockImplementation(originalUseSpring as never);
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

  it("isolates array material opacity changes", () => {
    const root = new Object3D();
    const firstMaterial = new MeshBasicMaterial({ opacity: 0.4 });
    const secondMaterial = new MeshBasicMaterial({ opacity: 0.8 });
    const mesh = new Mesh(new BoxGeometry(), [firstMaterial, secondMaterial]);
    root.add(mesh);

    const binding = createFocusMaterialBinding(root);
    const [firstClone, secondClone] = mesh.material;
    expect(firstClone).not.toBe(firstMaterial);
    expect(secondClone).not.toBe(secondMaterial);

    binding.apply(0.5);
    expect(firstClone.opacity).toEqual(0.2);
    expect(secondClone.opacity).toEqual(0.4);

    binding.restore();
    expect(mesh.material).toEqual([firstMaterial, secondMaterial]);
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
      fov: 20,
    };
    const value = cameraTransitionValue({
      position: [7, 8, 9],
      target: [10, 11, 12],
      zoom: 2,
      fov: 40,
    }, fallback);
    expect(value).toEqual({
      position: [7, 8, 9],
      target: [10, 11, 12],
      zoom: 2,
      fov: 40,
    });
  });

  it("interpolates camera state", () => {
    const from = {
      position: [0, 0, 0] as [number, number, number],
      target: [10, 20, 30] as [number, number, number],
      zoom: 1,
      fov: 40,
    };
    const to = {
      position: [10, 20, 30] as [number, number, number],
      target: [20, 40, 60] as [number, number, number],
      zoom: 3,
      fov: 40,
    };
    const result = interpolateCameraState(from, to, 0.5);
    expect(result.position[0]).toBeCloseTo(5);
    expect(result.position[1]).toBeCloseTo(10);
    expect(result.position[2]).toBeCloseTo(15);
    expect(result).toMatchObject({
      target: [15, 30, 45],
      zoom: 2,
      fov: 40,
    });
  });

  it("linearly interpolates camera position and clamps overshoot", () => {
    const from = {
      position: [0, 10, 20] as [number, number, number],
      target: [30, 40, 50] as [number, number, number],
      zoom: 1,
      fov: 60,
    };
    const to = {
      position: [100, 110, 120] as [number, number, number],
      target: [130, 140, 150] as [number, number, number],
      zoom: 3,
      fov: 20,
    };

    expect(interpolateLinearCameraState(from, to, 0.5)).toEqual({
      position: [50, 60, 70],
      target: [80, 90, 100],
      zoom: 2,
      fov: 40,
    });
    expect(interpolateLinearCameraState(from, to, 1.1)).toEqual(to);
    expect(interpolateLinearCameraState(from, to, -0.1)).toEqual(from);
  });

  it("preserves apparent scale during FOV interpolation", () => {
    const referenceScale = 1000 * Math.tan(40 * Math.PI / 360);
    const narrowDistance = referenceScale / Math.tan(Math.PI / 360);
    const result = interpolateCameraState({
      position: [1000, 0, 0],
      target: [0, 0, 0],
      zoom: 1,
      fov: 40,
    }, {
      position: [narrowDistance, 0, 0],
      target: [0, 0, 0],
      zoom: 1,
      fov: 1,
    }, 0.5);
    const distance = Math.hypot(...result.position);
    expect(distance * Math.tan(result.fov * Math.PI / 360))
      .toBeCloseTo(referenceScale);
  });

  it("lands exactly on the requested camera state", () => {
    const destination = {
      position: [250, 500, 750] as [number, number, number],
      target: [10, 20, 30] as [number, number, number],
      zoom: 2,
      fov: 90,
    };
    const result = interpolateCameraState({
      position: [1000, 0, 0],
      target: [0, 0, 0],
      zoom: 1,
      fov: 40,
    }, destination, 1);
    expect(result.position[0]).toBeCloseTo(destination.position[0]);
    expect(result.position[1]).toBeCloseTo(destination.position[1]);
    expect(result.position[2]).toBeCloseTo(destination.position[2]);
    expect(result.target).toEqual(destination.target);
    expect(result.zoom).toEqual(destination.zoom);
    expect(result.fov).toEqual(destination.fov);
  });

  it.each([
    [[1, 0, 0], [-1, 0, 0]],
    [[0, 0, 1], [0, 0, -1]],
  ] as const)("spherically interpolates opposite directions", (start, end) => {
    const result = interpolateCameraState({
      position: [...start], target: [0, 0, 0], zoom: 1, fov: 40,
    }, {
      position: [...end], target: [0, 0, 0], zoom: 1, fov: 40,
    }, 0.5);
    expect(Math.hypot(...result.position)).toBeCloseTo(1);
  });

  it("spherically interpolates ordinary direction changes", () => {
    const result = interpolateCameraState({
      position: [1, 0, 0], target: [0, 0, 0], zoom: 1, fov: 40,
    }, {
      position: [0, 1, 0], target: [0, 0, 0], zoom: 1, fov: 40,
    }, 0.5);
    expect(result.position[0]).toBeCloseTo(Math.SQRT1_2);
    expect(result.position[1]).toBeCloseTo(Math.SQRT1_2);
  });

  it("interpolates TOP heading and elevation at the same rate", () => {
    const fromAzimuth = Math.PI / 4;
    const fromPolar = Math.PI / 3;
    const from: [number, number, number] = [
      Math.sin(fromPolar) * Math.sin(fromAzimuth),
      -Math.sin(fromPolar) * Math.cos(fromAzimuth),
      Math.cos(fromPolar),
    ];
    const to: [number, number, number] = [1 / 5000, 0, 1];
    const toLength = Math.hypot(...to);
    const normalizedTo = to.map(value => value / toLength) as typeof to;
    const midpoint = interpolateZUpSphericalDirection(
      from,
      normalizedTo,
      0.5,
    );
    const midpointAzimuth = Math.atan2(midpoint[0], -midpoint[1]);
    const midpointPolar = Math.acos(midpoint[2]);
    expect(midpointAzimuth).toBeCloseTo(3 * Math.PI / 8);
    expect(midpointPolar).toBeCloseTo(
      (fromPolar + Math.acos(normalizedTo[2])) / 2,
    );
    const camera = interpolateCameraState({
      position: from,
      target: [0, 0, 0],
      zoom: 1,
      fov: 40,
    }, {
      position: normalizedTo,
      target: [0, 0, 0],
      zoom: 1,
      fov: 40,
    }, 0.5);
    expect(Math.atan2(camera.position[0], -camera.position[1]))
      .toBeCloseTo(midpointAzimuth);
  });

  it("takes the shortest TOP heading path and clamps spring overshoot", () => {
    const polar = Math.PI / 4;
    const direction = (azimuth: number): [number, number, number] => [
      Math.sin(polar) * Math.sin(azimuth),
      -Math.sin(polar) * Math.cos(azimuth),
      Math.cos(polar),
    ];
    const from = direction(-170 * Math.PI / 180);
    const to = [0, 1 / 5000, 1] as [number, number, number];
    const toLength = Math.hypot(...to);
    const normalizedTo = to.map(value => value / toLength) as typeof to;
    const midpoint = interpolateZUpSphericalDirection(
      from,
      normalizedTo,
      0.5,
    );
    expect(Math.atan2(midpoint[0], -midpoint[1]) * 180 / Math.PI)
      .toBeCloseTo(-175);
    expect(interpolateZUpSphericalDirection(from, normalizedTo, 1.1))
      .toEqual(interpolateZUpSphericalDirection(from, normalizedTo, 1));
    expect(interpolateZUpSphericalDirection(from, normalizedTo, -0.1))
      .toEqual(interpolateZUpSphericalDirection(from, normalizedTo, 0));
  });

  it("preserves heading for an exactly vertical TOP target", () => {
    const from: [number, number, number] = [1, 0, 0];
    const midpoint = interpolateZUpSphericalDirection(
      from,
      [0, 0, 1],
      0.5,
    );
    expect(Math.atan2(midpoint[0], -midpoint[1])).toBeCloseTo(Math.PI / 2);
  });

  it("smoothly changes heading when leaving TOP for a corner", () => {
    const from = [0, -1 / 5000, 1] as [number, number, number];
    const fromLength = Math.hypot(...from);
    const normalizedFrom = from.map(value =>
      value / fromLength) as typeof from;
    const to = [1, -1, 1] as [number, number, number];
    const toLength = Math.hypot(...to);
    const normalizedTo = to.map(value => value / toLength) as typeof to;
    const midpoint = interpolateCameraState({
      position: normalizedFrom,
      target: [0, 0, 0],
      zoom: 1,
      fov: 40,
    }, {
      position: normalizedTo,
      target: [0, 0, 0],
      zoom: 1,
      fov: 40,
    }, 0.5);
    const azimuth = Math.atan2(midpoint.position[0], -midpoint.position[1]);
    const polar = Math.acos(midpoint.position[2]);
    expect(azimuth).toBeCloseTo(Math.PI / 8);
    expect(polar).toBeCloseTo(
      (Math.acos(normalizedFrom[2]) + Math.acos(normalizedTo[2])) / 2,
    );
  });

  it.each([
    [[1, 0, 1], [-1, 0, 1]],
    [[1, 1, 1], [-1, -1, 1]],
  ] as const)(
    "orbits between opposite upper views without passing over TOP: %s to %s",
    (from, to) => {
      const fromLength = Math.hypot(...from);
      const toLength = Math.hypot(...to);
      const normalizedFrom = from.map(value =>
        value / fromLength) as [number, number, number];
      const normalizedTo = to.map(value =>
        value / toLength) as [number, number, number];
      const midpoint = interpolateCameraState({
        position: normalizedFrom,
        target: [0, 0, 0],
        zoom: 1,
        fov: 40,
      }, {
        position: normalizedTo,
        target: [0, 0, 0],
        zoom: 1,
        fov: 40,
      }, 0.5);
      const midpointHorizontal = Math.hypot(
        midpoint.position[0],
        midpoint.position[1],
      );
      expect(midpoint.position[2]).toBeCloseTo(normalizedFrom[2]);
      expect(midpointHorizontal).toBeCloseTo(Math.hypot(
        normalizedFrom[0],
        normalizedFrom[1],
      ));
    },
  );

  it("smoothly adjusts elevation between a top edge and corner", () => {
    const edge = [1, 0, 1] as [number, number, number];
    const corner = [1, 1, 1] as [number, number, number];
    const edgeLength = Math.hypot(...edge);
    const cornerLength = Math.hypot(...corner);
    const normalizedEdge = edge.map(value =>
      value / edgeLength) as typeof edge;
    const normalizedCorner = corner.map(value =>
      value / cornerLength) as typeof corner;
    const midpoint = interpolateCameraState({
      position: normalizedEdge,
      target: [0, 0, 0],
      zoom: 1,
      fov: 40,
    }, {
      position: normalizedCorner,
      target: [0, 0, 0],
      zoom: 1,
      fov: 40,
    }, 0.5);
    expect(Math.acos(midpoint.position[2])).toBeCloseTo(
      (Math.acos(normalizedEdge[2]) + Math.acos(normalizedCorner[2])) / 2,
    );
  });

  it("applies camera state to camera and controls objects", () => {
    const camera = {
      position: { set: jest.fn() },
      zoom: 1,
      fov: 40,
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
      fov: 20,
    }, camera, controls);
    expect(camera.position.set).toHaveBeenCalledWith(1, 2, 3);
    expect(camera.zoom).toEqual(2);
    expect(camera.fov).toEqual(20);
    expect(camera.lookAt).toHaveBeenCalledWith(4, 5, 6);
    expect(camera.updateProjectionMatrix).toHaveBeenCalled();
    expect(controls.target.set).toHaveBeenCalledWith(4, 5, 6);
    expect(controls.update).toHaveBeenCalled();
  });

  it("applies camera state without emitting a controls update", () => {
    const controls = {
      target: { set: jest.fn() },
      update: jest.fn(),
    };
    applySmoothCameraState({
      position: [1, 2, 3],
      target: [4, 5, 6],
      zoom: 2,
      fov: 20,
    }, undefined, controls, { emitControlsUpdate: false });
    expect(controls.target.set).toHaveBeenCalledWith(4, 5, 6);
    expect(controls.update).not.toHaveBeenCalled();
  });

  it("reads live camera and controls state", () => {
    const fallback = {
      position: [1, 2, 3] as [number, number, number],
      target: [4, 5, 6] as [number, number, number],
      zoom: 1,
      fov: 40,
    };
    const camera = {
      position: { x: 7, y: 8, z: 9, set: jest.fn() },
      zoom: 2,
      fov: 20,
    };
    const controls = {
      target: { x: 10, y: 11, z: 12, set: jest.fn() },
    };
    expect(readSmoothCameraState(fallback, camera, controls)).toEqual({
      position: [7, 8, 9],
      target: [10, 11, 12],
      zoom: 2,
      fov: 20,
    });
  });

  it("reads vector arrays and falls back for missing zoom", () => {
    const fallback = {
      position: [1, 2, 3] as [number, number, number],
      target: [4, 5, 6] as [number, number, number],
      zoom: 1,
      fov: 40,
    };
    const camera = {
      position: { set: jest.fn(), toArray: () => [7, 8, 9] },
      zoom: undefined as unknown as number,
    };
    const controls = {
      target: { set: jest.fn(), toArray: () => [10, 11, 12] },
    };
    expect(readSmoothCameraState(fallback, camera, controls)).toEqual({
      position: [7, 8, 9],
      target: [10, 11, 12],
      zoom: 1,
      fov: 40,
    });
  });

  it("can update the live camera without rendering every animation frame", () => {
    const nowSpy = jest.spyOn(performance, "now");
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    let now = 0;
    nowSpy.mockImplementation(() => now);
    const frames: FrameRequestCallback[] = [];
    window.requestAnimationFrame = jest.fn(callback => {
      frames.push(callback);
      return frames.length;
    });
    window.cancelAnimationFrame = jest.fn();
    const cameraObject = {
      position: { set: jest.fn() },
      zoom: 1,
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
    };
    const controls = {
      target: { set: jest.fn() },
      update: jest.fn(),
    };
    let renders = 0;
    const CameraConsumer = () => {
      renders++;
      useSmoothCamera({
        camera: {
          position: [10, 20, 30],
          target: [40, 50, 60],
        },
        zoom: 2,
        fov: 40,
        enabled: true,
        cameraObject,
        controls,
        updateStateDuringTransition: false,
      });
      return <div />;
    };

    try {
      render(<FocusTransitionProvider enabled={true} duration={100}>
        <CameraConsumer />
      </FocusTransitionProvider>);
      while (frames.length) {
        const callback = frames.shift();
        if (!callback) { break; }
        now += 20;
        act(() => callback(now));
      }
      expect(renders).toEqual(1);
      expect(cameraObject.position.set).toHaveBeenCalledWith(10, 20, 30);
      expect(controls.target.set).toHaveBeenCalledWith(40, 50, 60);
    } finally {
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;
      nowSpy.mockRestore();
    }
  });

  it("applies linear camera interpolation during a transition", () => {
    let springProps: {
      onChange(result: { value: { progress?: number } }): void;
    } | undefined;
    const api = {
      start: jest.fn(props => {
        springProps = props as typeof springProps;
      }),
      stop: jest.fn(),
    };
    const useSpringSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(() => [{}, api] as never);
    const cameraObject = {
      position: {
        set: jest.fn(),
        toArray: () => [0, 10, 20],
      },
      zoom: 1,
      fov: 60,
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
    };
    const controls = {
      target: {
        set: jest.fn(),
        toArray: () => [30, 40, 50],
      },
      update: jest.fn(),
    };
    const CameraConsumer = (props: {
      camera: SmoothCameraState;
    }) => {
      useSmoothCamera({
        camera: props.camera,
        zoom: props.camera.zoom,
        fov: props.camera.fov,
        enabled: true,
        cameraObject,
        controls,
        interpolation: "linear",
      });
      return <div />;
    };
    const from: SmoothCameraState = {
      position: [0, 10, 20],
      target: [30, 40, 50],
      zoom: 1,
      fov: 60,
    };
    const to: SmoothCameraState = {
      position: [100, 110, 120],
      target: [130, 140, 150],
      zoom: 3,
      fov: 20,
    };
    const view = render(<CameraConsumer camera={from} />);
    view.rerender(<CameraConsumer camera={to} />);
    cameraObject.position.set.mockClear();
    controls.target.set.mockClear();

    act(() => springProps?.onChange({ value: { progress: 0.5 } }));

    expect(cameraObject.position.set).toHaveBeenCalledWith(50, 60, 70);
    expect(controls.target.set).toHaveBeenCalledWith(80, 90, 100);
    useSpringSpy.mockImplementation(originalUseSpring as never);
  });

  it("calls the camera completion callback only after a completed spring", () => {
    let springProps: {
      onRest(result?: { cancelled?: boolean }): void;
    } | undefined;
    const api = {
      start: jest.fn(props => {
        springProps = props as typeof springProps;
      }),
      stop: jest.fn(),
    };
    const useSpringSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(() => [{}, api] as never);
    const onRest = jest.fn();
    const CameraConsumer = (props: { enabled: boolean }) => {
      useSmoothCamera({
        camera: { position: [1, 2, 3], target: [4, 5, 6] },
        zoom: 1,
        fov: 40,
        enabled: props.enabled,
        onRest,
      });
      return <div />;
    };

    const view = render(<CameraConsumer enabled={true} />);
    expect(onRest).not.toHaveBeenCalled();
    act(() => springProps?.onRest({ cancelled: true }));
    expect(onRest).not.toHaveBeenCalled();
    act(() => springProps?.onRest({ cancelled: false }));
    expect(onRest).toHaveBeenCalledTimes(1);

    onRest.mockClear();
    view.rerender(<CameraConsumer enabled={false} />);
    expect(onRest).toHaveBeenCalledTimes(1);
    useSpringSpy.mockImplementation(originalUseSpring as never);
  });

  it("updates React camera state during smooth camera transitions", () => {
    const nowSpy = jest.spyOn(performance, "now");
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalCancelAnimationFrame = window.cancelAnimationFrame;
    let now = 0;
    nowSpy.mockImplementation(() => now);
    const frames: FrameRequestCallback[] = [];
    window.requestAnimationFrame = jest.fn(callback => {
      frames.push(callback);
      return frames.length;
    });
    window.cancelAnimationFrame = jest.fn();
    const cameraObject = {
      position: { set: jest.fn() },
      zoom: 1,
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
    };
    const controls = {
      target: { set: jest.fn() },
      update: jest.fn(),
    };
    let renders = 0;
    const CameraConsumer = () => {
      renders++;
      useSmoothCamera({
        camera: {
          position: [10, 20, 30],
          target: [40, 50, 60],
        },
        zoom: 2,
        fov: 40,
        enabled: true,
        cameraObject,
        controls,
      });
      return <div />;
    };

    try {
      render(<FocusTransitionProvider enabled={true} duration={100}>
        <CameraConsumer />
      </FocusTransitionProvider>);
      while (frames.length) {
        const callback = frames.shift();
        if (!callback) { break; }
        now += 50;
        act(() => callback(now));
      }
      expect(renders).toEqual(1);
      expect(cameraObject.position.set).toHaveBeenCalledWith(10, 20, 30);
      expect(controls.target.set).toHaveBeenCalledWith(40, 50, 60);
    } finally {
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;
      nowSpy.mockRestore();
    }
  });
});
