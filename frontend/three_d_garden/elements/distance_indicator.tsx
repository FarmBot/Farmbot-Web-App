import React from "react";
import { Box } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "../components";
import { Text } from "./text";
import { ControlArrow } from "../controls";

enum BoxDimension {
  width = 300,
  height = 100,
  depth = 75,
}

const depthOffset = BoxDimension.depth / 2 + 0.5;
const heightOffset = BoxDimension.height / 2 + 0.5;

interface Label {
  position: [number, number, number];
  rotation: [number, number, number];
}

const LABELS: Label[] = [
  { position: [0, 0, depthOffset], rotation: [0 * Math.PI / 2, 0, 0] },
  { position: [0, -heightOffset, 0], rotation: [1 * Math.PI / 2, 0, 0] },
  { position: [0, 0, -depthOffset], rotation: [2 * Math.PI / 2, 0, 0] },
  { position: [0, heightOffset, 0], rotation: [3 * Math.PI / 2, 0, 0] },
];

export interface DistanceIndicatorProps {
  start: Record<"x" | "y" | "z", number>;
  end: Record<"x" | "y" | "z", number>;
  visible?: boolean;
}

const samePoint = (
  prev: DistanceIndicatorProps["start"],
  next: DistanceIndicatorProps["start"],
) =>
  prev.x === next.x &&
  prev.y === next.y &&
  prev.z === next.z;

export const distanceIndicatorPropsEqual = (
  prev: DistanceIndicatorProps,
  next: DistanceIndicatorProps,
) =>
  prev.visible === next.visible &&
  samePoint(prev.start, next.start) &&
  samePoint(prev.end, next.end);

const DistanceIndicatorBase = (props: DistanceIndicatorProps) => {
  const { start, end } = props;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const midZ = (start.z + end.z) / 2;
  const angleY = Math.atan2(dz, dx);
  const angleZ = Math.atan2(dy, dx);
  return <Group visible={props.visible}
    position={[midX, midY, midZ]}
    rotation={[0, -angleY, angleZ]}>
    <ControlArrow name={"distance-arrow"}
      start={[-distance / 2, 0, 0]}
      end={[distance / 2, 0, 0]}
      width={25}
      heads={"both"}
      color={"#ccc"}
      enabled={false}
      depthTest={true}
      depthWrite={true} />
    <Group rotation={[Math.PI / 6, 0, 0]}>
      <Box
        args={[BoxDimension.width, BoxDimension.height, BoxDimension.depth]}
        receiveShadow={true}>
        <MeshPhongMaterial color={"#c49f7a"} />
      </Box>
      {LABELS.map(({ position, rotation }) =>
        <Text name={"distance-label"} key={JSON.stringify([position, rotation])}
          fontSize={50}
          color={"black"}
          rotation={rotation}
          position={position}>
          {distance.toFixed(0)}mm
        </Text>)}
    </Group>
  </Group>;
};

export const DistanceIndicator = React.memo(
  DistanceIndicatorBase,
  distanceIndicatorPropsEqual,
);
