import React from "react";
import { act, render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { clone } from "lodash";
import { PerspectiveCamera, Vector3 } from "three";
import {
  CameraFollowController, CAMERA_FOLLOW_FOV_MARGIN, getCameraFollowView,
} from "../camera_follow";
import { INITIAL, INITIAL_POSITION } from "../config";
import {
  CameraViewOffset, getPanelCameraViewOffset, getViewportFramingTangents,
} from "../camera";
import {
  getBotKinematics, getCameraDistanceToSoil,
} from "../bot/kinematics";
import { getCameraViewPoints } from "../bot/components/camera_view";
import { createBotPositionSnapshotStore } from
  "../bot/position_spring";
import { createPanelCameraStore } from "../panel_camera";

type Tuple = [number, number, number];

const dot = (left: Tuple, right: Tuple) =>
  left[0] * right[0] + left[1] * right[1] + left[2] * right[2];

const normalized = (value: Tuple): Tuple => {
  const length = Math.hypot(...value);
  return value.map(item => item / length) as Tuple;
};

const cameraFollowMargins = (
  camera: ReturnType<typeof getCameraFollowView>,
  frustum: ReturnType<typeof getCameraViewPoints>,
  view: CameraViewOffset,
) => {
  const backward = normalized(camera.position.map((value, index) =>
    value - camera.target[index]) as Tuple);
  const right = normalized([-backward[1], backward[0], 0]);
  const up: Tuple = [
    backward[1] * right[2] - backward[2] * right[1],
    backward[2] * right[0] - backward[0] * right[2],
    backward[0] * right[1] - backward[1] * right[0],
  ];
  const distance = Math.hypot(...camera.position.map((value, index) =>
    value - camera.target[index]));
  const tangent = Math.tan(camera.fov * Math.PI / 360);
  const horizontalCenter =
    (2 * view.offsetX + view.width - view.fullWidth) / view.fullHeight;
  const horizontalHalf = view.width / view.fullHeight;
  const verticalCenter =
    (view.fullHeight - 2 * view.offsetY - view.height) / view.fullHeight;
  const verticalHalf = view.height / view.fullHeight;
  const horizontalMinimum = Math.atan(
    (horizontalCenter - horizontalHalf) * tangent,
  );
  const horizontalMaximum = Math.atan(
    (horizontalCenter + horizontalHalf) * tangent,
  );
  const verticalMinimum = Math.atan(
    (verticalCenter - verticalHalf) * tangent,
  );
  const verticalMaximum = Math.atan(
    (verticalCenter + verticalHalf) * tangent,
  );
  return frustum.points.slice(4).flatMap(point => {
    const world = point.clone().add(frustum.cameraLensPosition).toArray();
    const relative = world.map((value, index) =>
      value - camera.target[index]) as Tuple;
    const depth = distance - dot(relative, backward);
    const horizontal = Math.atan2(dot(relative, right), depth);
    const vertical = Math.atan2(dot(relative, up), depth);
    return [
      horizontal - horizontalMinimum,
      horizontalMaximum - horizontal,
      vertical - verticalMinimum,
      verticalMaximum - vertical,
    ].map(value => value * 180 / Math.PI);
  });
};

describe("getCameraFollowView()", () => {
  it("uses the camera height and adds five degrees on every side", () => {
    const config = clone(INITIAL);
    config.viewpointHeading = 37;
    const getZ = jest.fn(() => -100);
    const viewport = { width: 1200, height: 700 };
    const camera = getCameraFollowView({
      config,
      position: INITIAL_POSITION,
      getZ,
      viewport,
    });
    expect(getZ).toHaveBeenCalledWith(200, 699);
    expect(camera.target[2]).toBeCloseTo(300);

    const backward = normalized(camera.position.map((value, index) =>
      value - camera.target[index]) as Tuple);
    const right = normalized([-backward[1], backward[0], 0]);
    const up: Tuple = [
      backward[1] * right[2] - backward[2] * right[1],
      backward[2] * right[0] - backward[0] * right[2],
      backward[0] * right[1] - backward[1] * right[0],
    ];
    const distance = Math.hypot(...camera.position.map((value, index) =>
      value - camera.target[index]));
    const kinematics = getBotKinematics(config, INITIAL_POSITION);
    const distanceToSoil = getCameraDistanceToSoil(
      config,
      INITIAL_POSITION,
      getZ,
      kinematics,
    );
    const frustum = getCameraViewPoints({
      config,
      configPosition: INITIAL_POSITION,
      distanceToSoil,
      cameraMountPosition: new Vector3(
        ...kinematics.anchors.camera.worldPosition,
      ),
      getZ,
    });
    expect(camera.position[2]).toBeCloseTo(frustum.cameraLensPosition.z);
    const framing = getViewportFramingTangents(viewport, camera.fov);
    const horizontalViewAngle = Math.atan(framing.horizontal);
    const verticalViewAngle = Math.atan(framing.vertical);
    frustum.points.slice(4).forEach(point => {
      const world = point.clone().add(frustum.cameraLensPosition).toArray();
      const relative = world.map((value, index) =>
        value - camera.target[index]) as Tuple;
      const depth = distance - dot(relative, backward);
      const horizontalAngle = Math.atan2(
        Math.abs(dot(relative, right)),
        depth,
      );
      const verticalAngle = Math.atan2(
        Math.abs(dot(relative, up)),
        depth,
      );
      expect((horizontalViewAngle - horizontalAngle) * 180 / Math.PI)
        .toBeGreaterThanOrEqual(CAMERA_FOLLOW_FOV_MARGIN - 0.001);
      expect((verticalViewAngle - verticalAngle) * 180 / Math.PI)
        .toBeGreaterThanOrEqual(CAMERA_FOLLOW_FOV_MARGIN - 0.001);
    });
  });

  it("keeps five degrees around the footprint in panel sub-views", () => {
    const config = clone(INITIAL);
    config.viewpointHeading = 37;
    const getZ = () => -100;
    const kinematics = getBotKinematics(config, INITIAL_POSITION);
    const distanceToSoil = getCameraDistanceToSoil(
      config,
      INITIAL_POSITION,
      getZ,
      kinematics,
    );
    const frustum = getCameraViewPoints({
      config,
      configPosition: INITIAL_POSITION,
      distanceToSoil,
      cameraMountPosition: new Vector3(
        ...kinematics.anchors.camera.worldPosition,
      ),
      getZ,
    });
    const viewports = [
      { width: 769, height: 700 },
      { width: 800, height: 1200 },
    ];
    viewports.forEach(viewport => {
      const openView = getPanelCameraViewOffset(viewport, true);
      const closedView = getPanelCameraViewOffset(viewport, false);
      const common = {
        config,
        position: INITIAL_POSITION,
        getZ,
        viewport: {
          width: openView.fullWidth,
          height: openView.fullHeight,
        },
      };
      const openCamera = getCameraFollowView({
        ...common,
        cameraView: openView,
      });
      const closedCamera = getCameraFollowView({
        ...common,
        cameraView: closedView,
      });
      cameraFollowMargins(openCamera, frustum, openView).forEach(margin =>
        expect(margin).toBeGreaterThanOrEqual(
          CAMERA_FOLLOW_FOV_MARGIN - 0.001,
        ));
      expect(openCamera.target).not.toEqual(closedCamera.target);
      expect(openCamera.target[0]).not.toEqual(closedCamera.target[0]);
    });
  });
});

describe("<CameraFollowController />", () => {
  it("tracks spring positions and stops when disabled", () => {
    let frame: Function = jest.fn();
    const useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(callback => {
        frame = callback;
        // eslint-disable-next-line no-null/no-null
        return null;
      });
    const initialPosition = { ...INITIAL_POSITION };
    const store = createBotPositionSnapshotStore(initialPosition);
    const controlsCamera = new PerspectiveCamera();
    const controls = {
      target: new Vector3(),
      update: jest.fn(),
    };
    const props: React.ComponentProps<typeof CameraFollowController> = {
      enabled: true,
      botSpringActive: true,
      botPositionStore: store,
      config: clone(INITIAL),
      position: initialPosition,
      getZ: () => -100,
      viewport: { width: 1200, height: 700 },
      cameraView: getPanelCameraViewOffset(
        { width: 1200, height: 700 },
        undefined,
      ),
      controlsCamera,
      controls,
    };
    const view = render(<CameraFollowController {...props} />);
    const initialTarget = controls.target.toArray();
    expect(controlsCamera.fov).not.toEqual(50);

    act(() => {
      store.publish({ x: 600, y: 300, z: -50 });
      frame({ invalidate: jest.fn() }, 0.1);
    });
    expect(controls.target.toArray()).not.toEqual(initialTarget);
    const followedTarget = controls.target.toArray();

    view.rerender(<CameraFollowController {...props} enabled={false} />);
    act(() => {
      store.publish({ x: 900, y: 500, z: -100 });
      frame({ invalidate: jest.fn() }, 0.1);
    });
    expect(controls.target.toArray()).toEqual(followedTarget);
    useFrameSpy.mockRestore();
  });

  it("reframes on panel changes without the bot spring", () => {
    const panelCameraStore = createPanelCameraStore(true);
    const controlsCamera = new PerspectiveCamera();
    const controls = {
      target: new Vector3(),
      update: jest.fn(),
    };
    const viewport = { width: 1200, height: 700 };
    const props: React.ComponentProps<typeof CameraFollowController> = {
      enabled: true,
      botSpringActive: false,
      botPositionStore: createBotPositionSnapshotStore(INITIAL_POSITION),
      config: clone(INITIAL),
      position: INITIAL_POSITION,
      getZ: () => -100,
      viewport,
      cameraView: getPanelCameraViewOffset(viewport, true),
      panelCameraStore,
      controlsCamera,
      controls,
    };
    render(<CameraFollowController {...props} />);
    const openTarget = controls.target.toArray();
    act(() => panelCameraStore.setOpen(false));
    expect(controls.target.toArray()).not.toEqual(openTarget);
  });
});
