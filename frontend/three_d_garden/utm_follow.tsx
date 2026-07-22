import React from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { Config, PositionConfig } from "./config";
import { applyCameraClippingRange } from "./camera";
import { Camera } from "./zoom_beacons_constants";
import {
  applySmoothCameraState, SmoothCameraControls,
} from "./focus_transition";
import { BotPositionSnapshotStore } from "./bot/position_spring";
import { getBotKinematics } from "./bot/kinematics";
import { BigDistance } from "./constants";

export const UTM_FOLLOW_CAMERA_X_OFFSET = 1000;
export const UTM_FOLLOW_CAMERA_Z_OFFSET = 300;

export const getUtmFollowView = (
  config: Config,
  position: PositionConfig,
): Camera => {
  const utm = getBotKinematics(config, position).anchors.utm.worldPosition;
  const target: Camera["target"] = [...utm];
  return {
    target,
    position: [
      target[0] + UTM_FOLLOW_CAMERA_X_OFFSET,
      target[1],
      target[2] + UTM_FOLLOW_CAMERA_Z_OFFSET,
    ],
  };
};

const sameTarget = (
  left: Camera["target"],
  right: Camera["target"],
) => left[0] == right[0]
  && left[1] == right[1]
  && left[2] == right[2];

export interface UtmFollowControllerProps {
  enabled: boolean;
  botSpringActive: boolean;
  botPositionStore: BotPositionSnapshotStore;
  config: Config;
  position: PositionConfig;
  controlsCamera: PerspectiveCamera | null | undefined;
  controls: SmoothCameraControls | null | undefined;
}

const perspectiveCameraReady = (
  camera: PerspectiveCamera | null | undefined,
): camera is PerspectiveCamera => !!camera?.isPerspectiveCamera;

export const UtmFollowController = (
  props: UtmFollowControllerProps,
) => {
  const lastTarget = React.useRef<Camera["target"]>(getUtmFollowView(
    props.config,
    props.botSpringActive
      ? props.botPositionStore.getSnapshot()
      : props.position,
  ).target);
  const initializedCamera =
    React.useRef<PerspectiveCamera | null | undefined>(undefined);
  const targetDelta = React.useMemo(() => new Vector3(), []);
  const currentPosition = React.useCallback(() => props.botSpringActive
    ? props.botPositionStore.getSnapshot()
    : props.position, [
    props.botPositionStore,
    props.botSpringActive,
    props.position,
  ]);
  const updateClippingRange = React.useCallback(() => {
    props.controlsCamera && applyCameraClippingRange(props.controlsCamera, {
      sceneRadius: BigDistance.sky + 1000,
      minNear: 10,
      minFar: BigDistance.far,
      maxCameraScale: 1,
    });
  }, [props.controlsCamera]);
  const initialize = React.useCallback((position: PositionConfig) => {
    if (!props.enabled
      || !perspectiveCameraReady(props.controlsCamera)
      || !props.controls) {
      return;
    }
    const view = getUtmFollowView(props.config, position);
    props.controlsCamera.up.set(0, 0, 1);
    applySmoothCameraState({
      ...view,
      zoom: 1,
      fov: props.controlsCamera.fov,
    }, props.controlsCamera, props.controls);
    updateClippingRange();
    lastTarget.current = view.target;
    initializedCamera.current = props.controlsCamera;
  }, [
    props.config,
    props.controls,
    props.controlsCamera,
    props.enabled,
    updateClippingRange,
  ]);

  React.useLayoutEffect(() => {
    if (!props.enabled) {
      lastTarget.current = getUtmFollowView(
        props.config,
        currentPosition(),
      ).target;
      initializedCamera.current = undefined;
      return;
    }
    if (initializedCamera.current == props.controlsCamera) { return; }
    initialize(currentPosition());
  }, [
    currentPosition,
    initialize,
    props.config,
    props.controlsCamera,
    props.enabled,
  ]);

  useFrame(state => {
    if (!props.enabled
      || !perspectiveCameraReady(props.controlsCamera)
      || !props.controls) {
      return;
    }
    const view = getUtmFollowView(props.config, currentPosition());
    const previousTarget = lastTarget.current;
    if (sameTarget(previousTarget, view.target)) { return; }
    props.controlsCamera.position.add(targetDelta.set(
      view.target[0] - previousTarget[0],
      view.target[1] - previousTarget[1],
      view.target[2] - previousTarget[2],
    ));
    props.controls.target.set(...view.target);
    props.controls.update?.();
    updateClippingRange();
    lastTarget.current = view.target;
    state.invalidate();
  });
  return <></>;
};
