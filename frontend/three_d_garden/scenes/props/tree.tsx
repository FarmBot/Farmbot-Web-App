import React from "react";
import { Cone, Cylinder } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "../../components";

export interface TreeProps {
  size: [number, number, number];
}

export const TREE_BOUNDS: [number, number, number] = [1000, 1000, 2500];

const trunkRadius = 120;
const trunkHeight = 800;
const trunkColor = "#6b4423";
const foliageColor = "#1f4d2e";

const foliage: [number, number, number][] = [
  [500, 1200, 1100],
  [400, 1100, 1550],
  [300, 1000, 2000],
];

export const treePropsEqual = (prev: TreeProps, next: TreeProps) =>
  prev.size[0] === next.size[0] &&
  prev.size[1] === next.size[1] &&
  prev.size[2] === next.size[2];

const TreeBase = (props: TreeProps) => {
  const scale = React.useMemo(() => [
    props.size[0] / TREE_BOUNDS[0],
    props.size[1] / TREE_BOUNDS[1],
    props.size[2] / TREE_BOUNDS[2],
  ] as [number, number, number], [props.size]);
  const centerOffset = TREE_BOUNDS[2] / 2;

  return <Group name={"tree"} scale={scale}>
    <Group position={[0, 0, -centerOffset]}>
      <Cylinder
        name={"tree-trunk"}
        args={[trunkRadius, trunkRadius, trunkHeight, 16]}
        position={[0, 0, trunkHeight / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow={true}
        receiveShadow={true}>
        <MeshPhongMaterial color={trunkColor} />
      </Cylinder>
      <Group name={"tree-foliage"}>
        {foliage.map(([radius, height, z], index) =>
          <Cone
            name={"tree-foliage-layer"}
            key={index}
            args={[radius, height, 16]}
            position={[0, 0, z]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow={true}
            receiveShadow={true}>
            <MeshPhongMaterial color={foliageColor} />
          </Cone>)}
      </Group>
    </Group>
  </Group>;
};

export const Tree = React.memo(TreeBase, treePropsEqual);
