import React from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { range, round } from "lodash";
import { Group as ThreeGroup } from "three";
import { Group } from "../components";
import { Config } from "../config";
import {
  extents as extentsFunc, zero as zeroFunc,
} from "../helpers";
import { ResolvedThreeDObjectBase } from "./resolve";

const ringPoints = (radius: number): [number, number, number][] =>
  range(65).map(index => {
    const angle = index / 64 * Math.PI * 2;
    return [
      round(Math.cos(angle) * radius, 3),
      round(Math.sin(angle) * radius, 3),
      0,
    ];
  });

interface SelectedObjectOverlayProps {
  object: Pick<ResolvedThreeDObjectBase,
    "worldPosition" | "ringRadius">;
  config: Config;
  showCrosshairs: boolean;
}

export const SelectedObjectOverlay = (props: SelectedObjectOverlayProps) => {
  // eslint-disable-next-line no-null/no-null
  const ringRef = React.useRef<ThreeGroup>(null);
  const zero = zeroFunc(props.config);
  const extents = extentsFunc(props.config);
  const [x, y, z] = props.object.worldPosition;
  const lineZ = z + 6;
  const points = React.useMemo(
    () => ringPoints(props.object.ringRadius),
    [props.object.ringRadius]);
  useFrame((_state, delta) => {
    if (ringRef.current) { ringRef.current.rotation.z += delta * 1.5; }
  });
  return <Group name={"selected-object-overlay"}>
    <Group
      ref={ringRef}
      position={[x, y, lineZ]}>
      <Line
        name={"selected-object-ring"}
        points={points}
        color={"white"}
        transparent={true}
        opacity={0.95}
        lineWidth={2}
        dashed={true}
        dashSize={14}
        gapSize={10} />
    </Group>
    {props.showCrosshairs &&
      <Line
        name={"selected-object-x-crosshair"}
        points={[[zero.x, y, lineZ], [extents.x, y, lineZ]]}
        color={"white"}
        transparent={true}
        opacity={0.85}
        lineWidth={1.5} />}
    {props.showCrosshairs &&
      <Line
        name={"selected-object-y-crosshair"}
        points={[[x, zero.y, lineZ], [x, extents.y, lineZ]]}
        color={"white"}
        transparent={true}
        opacity={0.85}
        lineWidth={1.5} />}
  </Group>;
};
