import React from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "../../components";
import { SceneObject } from "farmbot/dist/resources/api_resources";
import { RepeatWrapping } from "three";
import { ASSETS } from "../../constants";
import { useTextureVariant } from "../../texture_variants";

export interface AstronautProps {
  size: [number, number, number];
  texture: SceneObject["texture"];
  color: string;
}

export const ASTRONAUT_BOUNDS: [number, number, number] = [900, 600, 1900];

export const astronautPropsEqual = (
  prev: AstronautProps,
  next: AstronautProps,
) =>
  prev.color === next.color &&
  prev.texture === next.texture &&
  prev.size[0] === next.size[0] &&
  prev.size[1] === next.size[1] &&
  prev.size[2] === next.size[2];

const Limb = (props: {
  name: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  length: number;
  radius: number;
  objectTexture: ReturnType<typeof useTextureVariant> | null;
  color: string;
  texture: SceneObject["texture"];
}) =>
  <Cylinder name={props.name}
    args={[props.radius, props.radius, props.length, 12]}
    position={props.position}
    rotation={props.rotation || [Math.PI / 2, 0, 0]}
    castShadow={true}
    receiveShadow={true}>
    <MeshPhongMaterial
      key={props.texture}
      map={props.objectTexture}
      color={props.color} />
  </Cylinder>;

const AstronautBase = (props: AstronautProps) => {
  const scale = React.useMemo(() => [
    props.size[0] / ASTRONAUT_BOUNDS[0],
    props.size[1] / ASTRONAUT_BOUNDS[1],
    props.size[2] / ASTRONAUT_BOUNDS[2],
  ] as [number, number, number], [props.size]);
  const centerOffset = ASTRONAUT_BOUNDS[2] / 2;
  const textureUrl = props.texture === "none"
    ? ASSETS.textures.wood
    : ASSETS.textures[props.texture];
  const objectTexture = useTextureVariant(textureUrl, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.5, 0.5],
  });
  // eslint-disable-next-line no-null/no-null
  const objectMap = props.texture === "none" ? null : objectTexture;
  const common = {
    objectTexture: objectMap,
    color: props.color,
    texture: props.texture,
  };

  return <Group name={"astronaut"} scale={scale}>
    <Group position={[0, 0, -centerOffset]}>
      <Box name={"astronaut-backpack"}
        args={[420, 220, 650]}
        position={[0, 180, 1110]}
        castShadow={true}>
        <MeshPhongMaterial color={"#c7c9c5"} />
      </Box>
      <Cylinder name={"astronaut-torso"}
        args={[260, 310, 650, 12]}
        position={[0, 0, 1110]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow={true}
        receiveShadow={true}>
        <MeshPhongMaterial
          key={props.texture}
          map={objectMap}
          color={props.color} />
      </Cylinder>
      <Box name={"astronaut-control-panel"}
        args={[260, 40, 180]}
        position={[0, -285, 1190]}>
        <MeshPhongMaterial color={"#59616a"} />
      </Box>
      <Group name={"astronaut-helmet"} position={[0, 0, 1600]}>
        <Sphere args={[300, 16, 12]} castShadow={true}>
          <MeshPhongMaterial
            key={props.texture}
            map={objectMap}
            color={props.color} />
        </Sphere>
        <Sphere name={"astronaut-visor"}
          args={[305, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]}
          position={[0, 0, 0]}>
          <MeshPhongMaterial color={"#b06b2c"} shininess={90} />
        </Sphere>
      </Group>
      <Group name={"astronaut-arms"}>
        <Limb name={"astronaut-arm"} {...common}
          position={[-350, 0, 1120]}
          rotation={[Math.PI / 2, 0, -0.18]}
          length={620}
          radius={105} />
        <Limb name={"astronaut-arm"} {...common}
          position={[350, 0, 1120]}
          rotation={[Math.PI / 2, 0, 0.18]}
          length={620}
          radius={105} />
      </Group>
      <Group name={"astronaut-legs"}>
        <Limb name={"astronaut-leg"} {...common}
          position={[-155, 0, 470]}
          length={720}
          radius={130} />
        <Limb name={"astronaut-leg"} {...common}
          position={[155, 0, 470]}
          length={720}
          radius={130} />
        {[-155, 155].map(x =>
          <Box name={"astronaut-boot"} key={x}
            args={[250, 390, 180]}
            position={[x, -80, 90]}
            castShadow={true}>
            <MeshPhongMaterial
              key={props.texture}
              map={objectMap}
              color={props.color} />
          </Box>)}
      </Group>
    </Group>
  </Group>;
};

export const Astronaut = React.memo(AstronautBase, astronautPropsEqual);
