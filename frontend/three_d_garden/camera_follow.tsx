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
const CAMERA_FOLLOW_TILT = 1 / 5000;
const MAX_HALF_FOV = Math.PI / 2 - 0.001;
const MAX_FOV_TANGENT = Math.tan(MAX_HALF_FOV);
const CAMERA_FOLLOW_FIT_EPSILON = Math.PI / 18000;
const CAMERA_FOLLOW_FIT_ITERATIONS = 4;
const CAMERA_FOLLOW_FOV_SEARCH_ITERATIONS = 32;

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
  const length = Math.hypot(CAMERA_FOLLOW_TILT, 1);
  const backward: VectorTuple = [
    sine * CAMERA_FOLLOW_TILT / length,
    -cosine * CAMERA_FOLLOW_TILT / length,
    1 / length,
  ];
  const right: VectorTuple = [cosine, sine, 0];
  const planarUp: VectorTuple = [-sine, cosine, 0];
  const up: VectorTuple = [
    -sine / length,
    cosine / length,
    CAMERA_FOLLOW_TILT / length,
  ];
  return { backward, planarUp, right, up };
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

interface CameraFollowAxisFit {
  center: number;
  fits: boolean;
}

const cameraFollowAxisFit = (
  projectionCenter: number,
  projectionHalf: number,
  footprintTangents: number[],
  verticalTangent: number,
  margin: number,
): CameraFollowAxisFit => {
  const viewMinimum = Math.atan(
    (projectionCenter - projectionHalf) * verticalTangent,
  );
  const viewMaximum = Math.atan(
    (projectionCenter + projectionHalf) * verticalTangent,
  );
  const minimum = Math.min(...footprintTangents);
  const maximum = Math.max(...footprintTangents);
  const centerMinimum = Math.tan(viewMinimum + margin) - minimum;
  const centerMaximum = Math.tan(viewMaximum - margin) - maximum;
  return {
    center: (centerMinimum + centerMaximum) / 2,
    fits: viewMinimum + margin <= viewMaximum - margin
      && centerMinimum <= centerMaximum,
  };
};

const cameraFollowFit = (
  projection: CameraFollowProjection,
  horizontalTangents: number[],
  verticalTangents: number[],
  minimumTangent: number,
  margin: number,
) => {
  const fit = (verticalTangent: number) => {
    const horizontal = cameraFollowAxisFit(
      projection.horizontalCenter,
      projection.horizontalHalf,
      horizontalTangents,
      verticalTangent,
      margin,
    );
    const vertical = cameraFollowAxisFit(
      projection.verticalCenter,
      projection.verticalHalf,
      verticalTangents,
      verticalTangent,
      margin,
    );
    return { horizontal, vertical };
  };
  let verticalTangent = minimumTangent;
  let result = fit(verticalTangent);
  if (!result.horizontal.fits || !result.vertical.fits) {
    let lower = verticalTangent;
    let upper = MAX_FOV_TANGENT;
    for (let iteration = 0;
      iteration < CAMERA_FOLLOW_FOV_SEARCH_ITERATIONS;
      iteration++) {
      const candidate = (lower + upper) / 2;
      const candidateFit = fit(candidate);
      if (candidateFit.horizontal.fits && candidateFit.vertical.fits) {
        upper = candidate;
      } else {
        lower = candidate;
      }
    }
    verticalTangent = upper;
    result = fit(verticalTangent);
  }
  return {
    verticalTangent,
    horizontalCenter: result.horizontal.center,
    verticalCenter: result.vertical.center,
  };
};

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
  const basis = cameraBasis(props.config.viewpointHeading);
  const rightValues = footprint.map(point => dot(point, basis.right));
  const upValues = footprint.map(point => dot(point, basis.planarUp));
  const rightCenter = (Math.min(...rightValues) + Math.max(...rightValues)) / 2;
  const upCenter = (Math.min(...upValues) + Math.max(...upValues)) / 2;
  const targetZ = footprint.reduce((sum, point) => sum + point[2], 0)
    / footprint.length;
  const footprintCenter: VectorTuple = [
    basis.right[0] * rightCenter + basis.planarUp[0] * upCenter,
    basis.right[1] * rightCenter + basis.planarUp[1] * upCenter,
    targetZ,
  ];
  const projection = cameraFollowProjection(
    props.viewport,
    props.cameraView,
  );
  const fovMargin = Math.min(
    MAX_HALF_FOV,
    Math.max(0, props.fovMargin ?? CAMERA_FOLLOW_FOV_MARGIN)
      * Math.PI / 180 + CAMERA_FOLLOW_FIT_EPSILON,
  );
  const lensHeight = view.cameraLensPosition.z;
  let distance = (lensHeight - targetZ) / basis.backward[2];
  let verticalTangent = 1;
  let horizontalCenter = 0;
  let verticalCenter = 0;
  for (let iteration = 0;
    iteration < CAMERA_FOLLOW_FIT_ITERATIONS;
    iteration++) {
    const footprintTangents = footprint.reduce((tangents, point) => {
      const relative = subtract(point, footprintCenter);
      const depth = distance - dot(relative, basis.backward);
      return {
        horizontal: tangents.horizontal.concat(
          dot(relative, basis.right) / depth,
        ),
        vertical: tangents.vertical.concat(
          dot(relative, basis.up) / depth,
        ),
      };
    }, { horizontal: [] as number[], vertical: [] as number[] });
    const horizontalFootprintAngle = Math.max(
      ...footprintTangents.horizontal.map(value => Math.atan(Math.abs(value))),
    );
    const verticalFootprintAngle = Math.max(
      ...footprintTangents.vertical.map(value => Math.atan(Math.abs(value))),
    );
    const horizontalAngle = Math.min(
      MAX_HALF_FOV,
      horizontalFootprintAngle + fovMargin,
    );
    const verticalAngle = Math.min(
      MAX_HALF_FOV,
      verticalFootprintAngle + fovMargin,
    );
    const minimumTangent = Math.max(
      Math.tan(horizontalAngle) / projection.horizontalHalf,
      Math.tan(verticalAngle) / projection.verticalHalf,
    );
    const fit = cameraFollowFit(
      projection,
      footprintTangents.horizontal,
      footprintTangents.vertical,
      minimumTangent,
      fovMargin,
    );
    verticalTangent = fit.verticalTangent;
    horizontalCenter = fit.horizontalCenter;
    verticalCenter = fit.verticalCenter;
    distance = (lensHeight - targetZ)
      / (basis.backward[2] - basis.up[2] * verticalCenter);
  }
  const target: VectorTuple = [
    footprintCenter[0]
      - basis.right[0] * horizontalCenter * distance
      - basis.up[0] * verticalCenter * distance,
    footprintCenter[1]
      - basis.right[1] * horizontalCenter * distance
      - basis.up[1] * verticalCenter * distance,
    footprintCenter[2]
      - basis.right[2] * horizontalCenter * distance
      - basis.up[2] * verticalCenter * distance,
  ];
  return {
    fov: Math.atan(verticalTangent) * 360 / Math.PI,
    target,
    position: [
      target[0] + basis.backward[0] * distance,
      target[1] + basis.backward[1] * distance,
      target[2] + basis.backward[2] * distance,
    ],
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
