import React from "react";
import { Config } from "../config";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import { Billboard, Plane, useTexture } from "@react-three/drei";
import { Vector3, MeshStandardMaterial } from "three";
import { threeSpace, zZero as zZeroFunc } from "../helpers";
import { Text } from "../elements";
import { isUndefined } from "lodash";
import { Path } from "../../internal_urls";
import { useNavigate } from "react-router";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { getMode } from "../../farm_designer/map/util";
import { MeshStandardMaterialProps, ThreeElements } from "@react-three/fiber";

export interface ThreeDGardenPlant {
  id?: number | undefined;
  label: string;
  icon: string;
  size: number;
  spread: number;
  x: number;
  y: number;
}

export interface ThreeDPlantProps {
  plant: ThreeDGardenPlant;
  i: number;
  labelOnly?: boolean;
  config: Config;
  hoveredPlant: number | undefined;
  dispatch?: Function;
  visible?: boolean;
  getZ(x: number, y: number): number;
}

export const ThreeDPlant = (props: ThreeDPlantProps) => {
  const { i, plant, labelOnly, config, hoveredPlant } = props;
  const alwaysShowLabels = config.labels && !config.labelsOnHover;
  const navigate = useNavigate();
  return <Billboard follow={true}
    position={new Vector3(
      threeSpace(plant.x, config.bedLengthOuter),
      threeSpace(plant.y, config.bedWidthOuter),
      zZeroFunc(config) + props.getZ(plant.x, plant.y) + plant.size / 2,
    )}>
    {labelOnly
      ? <Text visible={alwaysShowLabels || i === hoveredPlant}
        renderOrder={RenderOrder.plantLabels}
        fontSize={50}
        color={"white"}
        position={[0, plant.size / 2 + 40, 0]}
        rotation={[0, 0, 0]}>
        {plant.label}
      </Text>
      : <Image url={plant.icon} scale={plant.size} name={"" + i}
        onClick={() => {
          if (plant.id && !isUndefined(props.dispatch) && props.visible &&
            !HOVER_OBJECT_MODES.includes(getMode())) {
            props.dispatch(setPanelOpen(true));
            navigate(Path.plants(plant.id));
          }
        }}
        transparent={true}
        renderOrder={RenderOrder.plants} />}
  </Billboard>;
};

type MeshProps = ThreeElements["mesh"];
interface CustomImageProps extends MeshProps {
  url: string;
  transparent: boolean;
}

const Image = (props: CustomImageProps) => {
  const texture = useTexture(props.url);
  return <Plane {...props} args={[1, 1]}>
    <CustomMaterial
      key={Math.random()}
      map={texture}
      transparent={true} />
  </Plane>;
};

export const CustomMaterial = (props: MeshStandardMaterialProps) => {
  // eslint-disable-next-line no-null/no-null
  const materialRef = React.useRef<MeshStandardMaterial>(null);

  const attachRef = React.useCallback((material: MeshStandardMaterial) => {
    if (!material || materialRef.current) { return; }

    materialRef.current = material;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    material.onBeforeCompile = (shader: any) => {
      if (material.userData.shaderInjected) { return; }
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_begin>",
        `#include <normal_fragment_begin>
         normal = vec3(0.0, 1.0, 0.0);
        `,
      );
      material.userData.shaderInjected = true;
    };
  }, []);

  // @ts-expect-error JSX
  return <meshStandardMaterial ref={attachRef} {...props} />;
};
