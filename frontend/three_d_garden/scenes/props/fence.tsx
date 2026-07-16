import React from "react";
import { Box } from "@react-three/drei";
import { range } from "lodash";
import {
  ExtrudeGeometry, Float32BufferAttribute, RepeatWrapping, Shape,
} from "three";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { ASSETS } from "../../constants";
import { useTextureVariant } from "../../texture_variants";
import { SceneObject } from "farmbot/dist/resources/api_resources";

export interface FenceProps {
  size: [number, number, number];
  color: string;
  texture: SceneObject["texture"];
}

const BOARD_SPACING = 150;
const BOARD_GAP = 20;
const RAIL_HEIGHT = 100;

export interface FenceLayout {
  boardArgs: [number, number, number];
  boardPositions: [number, number, number][];
  railArgs: [number, number, number];
  railPositions: [number, number, number][];
}

export const fenceLayout = (
  size: [number, number, number],
): FenceLayout => {
  const xSize = Math.max(1, Math.abs(size[0]));
  const ySize = Math.max(1, Math.abs(size[1]));
  const zSize = Math.max(1, Math.abs(size[2]));
  const wideAlongY = ySize > xSize;
  const wideSize = wideAlongY ? ySize : xSize;
  const thinSize = wideAlongY ? xSize : ySize;
  const boardCount = Math.max(1, Math.ceil(wideSize / BOARD_SPACING));
  const boardStep = wideSize / boardCount;
  const boardWidth = Math.max(1, boardStep - BOARD_GAP);
  const boardArgs: [number, number, number] = wideAlongY
    ? [thinSize, boardWidth, zSize]
    : [boardWidth, thinSize, zSize];
  const boardPositions = range(boardCount).map(index => {
    const offset = -wideSize / 2 + boardStep * (index + 0.5);
    return wideAlongY
      ? [0, offset, 0] as [number, number, number]
      : [offset, 0, 0] as [number, number, number];
  });
  const railHeight = Math.min(RAIL_HEIGHT, zSize / 5);
  const railArgs: [number, number, number] = wideAlongY
    ? [thinSize / 2, wideSize, railHeight]
    : [wideSize, thinSize / 2, railHeight];
  const thinOffset = -thinSize / 4;
  const railPositions = [-zSize / 4, zSize / 4].map(z =>
    wideAlongY
      ? [thinOffset, 0, z] as [number, number, number]
      : [0, thinOffset, z] as [number, number, number]);

  return { boardArgs, boardPositions, railArgs, railPositions };
};

export const fenceBoardGeometry = (
  width: number,
  height: number,
  depth: number,
  wideAlongY = false,
) => {
  const chamfer = Math.min(width / 4, height / 12, 40);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const shape = new Shape();
  shape.moveTo(-halfWidth, -halfHeight);
  shape.lineTo(halfWidth, -halfHeight);
  shape.lineTo(halfWidth, halfHeight - chamfer);
  shape.lineTo(halfWidth - chamfer, halfHeight);
  shape.lineTo(-halfWidth + chamfer, halfHeight);
  shape.lineTo(-halfWidth, halfHeight - chamfer);
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  });
  const positions = geometry.getAttribute("position");
  const uvs = new Float32Array(positions.count * 2);
  for (let index = 0; index < positions.count; index++) {
    const uvIndex = index * 2;
    uvs[uvIndex] = (positions.getX(index) + halfWidth) / width;
    uvs[uvIndex + 1] = (positions.getY(index) + halfHeight) / height;
  }
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.translate(0, 0, -depth / 2);
  geometry.rotateX(Math.PI / 2);
  wideAlongY && geometry.rotateZ(Math.PI / 2);
  return geometry;
};

export const fencePropsEqual = (prev: FenceProps, next: FenceProps) =>
  prev.color === next.color &&
  prev.texture === next.texture &&
  prev.size[0] === next.size[0] &&
  prev.size[1] === next.size[1] &&
  prev.size[2] === next.size[2];

const FenceBase = (props: FenceProps) => {
  const layout = React.useMemo(() => fenceLayout(props.size), [props.size]);
  const wideAlongY = Math.abs(props.size[1]) > Math.abs(props.size[0]);
  const boardWidth = wideAlongY
    ? layout.boardArgs[1]
    : layout.boardArgs[0];
  const boardDepth = wideAlongY
    ? layout.boardArgs[0]
    : layout.boardArgs[1];
  const boardHeight = layout.boardArgs[2];
  const boardGeometry = React.useMemo(() => fenceBoardGeometry(
    boardWidth, boardHeight, boardDepth, wideAlongY), [
    boardDepth,
    boardHeight,
    boardWidth,
    wideAlongY,
  ]);
  React.useEffect(() => () => boardGeometry.dispose(), [boardGeometry]);
  const textureUrl = props.texture === "none"
    ? ASSETS.textures.wood
    : ASSETS.textures[props.texture];
  const objectTexture = useTextureVariant(textureUrl, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.5, 0.5],
  });

  return <Group name={"fence"}>
    <Group name={"fence-boards"}>
      {layout.boardPositions.map((position, index) =>
        <Mesh
          name={"fence-board"}
          key={index}
          geometry={boardGeometry}
          // eslint-disable-next-line no-null/no-null
          dispose={null}
          position={position}
          castShadow={true}
          receiveShadow={true}>
          <MeshPhongMaterial
            map={props.texture === "none" ? undefined : objectTexture}
            color={props.color} />
        </Mesh>)}
    </Group>
    <Group name={"fence-rails"}>
      {layout.railPositions.map((position, index) =>
        <Box
          name={"fence-rail"}
          key={index}
          args={layout.railArgs}
          position={position}
          castShadow={true}
          receiveShadow={true}>
          <MeshPhongMaterial
            map={props.texture === "none" ? undefined : objectTexture}
            color={props.color} />
        </Box>)}
    </Group>
  </Group>;
};

export const Fence = React.memo(FenceBase, fencePropsEqual);
