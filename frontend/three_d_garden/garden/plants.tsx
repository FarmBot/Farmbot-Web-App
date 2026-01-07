import React from "react";
import { Config } from "../config";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import { Billboard, Plane, Sphere, useTexture } from "@react-three/drei";
import {
  Vector3,
  Mesh,
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
import { getSizeAtTime } from "../../promo/plants";
import { FixedNormalMaterial } from "./fixed_normal_material";
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

export interface ThreeDPlantProps {
  plant: ThreeDGardenPlant;
  i: number;
  labelOnly?: boolean;
  config: Config;
  hoveredPlant: number | undefined;
  dispatch?: Function;
  visible?: boolean;
  spreadVisible?: boolean;
  getZ(x: number, y: number): number;
  startTimeRef?: React.RefObject<number>;
  activePositionRef: ActivePositionRef;
  plants: ThreeDGardenPlant[];
}

export const ThreeDPlant = (props: ThreeDPlantProps) => {
  const { i, plant, labelOnly, config, hoveredPlant } = props;
  const alwaysShowLabels = config.labels && !config.labelsOnHover;
  const navigate = useNavigate();
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
    {labelOnly
      ? <LabelPart
        visible={alwaysShowLabels || i === hoveredPlant}
        plant={plant} />
      : <PlantPart
        i={i}
        config={config}
        plants={props.plants}
        plant={plant}
        billboardRef={billboardRef}
        activePositionRef={props.activePositionRef}
        getPlantZ={getPlantZ}
        url={plant.icon}
        spreadVisible={props.spreadVisible || false}
        startTimeRef={props.startTimeRef}
        animateSeasons={props.config.animateSeasons}
        season={config.plants}
        onClick={() => {
          if (plant.id && !isUndefined(props.dispatch) && props.visible &&
            !HOVER_OBJECT_MODES.includes(getMode())) {
            props.dispatch(setPanelOpen(true));
            navigate(Path.plants(plant.id));
          }
        }} />}
  </Billboard>;
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

interface PlantPartProps extends CustomImageProps {
  spreadVisible: boolean;
  config: Config;
  activePositionRef: ActivePositionRef;
  plants: ThreeDGardenPlant[];
}

const PlantPart = (props: PlantPartProps) => {
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
    <Image {...props} />
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

type MeshProps = ThreeElements["mesh"];
interface CustomImageProps extends MeshProps {
  url: string;
  plant: ThreeDGardenPlant;
  i: number;
  onClick?: () => void;
  getPlantZ(size: number): number;
  season: string;
  startTimeRef?: React.RefObject<number>;
  animateSeasons: boolean;
  billboardRef: React.RefObject<GroupType | null>;
}

const Image = (props: CustomImageProps) => {
  const texture = useTexture(props.url);

  const { plant } = props;
  // eslint-disable-next-line no-null/no-null
  const imgRef = React.useRef<Mesh>(null);

  useFrame(() => {
    if (!props.animateSeasons || !props.startTimeRef) { return; }

    if (imgRef.current && props.billboardRef.current) {
      const currentTime = performance.now() / 1000;
      const t = currentTime - props.startTimeRef.current;
      const scale = plant.size * getSizeAtTime(plant, props.season, t);
      imgRef.current.scale.set(scale, scale, scale);
      props.billboardRef.current.position.z = props.getPlantZ(scale);
    }
  });

  return <Plane {...props}
    ref={imgRef}
    scale={(!props.animateSeasons || !props.startTimeRef) ? plant.size : 0}
    name={"" + props.i}
    onClick={props.onClick}
    renderOrder={RenderOrder.plants}
    args={[1, 1]}>
    <FixedNormalMaterial
      key={Math.random()}
      map={texture}
      roughness={0}
      metalness={0}
      transparent={true} />
  </Plane>;
};
