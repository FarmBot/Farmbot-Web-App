import React from "react";
import { Config } from "../config";
import { Mesh, MeshPhongMaterial } from "../components";
import { ASSETS, BigDistance } from "../constants";
import {
  CircleGeometry, Float32BufferAttribute, RepeatWrapping, type Side,
} from "three";
import { useTextureVariant } from "../texture_variants";
import { ThreeEvent } from "@react-three/fiber";
import { SECTION_CLIPPING_EXEMPT } from "../section";

export interface GroundProps {
  config: Config;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (e: ThreeEvent<MouseEvent>) => void;
}

interface GroundWrapperProps {
  sceneName: string;
  groundZ: number;
  geometry: CircleGeometry;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (e: ThreeEvent<MouseEvent>) => void;
  children: React.ReactElement;
}

const GroundWrapper = (props: GroundWrapperProps) =>
  <Mesh name={`ground ${props.sceneName}`}
    userData={{ [SECTION_CLIPPING_EXEMPT]: true }}
    receiveShadow={true}
    geometry={props.geometry}
    // eslint-disable-next-line no-null/no-null
    dispose={null}
    onClick={props.onClick}
    onPointerMove={props.onPointerMove}
    position={[0, 0, -props.groundZ]}>
    {props.children}
  </Mesh>;

const groundFade = 1;
const buildGroundGeometry = (radius: number, segments: number) => {
  const geometry = new CircleGeometry(radius, segments);
  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const t = Math.min(Math.sqrt(x * x + y * y) / radius, 1);
    const shade = 1 - t * groundFade;
    const offset = i * 3;
    colors[offset] = shade;
    colors[offset + 1] = shade;
    colors[offset + 2] = shade;
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
};

let lowDetailGroundGeometry: CircleGeometry | undefined;
let highDetailGroundGeometry: CircleGeometry | undefined;

const getLowDetailGroundGeometry = () => {
  lowDetailGroundGeometry ||= buildGroundGeometry(BigDistance.ground, 16);
  return lowDetailGroundGeometry;
};

const getHighDetailGroundGeometry = () => {
  highDetailGroundGeometry ||= buildGroundGeometry(BigDistance.ground, 64);
  return highDetailGroundGeometry;
};

const getGroundProperties = (sceneName: string) => {
  switch (sceneName) {
    case "Greenhouse":
      return {
        texture: ASSETS.textures.bricks,
        repeat: [30, 30] as [number, number],
        color: "#999",
        lowDetailColor: "#8c6f64",
      };
    case "Lab":
      return {
        texture: ASSETS.textures.concrete,
        repeat: [16, 24] as [number, number],
        color: "#aaa",
        lowDetailColor: "gray",
      };
    default:
      return {
        texture: ASSETS.textures.grass,
        repeat: [24, 24] as [number, number],
        color: "#ddd",
        lowDetailColor: "darkgreen",
      };
  }
};

interface TexturedGroundMaterialProps {
  sceneName: string;
  side?: Side;
  vertexColors?: boolean;
}

export const TexturedGroundMaterial = (
  props: TexturedGroundMaterialProps,
) => {
  const properties = getGroundProperties(props.sceneName);
  const texture = useTextureVariant(properties.texture, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: properties.repeat,
  });
  return <MeshPhongMaterial
    map={texture}
    color={properties.color}
    shininess={0}
    side={props.side}
    vertexColors={props.vertexColors} />;
};

const GroundBase = (props: GroundProps) => {
  if (!props.config.ground) { return <></>; }
  return <VisibleGround {...props} />;
};

const GROUND_CONFIG_FIELDS: (keyof Config)[] = [
  "bedHeight",
  "bedZOffset",
  "ground",
  "lowDetail",
  "scene",
];

export const groundPropsEqual = (prev: GroundProps, next: GroundProps) =>
  prev.onClick === next.onClick
  && prev.onPointerMove === next.onPointerMove
  && GROUND_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

export const Ground = React.memo(GroundBase, groundPropsEqual);

const VisibleGround = (props: GroundProps) => {
  const { config } = props;
  const groundZ = config.bedZOffset + config.bedHeight;
  const properties = getGroundProperties(config.scene);

  return <GroundWrapper
    sceneName={config.scene}
    groundZ={groundZ}
    onClick={props.onClick}
    onPointerMove={props.onPointerMove}
    geometry={config.lowDetail
      ? getLowDetailGroundGeometry()
      : getHighDetailGroundGeometry()}>
    {config.lowDetail
      ? <MeshPhongMaterial
        color={properties.lowDetailColor}
        shininess={0}
        vertexColors={true} />
      : <TexturedGroundMaterial
        sceneName={config.scene}
        vertexColors={true} />}
  </GroundWrapper>;
};
