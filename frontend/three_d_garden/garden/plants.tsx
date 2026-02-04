import React from "react";
import { Config } from "../config";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import { Billboard, Sphere } from "@react-three/drei";
import {
  Vector3,
  Group as GroupType,
  Color,
  WebGLProgramParametersWithUniforms,
} from "three";
import {
  getGardenPositionFunc,
  threeSpace,
  zZero,
  zZero as zZeroFunc,
} from "../helpers";
import { Text } from "../elements";
import { isUndefined } from "lodash";
import { Path } from "../../internal_urls";
import { useNavigate } from "react-router";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { getMode, round } from "../../farm_designer/map/util";
import { ThreeElements, useFrame } from "@react-three/fiber";
import { Group, MeshPhongMaterial } from "../components";
import {
  getSpreadOverlap, getSpreadRadii,
} from "../../farm_designer/map/layers/spread/spread_overlap_helper";
import { ActivePositionRef } from "../bed/objects/pointer_objects";
import { Mode } from "../../farm_designer/map/interfaces";
import { findCrop } from "../../crops/find";

export interface ThreeDGardenPlant {
  id?: number | undefined;
  label: string;
  icon: string;
  size: number;
  spread: number;
  x: number;
  y: number;
  key: string;
  seed: number;
}

export interface ThreeDPlantLabelProps {
  plant: ThreeDGardenPlant;
  i: number;
  config: Config;
  hoveredPlant: number | undefined;
  getZ(x: number, y: number): number;
}

export const ThreeDPlantLabel = (props: ThreeDPlantLabelProps) => {
  const { i, plant, config, hoveredPlant } = props;
  const alwaysShowLabels = config.labels && !config.labelsOnHover;
  // eslint-disable-next-line no-null/no-null
  const billboardRef = React.useRef<GroupType>(null);
  const getPlantZ = (size: number) =>
    zZeroFunc(config)
    + props.getZ(plant.x - config.bedXOffset, plant.y - config.bedYOffset)
    + size / 2;
  return <Billboard
    ref={billboardRef}
    follow={true}
    position={new Vector3(
      threeSpace(plant.x, config.bedLengthOuter),
      threeSpace(plant.y, config.bedWidthOuter),
      getPlantZ(plant.size),
    )}>
    <LabelPart
      visible={alwaysShowLabels || i === hoveredPlant}
      plant={plant} />
  </Billboard>;
};

export interface ThreeDPlantSpreadProps {
  plant: ThreeDGardenPlant;
  config: Config;
  dispatch?: Function;
  visible?: boolean;
  getZ(x: number, y: number): number;
  activePositionRef: ActivePositionRef;
  plants: ThreeDGardenPlant[];
  spreadVisible: boolean;
}

export const ThreeDPlantSpread = (props: ThreeDPlantSpreadProps) => {
  const { plant, config } = props;
  const navigate = useNavigate();
  const getPlantZ = (size: number) =>
    zZeroFunc(config)
    + props.getZ(plant.x - config.bedXOffset, plant.y - config.bedYOffset)
    + size / 2;
  return <Group
    position={new Vector3(
      threeSpace(plant.x, config.bedLengthOuter),
      threeSpace(plant.y, config.bedWidthOuter),
      getPlantZ(plant.size),
    )}
    onClick={() => {
      if (plant.id && !isUndefined(props.dispatch) && props.visible &&
        !HOVER_OBJECT_MODES.includes(getMode())) {
        props.dispatch(setPanelOpen(true));
        navigate(Path.plants(plant.id));
      }
    }}>
    <SpreadPart
      config={config}
      plants={props.plants}
      plant={plant}
      activePositionRef={props.activePositionRef}
      spreadVisible={props.spreadVisible} />
  </Group>;
};

interface LabelPartProps {
  visible: boolean;
  plant: ThreeDGardenPlant;
}

const LabelPart = (props: LabelPartProps) =>
  <Text visible={props.visible}
    renderOrder={RenderOrder.plantLabels}
    fontSize={50}
    color={"white"}
    position={[0, props.plant.size / 2 + 40, 0]}
    rotation={[0, 0, 0]}>
    {props.plant.label}
  </Text>;
type MeshProps = ThreeElements["mesh"];
interface SpreadPartProps extends MeshProps {
  config: Config;
  activePositionRef: ActivePositionRef;
  plants: ThreeDGardenPlant[];
  plant: ThreeDGardenPlant;
  spreadVisible: boolean;
}

const SpreadPart = (props: SpreadPartProps) => {
  const { config } = props;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const boundsCenter = React.useMemo(getBoundsCenter(config), []);
  const editPlantMode =
    Path.getSlug(Path.designer()) == "plants" && Path.lastChunkIsNum();
  const plantId = parseInt(Path.getSlug(Path.plants()));
  const currentPlant =
    props.plants.filter(p => p.id == plantId)[0] as ThreeDGardenPlant | undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const halfSize = React.useMemo(getHalfSize(config), []);
  const spreadRadii = getSpreadRadii({
    activeDragSpread: editPlantMode
      ? currentPlant?.spread
      : findCrop(Path.getCropSlug()).spread,
    inactiveSpread: props.plant.spread,
    radius: props.plant.size / 2,
  });

  const rgb = React.useMemo(() => ({ value: [0, 1, 0] }), []);
  useFrame(() => {
    const worldPos = props.activePositionRef.current || { x: -10000, y: -10000 };
    const activePointer = getGardenPositionFunc(config)(worldPos);
    const active = editPlantMode
      ? {
        x: currentPlant?.x || -10000,
        y: currentPlant?.y || -10000,
      }
      : {
        x: activePointer.x + config.bedXOffset,
        y: activePointer.y + config.bedYOffset,
      };
    const overlap = getSpreadOverlap({
      spreadRadii,
      activeDragXY: {
        x: round(active.x),
        y: round(active.y),
        z: 0,
      },
      plantXY: { x: round(props.plant.x), y: round(props.plant.y), z: 0 },
    });
    const color = (props.plant.id && (plantId != props.plant.id))
      ? overlap.color.rgb
      : [1, 1, 1];
    const clickToAddMode = getMode() == Mode.clickToAdd;
    rgb.value = (clickToAddMode || editPlantMode) ? color : [0, 1, 0];
  });
  return <Group>
    {(props.spreadVisible || !props.plant.id || editPlantMode) &&
      <Sphere args={[spreadRadii.inactive, 32, 32]} name={"spread"}>
        <MeshPhongMaterial
          color={"green"}
          transparent={true}
          opacity={0.4}
          onBeforeCompile={(shader) => {
            shader.uniforms.uBoundsCenter = { value: boundsCenter };
            shader.uniforms.uHalfSize = { value: halfSize };
            shader.uniforms.uInside = rgb;
            shader.uniforms.uOutside = { value: new Color("red") };
            outOfBoundsShaderModification(shader);
          }}
          depthWrite={false} />
      </Sphere>}
  </Group>;
};

export const getBoundsCenter = (config: Config) => () =>
  new Vector3(
    0,
    0,
    -10000 + zZero(config),
  );

export const getHalfSize = (config: Config) => () => new Vector3(
  config.bedLengthOuter / 2 - 300,
  config.bedWidthOuter / 2 - config.bedWallThickness,
  10000,
);

export const outOfBoundsShaderModification =
  (shader: WebGLProgramParametersWithUniforms) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>
       varying vec3 vWorldPosition;`,
    ).replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>
       vWorldPosition = worldPosition.xyz;`);
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
       varying vec3 vWorldPosition;
       uniform vec3 uBoundsCenter;
       uniform vec3 uHalfSize;
       uniform vec3 uInside;
       uniform vec3 uOutside;`,
    ).replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 p = vWorldPosition - uBoundsCenter;
       bool inside =
       p.x > -uHalfSize.x &&
       abs(p.y) <= uHalfSize.y &&
       abs(p.z) <= uHalfSize.z;
       diffuseColor.rgb = mix(uOutside, uInside, float(inside));
      `,
    );
  };
