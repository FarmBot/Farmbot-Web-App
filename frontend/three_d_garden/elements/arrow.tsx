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

export const Arrow = (props: ArrowProps) => {
  return <Extrude name={"arrow"}
    args={[
      arrow2D(props.length, props.width),
      { steps: 1, depth: 10, bevelEnabled: false },
    ]}
    receiveShadow={true}
    rotation={props.rotation}>
    <MeshPhongMaterial color={"#ccc"} />
  </Extrude>;
};
