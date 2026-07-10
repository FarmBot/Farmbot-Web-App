import React from "react";
import { Extrude } from "@react-three/drei";
import { type ExtrudeGeometryOptions, Shape } from "three";
import { Group, MeshPhongMaterial } from "../components";
import { BeltPath } from "./belt_path";

const beltThickness = 1.5;
const beltWidth = 5;
const distinguishableBlack = "#333";
const beltProfile = new Shape();
beltProfile.moveTo(-beltWidth / 2, -beltThickness / 2);
beltProfile.lineTo(beltWidth / 2, -beltThickness / 2);
beltProfile.lineTo(beltWidth / 2, beltThickness / 2);
beltProfile.lineTo(-beltWidth / 2, beltThickness / 2);
beltProfile.closePath();

type BeltArgs = [Shape, ExtrudeGeometryOptions];

const beltArgs = (path: BeltPath): BeltArgs[] =>
  path.getSegments().map(segment => [
    beltProfile,
    {
      steps: segment.steps,
      bevelEnabled: false,
      extrudePath: segment.path,
    },
  ]);

interface BeltProps {
  args: BeltArgs[];
  name: "x1Belt" | "x2Belt" | "yBelt" | "zBelt";
  position: [number, number, number];
}

const Belt = (props: BeltProps) =>
  <Group name={props.name} position={props.position}>
    {props.args.map((args, index) =>
      <Extrude key={index}
        name={`${props.name}Segment${index}`}
        args={args}>
        <MeshPhongMaterial color={distinguishableBlack} />
      </Extrude>)}
  </Group>;

interface XAxisBeltProps {
  columnLength: number;
  kitVersion?: string;
  length: number;
  name: "x1Belt" | "x2Belt";
  position: [number, number, number];
  x: number;
}

const xAxisBeltPath = (
  columnLength: number,
  length: number,
  x: number,
) => {
  const path = new BeltPath();
  path.start(0, 0, 0);
  path.pulley(x + 50, 0, 12, 12, -1);
  path.pulley(x + 70, 0, columnLength + 55, 8, 1);
  path.pulley(x + 90, 0, 12, 12, -1);
  path.end(length, 0, 0);
  return path;
};

const xAxisBeltPathV19 = (
  length: number,
  x: number,
) => {
  const path = new BeltPath();
  path.start(0, 0, 0);
  path.pulley(x + 50, 0, 12, 12, -1);
  path.pulley(x + 70, 0, 45, 8, 1);
  path.pulley(x + 90, 0, 12, 12, -1);
  path.end(length, 0, 0);
  return path;
};

export const XAxisBelt = (props: XAxisBeltProps) => {
  const args = React.useMemo(() => {
    const path = props.kitVersion == "v1.9"
      ? xAxisBeltPathV19(props.length, props.x)
      : xAxisBeltPath(props.columnLength, props.length, props.x);
    return beltArgs(path);
  }, [props.columnLength, props.kitVersion, props.length, props.x]);
  return <Belt name={props.name}
    args={args}
    position={props.position} />;
};

interface YAxisBeltProps {
  beamLength: number;
  botSizeY: number;
  kitVersion?: string;
  y: number;
  position: [number, number, number];
}

const yAxisBeltPath = (botSizeY: number, y: number) => {
  const radius = 12;
  const path = new BeltPath();
  path.start(0, 0, 0);
  path.pulley(0, y + 25, 12, radius, -1);
  path.pulley(0, y + 40.5, 46, 7.5, 1);
  path.pulley(0, y + 105, 12, radius, -1);
  path.end(0, botSizeY + 220, 0);
  return path;
};

const yAxisBeltPathV19 = (
  beamLength: number,
  y: number,
) => {
  const radius = 8;
  const zOffset = -20;
  const path = new BeltPath();
  path.start(0, y + 105, zOffset);
  path.pulley(0, 25, zOffset - radius, radius, -1);
  path.pulley(0, beamLength + 60, zOffset - radius, radius, -1);
  path.end(0, y + 190, zOffset);
  return path;
};

export const YAxisBelt = (props: YAxisBeltProps) => {
  const args = React.useMemo(() => {
    const path = props.kitVersion == "v1.9"
      ? yAxisBeltPathV19(props.beamLength, props.y)
      : yAxisBeltPath(props.botSizeY, props.y);
    return beltArgs(path);
  }, [props.beamLength, props.botSizeY, props.kitVersion, props.y]);
  return <Belt name={"yBelt"}
    args={args}
    position={props.position} />;
};

interface ZAxisBeltProps {
  botSizeY: number;
  botSizeZ: number;
  negativeZ: boolean;
  y: number;
  position: [number, number, number];
  z: number;
}

const zAxisBeltPathV19 = (
  botSizeY: number,
  botSizeZ: number,
  y: number,
  z: number,
) => {
  const radius = 7;
  const path = new BeltPath();
  path.start(0, botSizeY + 220, 0);
  path.pulley(0, y + 160, radius, radius, 1);
  path.pulley(0, y + 145, z + botSizeZ + 90, radius, -1);
  path.pulley(0, y + 130, radius, radius, 1);
  path.pulley(0, 20, -radius, radius, -1);
  path.pulley(0, 25, -radius - 104, radius, -1);
  path.pulley(0, 40, -radius - 104 + 49, radius, 1);
  path.pulley(0, y + 130, -60 - radius, radius, 1);
  path.pulley(0, y + 145, z - 155, radius, -1);
  path.pulley(0, y + 160, -60 - radius, radius, 1);
  path.end(0, botSizeY + 220, -60);
  return path;
};

export const ZAxisBelt = (props: ZAxisBeltProps) => {
  const args = React.useMemo(() => {
    const path = zAxisBeltPathV19(
      props.botSizeY,
      props.botSizeZ,
      props.y,
      props.negativeZ ? props.z : -props.z,
    );
    return beltArgs(path);
  }, [
    props.botSizeY,
    props.botSizeZ,
    props.negativeZ,
    props.y,
    props.z,
  ]);
  return <Belt name={"zBelt"}
    args={args}
    position={props.position} />;
};
