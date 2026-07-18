import React from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "../../components";
import { SceneObject } from "farmbot/dist/resources/api_resources";
import { ASSETS } from "../../constants";
import { RepeatWrapping } from "three";
import { useTextureVariant } from "../../texture_variants";

export interface HabProps {
  size: [number, number, number];
  texture: SceneObject["texture"];
  color: string;
}

export const HAB_BOUNDS: [number, number, number] = [6000, 4000, 3000];

export const habPropsEqual = (prev: HabProps, next: HabProps) =>
  prev.color === next.color &&
  prev.texture === next.texture &&
  prev.size[0] === next.size[0] &&
  prev.size[1] === next.size[1] &&
  prev.size[2] === next.size[2];

const HabBase = (props: HabProps) => {
  const scale = React.useMemo(() => [
    props.size[0] / HAB_BOUNDS[0],
    props.size[1] / HAB_BOUNDS[1],
    props.size[2] / HAB_BOUNDS[2],
  ] as [number, number, number], [props.size]);
  const centerOffset = HAB_BOUNDS[2] / 2;
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

  return <Group name={"hab"} scale={scale}>
    <Group position={[0, 0, -centerOffset]}>
      <Cylinder name={"hab-shell"}
        args={[1400, 1400, 4500, 20]}
        position={[0, 0, 1550]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow={true}
        receiveShadow={true}>
        <MeshPhongMaterial
          key={props.texture}
          map={objectMap}
          color={props.color} />
      </Cylinder>
      <Group name={"hab-ribs"}>
        {[-1800, -900, 0, 900, 1800].map(x =>
          <Cylinder name={"hab-rib"} key={x}
            args={[1435, 1435, 60, 20]}
            position={[x, 0, 1550]}
            rotation={[0, 0, Math.PI / 2]}>
            <MeshPhongMaterial color={"#777b7d"} />
          </Cylinder>)}
      </Group>
      <Box name={"hab-airlock"}
        args={[850, 1450, 1900]}
        position={[-2600, 0, 1050]}
        castShadow={true}
        receiveShadow={true}>
        <MeshPhongMaterial color={"#b8bab5"} />
      </Box>
      <Box name={"hab-door"}
        args={[40, 850, 1250]}
        position={[-3030, 0, 1020]}>
        <MeshPhongMaterial color={"#697178"} />
      </Box>
      <Group name={"hab-windows"}>
        {[-900, 0, 900].map(x =>
          <Sphere name={"hab-window"} key={x}
            args={[280, 16, 12]}
            position={[x, -1370, 1700]}
            scale={[1, 0.15, 1]}>
            <MeshPhongMaterial color={"#537f91"} shininess={90} />
          </Sphere>)}
      </Group>
      <Group name={"hab-supports"}>
        {[-1600, 1600].map(x => [-900, 900].map(y =>
          <Box name={"hab-support"} key={`${x}-${y}`}
            args={[220, 220, 700]}
            position={[x, y, 350]}
            castShadow={true}>
            <MeshPhongMaterial color={"#747779"} />
          </Box>))}
      </Group>
      <Group name={"hab-antenna"} position={[900, 0, 2850]}>
        <Cylinder args={[30, 30, 300, 10]}
          rotation={[Math.PI / 2, 0, 0]}>
          <MeshPhongMaterial color={"#777"} />
        </Cylinder>
        <Sphere args={[130, 12, 8]} position={[0, 0, 190]}>
          <MeshPhongMaterial color={"#d17a35"} />
        </Sphere>
      </Group>
    </Group>
  </Group>;
};

export const Hab = React.memo(HabBase, habPropsEqual);
