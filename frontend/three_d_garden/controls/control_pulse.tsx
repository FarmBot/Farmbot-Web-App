import React from "react";
import { Sphere } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { SpringValue, to } from "@react-spring/core";
import { Group, MeshPhongMaterial } from "../components";
import { noControlRaycast } from "./events";
import {
  ControlRenderOptions, resolveControlRenderOptions,
} from "./theme";

const AnimatedGroup = animated(Group);
const AnimatedMeshPhongMaterial = animated(MeshPhongMaterial);

export interface ControlPulseProps extends ControlRenderOptions {
  enabled: boolean;
  radius: number;
  color: string;
  duration?: number;
  pause?: number;
  fromScale?: number;
  toScale?: number;
  fromOpacity?: number;
  toOpacity?: number;
  opacity?: number;
  parentOpacity?: SpringValue<number>;
}

export const ControlPulse = (props: ControlPulseProps) => {
  const {
    enabled,
    fromScale = 1,
    toScale = 2.5,
    fromOpacity = 0.75,
    toOpacity = 0,
  } = props;
  const [{ scale, opacity }] = useSpring(() => ({
    from: { scale: fromScale, opacity: fromOpacity },
    to: async next => {
      while (enabled) {
        await next({ scale: toScale, opacity: toOpacity });
        await new Promise(resolve =>
          setTimeout(resolve, props.pause ?? 2000));
        await next({
          scale: fromScale,
          opacity: fromOpacity,
          immediate: true,
        });
      }
    },
    immediate: !enabled,
    config: { duration: props.duration ?? 1500 },
  }), [
    enabled,
    fromOpacity,
    fromScale,
    props.duration,
    props.pause,
    toOpacity,
    toScale,
  ]);
  if (!enabled) { return <></>; }
  const renderOptions = resolveControlRenderOptions(props);
  const materialProps = {
    color: props.color,
    opacity: props.parentOpacity
      ? to([opacity, props.parentOpacity], (pulse, parent) =>
        pulse * parent)
      : to(opacity, value => value * (props.opacity ?? 1)),
    depthTest: renderOptions.depthTest,
    depthWrite: renderOptions.depthWrite ?? false,
    transparent: true,
  };
  return <AnimatedGroup name={"control-pulse"} scale={scale}>
    <Sphere
      args={[props.radius, 12, 12]}
      raycast={noControlRaycast}
      renderOrder={renderOptions.renderOrder}>
      <AnimatedMeshPhongMaterial {...materialProps} />
    </Sphere>
  </AnimatedGroup>;
};
