import React from "react";
import { Config, detailLevels } from "../config";
import { Detailed, useTexture } from "@react-three/drei";
import { Mesh, MeshPhongMaterial } from "../components";
import { ASSETS, BigDistance } from "../constants";
import { CircleGeometry, Float32BufferAttribute, RepeatWrapping } from "three";

export interface GroundProps {
  config: Config;
}

interface GroundWrapperProps {
  sceneName: string;
  groundZ: number;
  geometry: CircleGeometry;
  children: React.ReactElement;
}

const GroundWrapper = (props: GroundWrapperProps) =>
  <Mesh name={`ground ${props.sceneName}`}
    receiveShadow={true}
    geometry={props.geometry}
    position={[0, 0, -props.groundZ]}>
    {props.children}
  </Mesh>;

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

  const grassTextureBase = useTexture(ASSETS.textures.grass + "?=grass");
  const grassTexture = React.useMemo(() => {
    const texture = grassTextureBase.clone();
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(24, 24);
    return texture;
  }, [grassTextureBase]);
  const labFloorTextureBase = useTexture(ASSETS.textures.concrete + "?=labFloor");
  const labFloorTexture = React.useMemo(() => {
    const texture = labFloorTextureBase.clone();
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(16, 24);
    return texture;
  }, [labFloorTextureBase]);
  const brickTextureBase = useTexture(ASSETS.textures.bricks + "?=bricks");
  const brickTexture = React.useMemo(() => {
    const texture = brickTextureBase.clone();
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(30, 30);
    return texture;
  }, [brickTextureBase]);

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
  const common = { sceneName: config.scene, groundZ };

  return <Detailed distances={detailLevels(config)}
    visible={config.ground}>
    <GroundWrapper {...common} geometry={highDetailGeometry}>
      <MeshPhongMaterial
        map={groundProperties.texture}
        color={groundProperties.color}
        shininess={0}
        vertexColors={true} />
    </GroundWrapper>
    <GroundWrapper {...common} geometry={lowDetailGeometry}>
      <MeshPhongMaterial
        color={groundProperties.lowDetailColor}
        shininess={0}
        vertexColors={true} />
    </GroundWrapper>
  </Detailed>;
};
