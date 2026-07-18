import React from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "../../components";
import { SceneObject } from "farmbot/dist/resources/api_resources";
import { RepeatWrapping } from "three";
import { ASSETS } from "../../constants";
import { useTextureVariant } from "../../texture_variants";

export interface RoverProps {
  size: [number, number, number];
  texture: SceneObject["texture"];
  color: string;
}

export const ROVER_BOUNDS: [number, number, number] = [2800, 1800, 1500];

const wheelPositions: [number, number, number][] = [
  [-850, -800, 330], [-850, 800, 330],
  [0, -800, 330], [0, 800, 330],
  [850, -800, 330], [850, 800, 330],
];

export const roverPropsEqual = (
  prev: RoverProps,
  next: RoverProps,
) =>
  prev.color === next.color &&
  prev.texture === next.texture &&
  prev.size[0] === next.size[0] &&
  prev.size[1] === next.size[1] &&
  prev.size[2] === next.size[2];

const RoverBase = (props: RoverProps) => {
  const scale = React.useMemo(() => [
    props.size[0] / ROVER_BOUNDS[0],
    props.size[1] / ROVER_BOUNDS[1],
    props.size[2] / ROVER_BOUNDS[2],
  ] as [number, number, number], [props.size]);
  const centerOffset = ROVER_BOUNDS[2] / 2;
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

  return <Group name={"rover"} scale={scale}>
    <Group position={[0, 0, -centerOffset]}>
      <Box name={"rover-chassis"}
        args={[2100, 1050, 260]}
        position={[0, 0, 650]}
        castShadow={true}
        receiveShadow={true}>
        <MeshPhongMaterial
          key={props.texture}
          map={objectMap}
          color={props.color} />
      </Box>
      <Box name={"rover-cabin"}
        args={[950, 900, 500]}
        position={[-250, 0, 1000]}
        castShadow={true}>
        <MeshPhongMaterial
          key={props.texture}
          map={objectMap}
          color={props.color} />
      </Box>
      <Box name={"rover-window"}
        args={[300, 920, 250]}
        position={[240, 0, 1070]}>
        <MeshPhongMaterial color={"#5f8290"} shininess={80} />
      </Box>
      <Box name={"rover-solar-panel"}
        args={[800, 1100, 45]}
        position={[720, 0, 850]}
        rotation={[0, -0.2, 0]}>
        <MeshPhongMaterial color={"#263c68"} shininess={70} />
      </Box>
      <Group name={"rover-mast"} position={[-600, 0, 1280]}>
        <Cylinder args={[35, 35, 360, 10]}
          rotation={[Math.PI / 2, 0, 0]}>
          <MeshPhongMaterial color={"#777"} />
        </Cylinder>
        <Sphere name={"rover-camera"} args={[110, 12, 8]}
          position={[0, 0, 220]}>
          <MeshPhongMaterial color={"#303840"} />
        </Sphere>
      </Group>
      <Group name={"rover-wheels"}>
        {wheelPositions.map(([x, y, z], index) => {
          return <Group name={"rover-wheel-mount"}
            key={index}
            position={[x, y, z]}>
            <Cylinder name={"rover-wheel"}
              args={[330, 330, 260, 16]}
              castShadow={true}
              receiveShadow={true}>
              <MeshPhongMaterial color={"#292b2e"} />
            </Cylinder>
          </Group>;
        })}
      </Group>
    </Group>
  </Group>;
};

export const Rover = React.memo(RoverBase, roverPropsEqual);
