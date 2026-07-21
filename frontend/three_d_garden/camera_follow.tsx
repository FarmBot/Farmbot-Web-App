import React from "react";
import { useFrame } from "@react-three/fiber";
import {
  PerspectiveCamera, Vector3,
} from "three";
import { Config, PositionConfig } from "./config";
import {
  applyCameraClippingRange, CameraViewOffset, CameraViewport,
  getPanelCameraViewOffset,
} from "./camera";
import { Camera } from "./zoom_beacons_constants";
import {
  applySmoothCameraState, SmoothCameraControls,
} from "./focus_transition";
import {
  BotPositionSnapshotStore,
} from "./bot/position_spring";
import {
  getBotKinematics, getCameraDistanceToSoil,
} from "./bot/kinematics";
import { getCameraViewPoints } from "./bot/components/camera_view";
import { BigDistance } from "./constants";
import type { PanelCameraStore } from "./panel_camera";

export const CAMERA_FOLLOW_FOV_MARGIN = 5;
const MAX_HALF_FOV = Math.PI / 2 - 0.001;
const MAX_FOV_TANGENT = Math.tan(MAX_HALF_FOV);
const CAMERA_FOLLOW_FIT_EPSILON = Math.PI / 18000;
const CAMERA_FOLLOW_FOV_SEARCH_ITERATIONS = 32;
const CARDINAL_FIT_TOLERANCE = 1e-9;
const CARDINAL_HEADINGS = [0, 90, 180, 270];

type VectorTuple = Camera["position"];

const dot = (left: VectorTuple, right: VectorTuple) =>
  left[0] * right[0] + left[1] * right[1] + left[2] * right[2];

const subtract = (left: VectorTuple, right: VectorTuple): VectorTuple => [
  left[0] - right[0],
  left[1] - right[1],
  left[2] - right[2],
];

const cameraBasis = (heading: number) => {
  const angle = heading * Math.PI / 180;
  const sine = Math.sin(angle);
  const cosine = Math.cos(angle);
  const right: VectorTuple = [cosine, sine, 0];
  const up: VectorTuple = [-sine, cosine, 0];
  return { right, up };
};

export interface CameraFollowViewProps {
  config: Config;
  position: PositionConfig;
  getZ(x: number, y: number): number;
  viewport: CameraViewport;
  fovMargin?: number;
  cameraView?: CameraViewOffset;
}

interface CameraFollowProjection {
  horizontalCenter: number;
  horizontalHalf: number;
  verticalCenter: number;
  verticalHalf: number;
}

const cameraFollowFit = (
  projection: CameraFollowProjection,
  horizontalAngles: number[],
  verticalAngles: number[],
  margin: number,
) => {
  const axisFits = (
    angles: number[],
    center: number,
    half: number,
    tangent: number,
  ) => {
    const minimum = Math.atan((center - half) * tangent) + margin;
    const maximum = Math.atan((center + half) * tangent) - margin;
    return minimum <= maximum
      && angles.every(angle => angle >= minimum && angle <= maximum);
  };
  const fits = (tangent: number) => axisFits(
    horizontalAngles,
    projection.horizontalCenter,
    projection.horizontalHalf,
    tangent,
  ) && axisFits(
    verticalAngles,
    projection.verticalCenter,
    projection.verticalHalf,
    tangent,
  );
  let lower = 0;
  let upper = MAX_FOV_TANGENT;
  for (let iteration = 0;
    iteration < CAMERA_FOLLOW_FOV_SEARCH_ITERATIONS;
    iteration++) {
    const candidate = (lower + upper) / 2;
    if (fits(candidate)) {
      upper = candidate;
    } else {
      lower = candidate;
    }
  }
  return upper;
};

const headingDistance = (left: number, right: number) =>
  Math.abs((left - right + 540) % 360 - 180);

const cameraFollowProjection = (
  viewport: CameraViewport,
  view?: CameraViewOffset,
): CameraFollowProjection => {
  if (!view?.enabled) {
    const width = Math.max(1, viewport.width);
    const height = Math.max(1, viewport.height);
    return {
      horizontalCenter: 0,
      horizontalHalf: width / height,
      verticalCenter: 0,
      verticalHalf: 1,
    };
  }
  return {
    horizontalCenter:
      (2 * view.offsetX + view.width - view.fullWidth)
      / view.fullHeight,
    horizontalHalf: view.width / view.fullHeight,
    verticalCenter:
      (view.fullHeight - 2 * view.offsetY - view.height)
      / view.fullHeight,
    verticalHalf: view.height / view.fullHeight,
  };
};

export interface CameraFollowView extends Camera {
  fov: number;
  heading: number;
  up: VectorTuple;
}

export const getCameraFollowView = (
  props: CameraFollowViewProps,
): CameraFollowView => {
  const kinematics = getBotKinematics(props.config, props.position);
  const distanceToSoil = getCameraDistanceToSoil(
    props.config,
    props.position,
    props.getZ,
    kinematics,
  );
  const cameraMountPosition = new Vector3(
    ...kinematics.anchors.camera.worldPosition,
  );
  const view = getCameraViewPoints({
    config: props.config,
    configPosition: props.position,
    distanceToSoil,
    cameraMountPosition,
    getZ: props.getZ,
  });
  const footprint = view.points.slice(4).map(point => point.clone()
    .add(view.cameraLensPosition)
    .toArray());
  const targetZ = footprint.reduce((sum, point) => sum + point[2], 0)
    / footprint.length;
  const projection = cameraFollowProjection(
    props.viewport,
    props.cameraView,
  );
  const fovMargin = Math.min(
    MAX_HALF_FOV,
    Math.max(0, props.fovMargin ?? CAMERA_FOLLOW_FOV_MARGIN)
      * Math.PI / 180 + CAMERA_FOLLOW_FIT_EPSILON,
  );
  const position = view.cameraLensPosition.toArray();
  const preferredHeadings = [...CARDINAL_HEADINGS].sort((left, right) =>
    headingDistance(left, props.config.viewpointHeading)
      - headingDistance(right, props.config.viewpointHeading));
  const fits = preferredHeadings.map(heading => {
    const basis = cameraBasis(heading);
    const angles = footprint.reduce((result, point) => {
      const relative = subtract(point, position);
      const depth = -relative[2];
      return {
        horizontal: result.horizontal.concat(
          Math.atan2(dot(relative, basis.right), depth),
        ),
        vertical: result.vertical.concat(
          Math.atan2(dot(relative, basis.up), depth),
        ),
      };
    }, { horizontal: [] as number[], vertical: [] as number[] });
    return {
      basis,
      heading,
      verticalTangent: cameraFollowFit(
        projection,
        angles.horizontal,
        angles.vertical,
        fovMargin,
      ),
    };
  });
  const fit = fits.reduce((best, candidate) =>
    candidate.verticalTangent + CARDINAL_FIT_TOLERANCE
      < best.verticalTangent
      ? candidate
      : best);
  return {
    fov: Math.atan(fit.verticalTangent) * 360 / Math.PI,
    heading: fit.heading,
    up: fit.basis.up,
    target: [position[0], position[1], targetZ],
    position,
  };
};

const samePosition = (
  left: PositionConfig | undefined,
  right: PositionConfig,
) => left?.x == right.x && left.y == right.y && left.z == right.z;

export interface CameraFollowControllerProps extends CameraFollowViewProps {
  enabled: boolean;
  botSpringActive: boolean;
  botPositionStore: BotPositionSnapshotStore;
  controlsCamera: PerspectiveCamera | null | undefined;
  controls: SmoothCameraControls | null | undefined;
  cameraView: CameraViewOffset;
  panelCameraStore?: PanelCameraStore;
}

const cameraPanelOpen = () => true;
const subscribeToNoCameraPanel = () => () => undefined;
const alwaysOpenCameraPanelStore = {
  getSnapshot: cameraPanelOpen,
  subscribe: subscribeToNoCameraPanel,
};

export const CameraFollowController = (
  props: CameraFollowControllerProps,
) => {
  const lastPosition = React.useRef<PositionConfig | undefined>(undefined);
  const panelCameraStore = props.panelCameraStore
    || alwaysOpenCameraPanelStore;
  const panelOpen = React.useSyncExternalStore(
    panelCameraStore.subscribe,
    panelCameraStore.getSnapshot,
    panelCameraStore.getSnapshot,
  );
  const cameraView = React.useMemo(() => props.panelCameraStore
    ? getPanelCameraViewOffset({
      width: props.cameraView.width,
      height: props.cameraView.height,
    }, panelOpen)
    : props.cameraView, [
    panelOpen,
    props.cameraView,
    props.panelCameraStore,
  ]);
  const applyPosition = React.useCallback((position: PositionConfig) => {
    if (!props.enabled || !props.controlsCamera || !props.controls) {
      return;
    }
    const camera = getCameraFollowView({
      config: props.config,
      position,
      getZ: props.getZ,
      viewport: props.viewport,
      fovMargin: props.fovMargin,
      cameraView,
    });
    props.controlsCamera.up?.set(...camera.up);
    applySmoothCameraState({
      ...camera,
      zoom: 1,
      fov: camera.fov,
    }, props.controlsCamera, props.controls);
    applyCameraClippingRange(props.controlsCamera, {
      sceneRadius: BigDistance.sky + 1000,
      minNear: 10,
      minFar: BigDistance.far,
      maxCameraScale: 1,
    });
    lastPosition.current = { ...position };
  }, [
    cameraView,
    props.config,
    props.controls,
    props.controlsCamera,
    props.enabled,
    props.fovMargin,
    props.getZ,
    props.viewport,
  ]);
  const currentPosition = React.useCallback(() => props.botSpringActive
    ? props.botPositionStore.getSnapshot()
    : props.position, [
    props.botPositionStore,
    props.botSpringActive,
    props.position,
  ]);

  React.useLayoutEffect(() => {
    lastPosition.current = undefined;
    applyPosition(currentPosition());
  }, [applyPosition, currentPosition]);

  React.useLayoutEffect(() => {
    const camera = props.controlsCamera;
    if (!camera || !props.enabled) { return; }
    return () => {
      camera.up?.set(0, 0, 1);
      props.controls?.update?.();
    };
  }, [props.controls, props.controlsCamera, props.enabled]);

  useFrame(state => {
    if (!props.enabled || !props.controlsCamera || !props.controls) {
      return;
    }
    const position = currentPosition();
    if (samePosition(lastPosition.current, position)) { return; }
    applyPosition(position);
    state.invalidate();
  });
  return <></>;
};
