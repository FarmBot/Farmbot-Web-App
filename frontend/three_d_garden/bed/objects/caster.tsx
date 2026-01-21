import React from "react";
import { Extrude, Cylinder } from "@react-three/drei";
import { Shape } from "three";
import { Config } from "../../config";
import { Group, MeshPhongMaterial } from "../../components";

export interface CasterProps {
  config: Config;
}

export const Caster = React.memo((props: CasterProps) => {
  const {
    bedHeight, bedZOffset, legSize, legsFlush,
  } = props.config;
  const casterHeight = React.useMemo(() => legSize * 1.375, [legSize]);
  const casterBracketShape = React.useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(legSize, 0);
    shape.lineTo(legSize / 3 * 2, -legSize);
    shape.lineTo(legSize / 3, -legSize);
    shape.lineTo(0, 0);
    return shape;
  }, [legSize]);
  const casterBracketArgs = React.useMemo(() => ([
    casterBracketShape,
    { steps: 1, depth: legSize, bevelEnabled: false },
  ] as [Shape, { steps: number, depth: number, bevelEnabled: boolean }]), [
    casterBracketShape,
    legSize,
  ]);
  const casterPosition = React.useMemo<[number, number, number]>(() => ([
    -legSize / 2,
    legSize / 2,
    (-bedZOffset - (legsFlush ? bedHeight : 0) + casterHeight) / 2,
  ]), [bedHeight, bedZOffset, casterHeight, legSize, legsFlush]);
  const casterRotation = React.useMemo<[number, number, number]>(
    () => [Math.PI / 2, 0, 0], []);
  const wheelPosition = React.useMemo<[number, number, number]>(() => ([
    legSize / 2,
    -legSize * 0.75,
    legSize / 2,
  ]), [legSize]);
  const wheelRotation = React.useMemo<[number, number, number]>(
    () => [Math.PI / 2, 0, 0], []);
  const wheelArgs = React.useMemo<[number, number, number]>(
    () => [legSize * 0.625, legSize * 0.625, legSize / 3],
    [legSize],
  );
  const axleArgs = React.useMemo<[number, number, number]>(
    () => [legSize / 10, legSize / 10, legSize * 1.1],
    [legSize],
  );
  return <Group name={"caster"}
    position={casterPosition}
    rotation={casterRotation}>
    <Extrude name={"caster-bracket"}
      castShadow={true}
      receiveShadow={true}
      args={casterBracketArgs}>
      <MeshPhongMaterial color={"silver"} />
    </Extrude>
    <Group name={"caster-wheel"}
      position={wheelPosition}
      rotation={wheelRotation}>
      <Cylinder name={"wheel"}
        castShadow={true}
        receiveShadow={true}
        args={wheelArgs}>
        <MeshPhongMaterial color={"#434343"} />
      </Cylinder>
      <Cylinder name={"axle"}
        castShadow={true}
        receiveShadow={true}
        args={axleArgs}>
        <MeshPhongMaterial color={"#434343"} />
      </Cylinder>
    </Group>
  </Group>;
});
