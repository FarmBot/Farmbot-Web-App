import React from "react";
import { Config } from "../config";
import { Mesh, MeshPhongMaterial } from "../components";
import { ASSETS, BigDistance } from "../constants";
import {
  CylinderGeometry, DoubleSide, Float32BufferAttribute, RepeatWrapping,
  type Side,
} from "three";
import { useTextureVariant } from "../texture_variants";
import { ThreeEvent } from "@react-three/fiber";
import { SECTION_CLIPPING_EXEMPT } from "../section";

export interface GroundProps {
  config: Config;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (e: ThreeEvent<MouseEvent>) => void;
}

const GROUND_DEPTH = 25000;
const groundFade = 1;

export const GROUND_TEXTURE_URLS = [
  ASSETS.textures.grass,
  ASSETS.textures.bricks,
  ASSETS.textures.concrete,
  ASSETS.textures.water,
  ASSETS.textures.aluminum,
  ASSETS.textures.soil,
  ASSETS.textures.sand,
  ASSETS.textures.wood,
];

export const GROUND_TEXTURES = [
  "grass", "bricks", "concrete", "water",
  "aluminum", "soil", "sand", "wood",
];

interface GroundWrapperProps {
  groundTexture: string;
  groundZ: number;
  geometry: CylinderGeometry;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (e: ThreeEvent<MouseEvent>) => void;
  children: React.ReactElement;
}

const GroundWrapper = (props: GroundWrapperProps) =>
  <Mesh name={`ground ${props.groundTexture}`}
    userData={{ [SECTION_CLIPPING_EXEMPT]: true }}
    receiveShadow={true}
    geometry={props.geometry}
    // eslint-disable-next-line no-null/no-null
    dispose={null}
    onClick={props.onClick}
    onPointerMove={props.onPointerMove}
    position={[0, 0, -props.groundZ - GROUND_DEPTH / 2]}
    rotation={[Math.PI / 2, 0, 0]}>
    {props.children}
  </Mesh>;

const buildGroundGeometry = (radius: number, segments: number) => {
  const geometry = new CylinderGeometry(
    radius,
    radius,
    GROUND_DEPTH,
    segments,
  );
  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const t = Math.min(Math.sqrt(x * x + z * z) / radius, 1);
    const shade = 1 - t * groundFade;
    const offset = i * 3;
    colors[offset] = shade;
    colors[offset + 1] = shade;
    colors[offset + 2] = shade;
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
};

let lowDetailGroundGeometry: CylinderGeometry | undefined;
let highDetailGroundGeometry: CylinderGeometry | undefined;

const getLowDetailGroundGeometry = () => {
  lowDetailGroundGeometry ||= buildGroundGeometry(BigDistance.ground, 16);
  return lowDetailGroundGeometry;
};

const getHighDetailGroundGeometry = () => {
  highDetailGroundGeometry ||= buildGroundGeometry(BigDistance.ground, 64);
  return highDetailGroundGeometry;
};

const getGroundProperties = (groundTexture: string) => {
  switch (groundTexture) {
    case "bricks":
      return {
        texture: ASSETS.textures.bricks,
        repeat: [30, 30] as [number, number],
        color: "#999",
        lowDetailColor: "#8c6f64",
      };
    case "concrete":
      return {
        texture: ASSETS.textures.concrete,
        repeat: [16, 24] as [number, number],
        color: "#aaa",
        lowDetailColor: "gray",
      };
    case "water":
      return {
        texture: ASSETS.textures.water,
        repeat: [16, 24] as [number, number],
        color: "#00f",
        lowDetailColor: "blue",
      };
    case "aluminum":
      return {
        texture: ASSETS.textures.aluminum,
        repeat: [16, 24] as [number, number],
        color: "#aaa",
        lowDetailColor: "gray",
      };
    case "soil":
      return {
        texture: ASSETS.textures.soil,
        repeat: [16, 24] as [number, number],
        color: "#fff",
        lowDetailColor: "brown",
      };
    case "sand":
      return {
        texture: ASSETS.textures.sand,
        repeat: [16, 24] as [number, number],
        color: "#fff",
        lowDetailColor: "tan",
      };
    case "wood":
      return {
        texture: ASSETS.textures.wood,
        repeat: [16, 24] as [number, number],
        color: "#deb887",
        lowDetailColor: "saddlebrown",
      };
    case "grass":
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
  groundTexture: string;
  side?: Side;
  vertexColors?: boolean;
}

export const TexturedGroundMaterial = (
  props: TexturedGroundMaterialProps,
) => {
  const properties = getGroundProperties(props.groundTexture);
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
  "groundTexture",
];

export const groundPropsEqual = (prev: GroundProps, next: GroundProps) =>
  prev.onClick === next.onClick
  && prev.onPointerMove === next.onPointerMove
  && GROUND_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

export const Ground = React.memo(GroundBase, groundPropsEqual);

export const GroundTexturePreloader = (props: { config: Config }) =>
  <group name={"ground-texture-preloader"} visible={false}>
    {GROUND_TEXTURES.map(groundTexture =>
      <Ground
        key={groundTexture}
        config={{
          ...props.config,
          ground: true,
          groundTexture,
          lowDetail: false,
        }} />)}
  </group>;

const VisibleGround = (props: GroundProps) => {
  const { config } = props;
  const groundZ = config.bedZOffset + config.bedHeight;
  const properties = getGroundProperties(config.groundTexture);

  return <GroundWrapper
    groundTexture={config.groundTexture}
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
        side={DoubleSide}
        vertexColors={true} />
      : <TexturedGroundMaterial
        groundTexture={config.groundTexture}
        side={DoubleSide}
        vertexColors={true} />}
  </GroundWrapper>;
};
