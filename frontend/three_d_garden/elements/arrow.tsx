import React from "react";
import { Extrude } from "@react-three/drei";
import { Shape } from "three";
import { MeshPhongMaterial } from "../components";

export interface ArrowProps {
  length: number;
  width: number;
  rotation?: [number, number, number];
}

const arrow2D =
  (length: number, width: number) => {
    const path = new Shape();
    path.moveTo(0, -width / 2);
    path.lineTo(length - (width * 4), -width / 2);
    path.lineTo(length - (width * 4), -width * 1.5);
    path.lineTo(length, 0);
    path.lineTo(length - (width * 4), width * 1.5);
    path.lineTo(length - (width * 4), width / 2);
    path.lineTo(0, width / 2);
    path.moveTo(0, -width / 2);
    return path;
  };

const sameRotation = (
  prev: ArrowProps["rotation"],
  next: ArrowProps["rotation"],
) =>
  prev === next ||
  (!!prev && !!next &&
    prev[0] === next[0] &&
    prev[1] === next[1] &&
    prev[2] === next[2]);

export const arrowPropsEqual = (prev: ArrowProps, next: ArrowProps) =>
  prev.length === next.length &&
  prev.width === next.width &&
  sameRotation(prev.rotation, next.rotation);

const ArrowBase = (props: ArrowProps) => {
  const args = React.useMemo(() => [
    arrow2D(props.length, props.width),
    { steps: 1, depth: 10, bevelEnabled: false },
  ] as const, [props.length, props.width]);

  return <Extrude name={"arrow"}
    args={args}
    receiveShadow={true}
    rotation={props.rotation}>
    <MeshPhongMaterial color={"#ccc"} />
  </Extrude>;
};

export const Arrow = React.memo(ArrowBase, arrowPropsEqual);
