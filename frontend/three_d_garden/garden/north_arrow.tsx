import React from "react";
import { Config } from "../config";
import { Extrude } from "@react-three/drei";
import { threeSpace } from "../helpers";
import { Group, MeshPhongMaterial } from "../components";
import { Shape } from "three";

export interface NorthArrowProps {
  config: Config;
}

export const NorthArrow = (props: NorthArrowProps) => {
  const {
    bedWidthOuter, bedLengthOuter, bedHeight, bedZOffset, heading,
  } = props.config;
  return <Group name={"north-arrow"}
    visible={props.config.north}
    scale={1.2}
    position={[
      threeSpace(0, bedLengthOuter),
      threeSpace(-500, bedWidthOuter),
      -bedHeight - bedZOffset,
    ]}
    rotation={[0, 0, (heading - 90) * Math.PI / 180]}>
    <Extrude
      args={[
        northArrowShape,
        { steps: 1, depth: 5 },
      ]}>
      <MeshPhongMaterial color={"silver"} />
    </Extrude>
    <Extrude
      args={[
        nShape,
        { steps: 1, depth: 2 },
      ]}
      position={[0, 0, 5]}>
      <MeshPhongMaterial color={"#434343"} />
    </Extrude>
  </Group>;
};

const northArrowShape = new Shape();

northArrowShape.moveTo(-30, 20);
northArrowShape.lineTo(-130, -200);
northArrowShape.lineTo(-30, -140);
northArrowShape.lineTo(70, -200);
northArrowShape.lineTo(-30, 20);

const nShape = new Shape();
nShape.moveTo(-50, -80);
nShape.lineTo(-50, -120);
nShape.lineTo(-40, -120);
nShape.lineTo(-40, -95);
nShape.lineTo(-20, -120);
nShape.lineTo(-10, -120);
nShape.lineTo(-10, -80);
nShape.lineTo(-20, -80);
nShape.lineTo(-20, -105);
nShape.lineTo(-40, -80);
nShape.lineTo(-50, -80);
