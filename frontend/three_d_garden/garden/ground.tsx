import React from "react";
import { Config, detailLevels } from "../config";
import { Detailed, useTexture } from "@react-three/drei";
import { Mesh, MeshPhongMaterial } from "../components";
import { ASSETS, BigDistance } from "../constants";
import { CircleGeometry, Float32BufferAttribute, RepeatWrapping } from "three";

export interface GroundProps {
  config: Config;
}

const groundFade = 1;
const buildGroundGeometry = (radius: number, segments: number) => {
  const geometry = new CircleGeometry(radius, segments);
  const positions = geometry.attributes.position;
  const colors: number[] = [];
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const t = Math.min(Math.sqrt(x * x + y * y) / radius, 1);
    const shade = 1 - t * groundFade;
    colors.push(shade, shade, shade);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
};

export const Ground = (props: GroundProps) => {
  const { config } = props;
  const groundZ = config.bedZOffset + config.bedHeight;

  const grassTexture = useTexture(ASSETS.textures.grass + "?=grass");
  grassTexture.wrapS = RepeatWrapping;
  grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(24, 24);
  const labFloorTexture = useTexture(ASSETS.textures.concrete + "?=labFloor");
  labFloorTexture.wrapS = RepeatWrapping;
  labFloorTexture.wrapT = RepeatWrapping;
  labFloorTexture.repeat.set(16, 24);
  const brickTexture = useTexture(ASSETS.textures.bricks + "?=bricks");
  brickTexture.wrapS = RepeatWrapping;
  brickTexture.wrapT = RepeatWrapping;
  brickTexture.repeat.set(30, 30);

  const getGroundProperties = (sceneName: string) => {
    switch (sceneName) {
      case "Greenhouse":
        return { texture: brickTexture, color: "#999", lowDetailColor: "#8c6f64" };
      case "Lab":
        return { texture: labFloorTexture, color: "#aaa", lowDetailColor: "gray" };
      default:
        return { texture: grassTexture, color: "#ddd", lowDetailColor: "darkgreen" };
    }
  };

  const groundProperties = getGroundProperties(config.scene);

  const highDetailGeometry = React.useMemo(
    () => buildGroundGeometry(BigDistance.ground, 64),
    [],
  );
  const lowDetailGeometry = React.useMemo(
    () => buildGroundGeometry(BigDistance.ground, 16),
    [],
  );

  const GroundWrapper = ({
    geometry,
    children,
  }: {
    geometry: CircleGeometry;
    children: React.ReactElement;
  }) =>
    <Mesh name={`ground ${config.scene}`}
      receiveShadow={true}
      geometry={geometry}
      position={[0, 0, -groundZ]}>
      {children}
    </Mesh>;

  return <Detailed distances={detailLevels(config)}
    visible={config.ground}>
    <GroundWrapper geometry={highDetailGeometry}>
      <MeshPhongMaterial
        map={groundProperties.texture}
        color={groundProperties.color}
        shininess={0}
        vertexColors={true} />
    </GroundWrapper>
    <GroundWrapper geometry={lowDetailGeometry}>
      <MeshPhongMaterial
        color={groundProperties.lowDetailColor}
        shininess={0}
        vertexColors={true} />
    </GroundWrapper>
  </Detailed>;
};
