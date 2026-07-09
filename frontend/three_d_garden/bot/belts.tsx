import React from "react";
import { Extrude } from "@react-three/drei";
import { type ExtrudeGeometryOptions, Shape } from "three";
import { Group, MeshPhongMaterial } from "../components";
import { BeltPath, type BeltPathSegment } from "./belt_path";

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

const beltArgs = (segments: BeltPathSegment[]): BeltArgs[] =>
  segments.map(segment => [
    beltProfile,
    {
      steps: segment.steps,
      bevelEnabled: false,
      extrudePath: segment.path,
    },
  ]);

interface BeltProps {
  args: BeltArgs[];
  name: "x1Belt" | "x2Belt" | "yBelt";
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

interface YAxisBeltProps {
  botSizeY: number;
  y: number;
  position: [number, number, number];
}

export const YAxisBelt = (props: YAxisBeltProps) => {
  const args = React.useMemo(() => {
    const radius = 12;
    const path = new BeltPath();
    path.start(0, 0, 0);
    path.pulley(0, props.y + 25, 12, radius, -1);
    path.pulley(0, props.y + 40.5, 46, 7.5, 1);
    path.pulley(0, props.y + 105, 12, radius, -1);
    path.end(0, props.botSizeY + 220, 0);
    return beltArgs(path.getSegments());
  }, [props.botSizeY, props.y]);
  return <Belt name={"yBelt"}
    args={args}
    position={props.position} />;
};

interface XAxisBeltProps {
  name: "x1Belt" | "x2Belt";
  position: [number, number, number];
  length: number;
  x: number;
  columnLength: number;
}

export const XAxisBelt = (props: XAxisBeltProps) => {
  const args = React.useMemo(() => {
    const path = new BeltPath();
    path.start(0, 0, 0);
    path.pulley(props.x + 49, 0, 12, 12, -1);
    path.pulley(props.x + 69, 0, props.columnLength + 55, 8, 1);
    path.pulley(props.x + 89, 0, 12, 12, -1);
    path.end(props.length, 0, 0);
    return beltArgs(path.getSegments());
  }, [props.columnLength, props.length, props.x]);
  return <Belt name={props.name}
    args={args}
    position={props.position} />;
};
