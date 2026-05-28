import React from "react";
import { Config, detailLevels } from "../config";
import { Detailed } from "@react-three/drei";
import { Mesh, MeshPhongMaterial } from "../components";
import { ASSETS, BigDistance } from "../constants";
import { CircleGeometry, Float32BufferAttribute, RepeatWrapping } from "three";
import { useTextureVariant } from "../texture_variants";

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

const GroundMaterial = (props: { sceneName: string }) => {
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
    vertexColors={true} />;
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
  GROUND_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

export const Ground = React.memo(GroundBase, groundPropsEqual);

const VisibleGround = (props: GroundProps) => {
  const { config } = props;
  const groundZ = config.bedZOffset + config.bedHeight;

  const groundProperties = getGroundProperties(config.scene);
  const common = { sceneName: config.scene, groundZ };

  if (config.lowDetail) {
    return <LowDetailGround
      {...common}
      color={groundProperties.lowDetailColor} />;
  }

  return <DetailedGround
    {...common}
    config={config}
    color={groundProperties.lowDetailColor} />;
};

interface LowDetailGroundProps {
  sceneName: string;
  groundZ: number;
  color: string;
}

const LowDetailGround = (props: LowDetailGroundProps) => {
  const lowDetailGeometry = React.useMemo(
    () => buildGroundGeometry(BigDistance.ground, 16),
    [],
  );
  return <GroundWrapper
    sceneName={props.sceneName}
    groundZ={props.groundZ}
    geometry={lowDetailGeometry}>
    <MeshPhongMaterial
      color={props.color}
      shininess={0}
      vertexColors={true} />
  </GroundWrapper>;
};

interface DetailedGroundProps extends LowDetailGroundProps {
  config: Config;
}

const DetailedGround = (props: DetailedGroundProps) => {
  const highDetailGeometry = React.useMemo(
    () => buildGroundGeometry(BigDistance.ground, 64),
    [],
  );
  const common = {
    sceneName: props.sceneName,
    groundZ: props.groundZ,
  };

  return <Detailed distances={detailLevels(props.config)}
    visible={props.config.ground}>
    <GroundWrapper {...common} geometry={highDetailGeometry}>
      <GroundMaterial sceneName={props.config.scene} />
    </GroundWrapper>
    <LowDetailGround {...common} color={props.color} />
  </Detailed>;
};
