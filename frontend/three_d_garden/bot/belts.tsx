import React from "react";
import {
  BufferGeometry, ExtrudeGeometry, Group as ThreeGroup,
  Shape,
} from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from
  "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Group, Mesh, MeshPhongMaterial } from "../components";
import { BeltPath, InvalidBeltPathError } from "./belt_path";
import { getBotVersion } from "./bot_versions";
import {
  millimetreGeometryKey, useOwnedBufferGeometries,
} from "./components/owned_extrude_geometry";
import { PositionConfig } from "../config";
import { perfCount } from "../../performance/perf";
import { MutableBeltGeometry } from
  "./components/mutable_routing_geometry";

const beltThickness = 1.5;
const beltWidth = 5;
const distinguishableBlack = "#333";
const beltProfile = new Shape();
beltProfile.moveTo(-beltWidth / 2, -beltThickness / 2);
beltProfile.lineTo(beltWidth / 2, -beltThickness / 2);
beltProfile.lineTo(beltWidth / 2, beltThickness / 2);
beltProfile.lineTo(-beltWidth / 2, beltThickness / 2);
beltProfile.closePath();

export const buildBeltGeometry = (path: BeltPath): BufferGeometry => {
  const segments = path.getSegments();
  const segmentGeometries = segments.map(segment =>
    new ExtrudeGeometry(beltProfile, {
      steps: segment.steps,
      bevelEnabled: false,
      extrudePath: segment.path,
    }));
  const geometry = mergeGeometries(segmentGeometries);
  segmentGeometries.forEach(segment => segment.dispose());
  if (!geometry) { throw new Error("Failed to merge belt geometry."); }
  return geometry;
};

interface BeltProps {
  geometries: BufferGeometry[];
  name: "x1Belt" | "x2Belt" | "yBelt" | "zBelt";
  position: [number, number, number];
}

const Belt = (props: BeltProps) =>
  <Group name={props.name} position={props.position}>
    {props.geometries.map((geometry, index) =>
      <Mesh key={index}
        name={`${props.name}Segment${index}`}
        geometry={geometry}>
        <MeshPhongMaterial color={distinguishableBlack} />
      </Mesh>)}
  </Group>;

interface FrameBeltProps {
  createPath(position: PositionConfig): BeltPath;
  deformationKey(position: PositionConfig): string;
  getPositions(position: PositionConfig): [number, number, number][];
  metric: string;
  names: BeltProps["name"][];
  positionRef: React.MutableRefObject<PositionConfig>;
}

const FrameBelt = (props: FrameBeltProps) => {
  const initialPosition = props.positionRef.current;
  const [initialGeometry] = React.useState(() => {
    perfCount(props.metric);
    try {
      return new MutableBeltGeometry(props.createPath(initialPosition));
    } catch (error) {
      if (!(error instanceof InvalidBeltPathError)) { throw error; }
      return new MutableBeltGeometry(props.createPath({ x: 0, y: 0, z: 0 }));
    }
  });
  const lastDeformationKey = React.useRef(
    props.deformationKey(initialPosition),
  );
  const groupRefs = React.useRef<(ThreeGroup | null)[]>([]);

  useFrame(() => {
    const position = props.positionRef.current;
    props.getPositions(position).forEach((next, index) => {
      groupRefs.current[index]?.position.set(...next);
    });
    const deformationKey = props.deformationKey(position);
    if (deformationKey === lastDeformationKey.current) { return; }
    perfCount(`${props.metric}.update`);
    try {
      initialGeometry.update(props.createPath(position));
      lastDeformationKey.current = deformationKey;
    } catch (error) {
      if (!(error instanceof InvalidBeltPathError)) {
        throw error;
      }
    }
  });

  React.useLayoutEffect(() => () => {
    perfCount(`${props.metric}.dispose`);
    initialGeometry.dispose();
  }, [initialGeometry, props.metric]);

  const positions = props.getPositions(initialPosition);
  return <>{props.names.map((name, index) =>
    <Group key={name}
      ref={group => {
        groupRefs.current[index] = group as ThreeGroup | null;
      }}
      name={name}
      position={positions[index]}>
      <Mesh name={`${name}Segment0`} geometry={initialGeometry}>
        <MeshPhongMaterial color={distinguishableBlack} />
      </Mesh>
    </Group>)}</>;
};

const samePosition = (
  prev: [number, number, number],
  next: [number, number, number],
) => prev[0] === next[0] && prev[1] === next[1] && prev[2] === next[2];

export interface XAxisBeltProps {
  columnLength: number;
  kitVersion?: string;
  length: number;
  name: "x1Belt" | "x2Belt";
  position: [number, number, number];
  positionRef?: React.MutableRefObject<PositionConfig>;
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

export const buildXAxisBeltPath = (
  kitVersion: string,
  columnLength: number,
  length: number,
  x: number,
) => getBotVersion(kitVersion).beltRouting == "v1.9"
  ? xAxisBeltPathV19(length, x)
  : xAxisBeltPath(columnLength, length, x);

const StaticXAxisBelt = (props: XAxisBeltProps) => {
  const createGeometries = React.useCallback(() =>
    [buildBeltGeometry(buildXAxisBeltPath(
      props.kitVersion || "v1.8",
      props.columnLength,
      props.length,
      props.x,
    ))], [props.columnLength, props.kitVersion, props.length, props.x]);
  const key = millimetreGeometryKey([
    props.kitVersion,
    props.columnLength,
    props.length,
  ].join(":"), props.x);
  const geometries = useOwnedBufferGeometries(
    key,
    createGeometries,
    "bot.geometry.belt.x",
  );
  return <Belt name={props.name}
    geometries={geometries}
    position={props.position} />;
};

const XAxisBeltBase = (props: XAxisBeltProps) => props.positionRef
  ? <FrameBelt key={[
    props.name,
    props.kitVersion,
    props.columnLength,
    props.length,
  ].join(":")}
  createPath={position => buildXAxisBeltPath(
    props.kitVersion || "v1.8",
    props.columnLength,
    props.length,
    position.x,
  )}
  deformationKey={position => `${position.x}`}
  getPositions={() => [props.position]}
  metric={"bot.geometry.belt.x"}
  names={[props.name]}
  positionRef={props.positionRef} />
  : <StaticXAxisBelt {...props} />;

export const xAxisBeltPropsEqual = (
  prev: XAxisBeltProps,
  next: XAxisBeltProps,
) => prev.columnLength === next.columnLength &&
  prev.kitVersion === next.kitVersion && prev.length === next.length &&
  prev.name === next.name && prev.positionRef === next.positionRef &&
  (!!prev.positionRef || prev.x === next.x) &&
  samePosition(prev.position, next.position);

export const XAxisBelt = React.memo(XAxisBeltBase, xAxisBeltPropsEqual);

export interface XAxisBeltPairProps {
  columnLength: number;
  kitVersion?: string;
  length: number;
  positions: [
    [number, number, number],
    [number, number, number],
  ];
  positionRef?: React.MutableRefObject<PositionConfig>;
  x: number;
}

const StaticXAxisBeltPair = (props: XAxisBeltPairProps) => {
  const createGeometries = React.useCallback(() =>
    [buildBeltGeometry(buildXAxisBeltPath(
      props.kitVersion || "v1.8",
      props.columnLength,
      props.length,
      props.x,
    ))], [props.columnLength, props.kitVersion, props.length, props.x]);
  const key = millimetreGeometryKey([
    props.kitVersion,
    props.columnLength,
    props.length,
  ].join(":"), props.x);
  const geometries = useOwnedBufferGeometries(
    key,
    createGeometries,
    "bot.geometry.belt.x",
  );
  return <>
    <Belt name={"x1Belt"}
      geometries={geometries}
      position={props.positions[0]} />
    <Belt name={"x2Belt"}
      geometries={geometries}
      position={props.positions[1]} />
  </>;
};

const XAxisBeltPairBase = (props: XAxisBeltPairProps) => props.positionRef
  ? <FrameBelt key={[
    props.kitVersion,
    props.columnLength,
    props.length,
  ].join(":")}
  createPath={position => buildXAxisBeltPath(
    props.kitVersion || "v1.8",
    props.columnLength,
    props.length,
    position.x,
  )}
  deformationKey={position => `${position.x}`}
  getPositions={() => props.positions}
  metric={"bot.geometry.belt.x"}
  names={["x1Belt", "x2Belt"]}
  positionRef={props.positionRef} />
  : <StaticXAxisBeltPair {...props} />;

export const xAxisBeltPairPropsEqual = (
  prev: XAxisBeltPairProps,
  next: XAxisBeltPairProps,
) => prev.columnLength === next.columnLength &&
  prev.kitVersion === next.kitVersion && prev.length === next.length &&
  prev.positionRef === next.positionRef &&
  (!!prev.positionRef || prev.x === next.x) &&
  samePosition(prev.positions[0], next.positions[0]) &&
  samePosition(prev.positions[1], next.positions[1]);

export const XAxisBeltPair = React.memo(
  XAxisBeltPairBase,
  xAxisBeltPairPropsEqual,
);

export interface YAxisBeltProps {
  beamLength: number;
  botSizeY: number;
  kitVersion?: string;
  position: [number, number, number];
  positionRef?: React.MutableRefObject<PositionConfig>;
  y: number;
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

export const buildYAxisBeltPath = (
  kitVersion: string,
  beamLength: number,
  botSizeY: number,
  y: number,
) => getBotVersion(kitVersion).beltRouting == "v1.9"
  ? yAxisBeltPathV19(beamLength, y)
  : yAxisBeltPath(botSizeY, y);

const StaticYAxisBelt = (props: YAxisBeltProps) => {
  const createGeometries = React.useCallback(() =>
    [buildBeltGeometry(buildYAxisBeltPath(
      props.kitVersion || "v1.8",
      props.beamLength,
      props.botSizeY,
      props.y,
    ))], [props.beamLength, props.botSizeY, props.kitVersion, props.y]);
  const key = millimetreGeometryKey([
    props.kitVersion,
    props.beamLength,
    props.botSizeY,
  ].join(":"), props.y);
  const geometries = useOwnedBufferGeometries(
    key,
    createGeometries,
    "bot.geometry.belt.y",
  );
  return <Belt name={"yBelt"}
    geometries={geometries}
    position={props.position} />;
};

const YAxisBeltBase = (props: YAxisBeltProps) => {
  const xOffset = props.positionRef
    ? props.position[0] - props.positionRef.current.x
    : 0;
  return props.positionRef
    ? <FrameBelt key={[
      props.kitVersion,
      props.beamLength,
      props.botSizeY,
    ].join(":")}
    createPath={position => buildYAxisBeltPath(
      props.kitVersion || "v1.8",
      props.beamLength,
      props.botSizeY,
      position.y,
    )}
    deformationKey={position => `${position.y}`}
    getPositions={position => [[
      position.x + xOffset,
      props.position[1],
      props.position[2],
    ]]}
    metric={"bot.geometry.belt.y"}
    names={["yBelt"]}
    positionRef={props.positionRef} />
    : <StaticYAxisBelt {...props} />;
};

export const yAxisBeltPropsEqual = (
  prev: YAxisBeltProps,
  next: YAxisBeltProps,
) => prev.beamLength === next.beamLength &&
  prev.botSizeY === next.botSizeY &&
  prev.kitVersion === next.kitVersion &&
  prev.positionRef === next.positionRef &&
  (!!prev.positionRef || prev.y === next.y) &&
  (prev.positionRef
    ? prev.position[1] === next.position[1] &&
      prev.position[2] === next.position[2]
    : samePosition(prev.position, next.position));

export const YAxisBelt = React.memo(YAxisBeltBase, yAxisBeltPropsEqual);

export interface ZAxisBeltProps {
  botSizeY: number;
  botSizeZ: number;
  negativeZ: boolean;
  position: [number, number, number];
  positionRef?: React.MutableRefObject<PositionConfig>;
  y: number;
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

export const buildZAxisBeltPath = (
  botSizeY: number,
  botSizeZ: number,
  y: number,
  z: number,
) => zAxisBeltPathV19(botSizeY, botSizeZ, y, z);

const StaticZAxisBelt = (props: ZAxisBeltProps) => {
  const createGeometries = React.useCallback(() => {
    const path = buildZAxisBeltPath(
      props.botSizeY,
      props.botSizeZ,
      props.y,
      props.negativeZ ? props.z : -props.z,
    );
    return [buildBeltGeometry(path)];
  }, [
    props.botSizeY,
    props.botSizeZ,
    props.negativeZ,
    props.y,
    props.z,
  ]);
  const key = millimetreGeometryKey([
    props.botSizeY,
    props.botSizeZ,
    Number(props.negativeZ),
  ].join(":"), props.y, props.z);
  const geometries = useOwnedBufferGeometries(
    key,
    createGeometries,
    "bot.geometry.belt.z",
  );
  return <Belt name={"zBelt"}
    geometries={geometries}
    position={props.position} />;
};

const ZAxisBeltBase = (props: ZAxisBeltProps) => {
  const xOffset = props.positionRef
    ? props.position[0] - props.positionRef.current.x
    : 0;
  return props.positionRef
    ? <FrameBelt key={[
      props.botSizeY,
      props.botSizeZ,
      Number(props.negativeZ),
    ].join(":")}
    createPath={position => buildZAxisBeltPath(
      props.botSizeY,
      props.botSizeZ,
      position.y,
      props.negativeZ ? position.z : -position.z,
    )}
    deformationKey={position => `${position.y}:${position.z}`}
    getPositions={position => [[
      position.x + xOffset,
      props.position[1],
      props.position[2],
    ]]}
    metric={"bot.geometry.belt.z"}
    names={["zBelt"]}
    positionRef={props.positionRef} />
    : <StaticZAxisBelt {...props} />;
};

export const zAxisBeltPropsEqual = (
  prev: ZAxisBeltProps,
  next: ZAxisBeltProps,
) => prev.botSizeY === next.botSizeY &&
  prev.botSizeZ === next.botSizeZ &&
  prev.negativeZ === next.negativeZ &&
  prev.positionRef === next.positionRef &&
  (!!prev.positionRef || prev.y === next.y && prev.z === next.z) &&
  (prev.positionRef
    ? prev.position[1] === next.position[1] &&
      prev.position[2] === next.position[2]
    : samePosition(prev.position, next.position));

export const ZAxisBelt = React.memo(ZAxisBeltBase, zAxisBeltPropsEqual);
