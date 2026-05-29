import React from "react";
import { Config } from "../config";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import { Billboard } from "@react-three/drei";
import {
  Vector3,
  Group as GroupType,
  Color,
  WebGLProgramParametersWithUniforms,
  InstancedMesh as ThreeInstancedMesh,
  Matrix4,
  Quaternion,
  InstancedBufferAttribute,
  type Raycaster,
  type Intersection,
} from "three";
import {
  getGardenPositionFunc,
  zZero,
  zZero as zZeroFunc,
  get3DPositionFunc,
} from "../helpers";
import { Text } from "../elements";
import { isUndefined } from "lodash";
import { Path } from "../../internal_urls";
import { useNavigate } from "react-router";
import { setPanelOpen3D } from "../panel_actions";
import { getMode, round } from "../../farm_designer/map/util";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { InstancedMesh, MeshPhongMaterial, SphereGeometry } from "../components";
import {
  getSpreadOverlap, getSpreadRadii,
} from "../../farm_designer/map/layers/spread/spread_overlap_helper";
import { ActivePositionRef } from "../bed/objects/pointer_objects";
import { Mode } from "../../farm_designer/map/interfaces";
import { findCropMetadata } from "../../crops/metadata";
import { perfMeasure } from "../../performance/perf";
import { clickWasDragged } from "../click_event";

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

export type PlantLabelConfig = Pick<Config,
  "bedLengthOuter" | "bedWidthOuter" | "bedXOffset" | "bedYOffset"
  | "columnLength" | "labels" | "labelsOnHover" | "mirrorX" | "mirrorY"
  | "zGantryOffset">;

export interface ThreeDPlantLabelProps<
  TConfig extends PlantLabelConfig = Config,
> {
  plant: ThreeDGardenPlant;
  i: number;
  config: TConfig;
  hoveredPlant: number | undefined;
  getZ(x: number, y: number): number;
}

type PlantLabelProps = ThreeDPlantLabelProps<PlantLabelConfig | Config>;

const plantLabelVisible = (props: PlantLabelProps) =>
  (props.config.labels && !props.config.labelsOnHover)
  || props.i === props.hoveredPlant;

const plantLabelConfigEqual = (
  prev: PlantLabelConfig,
  next: PlantLabelConfig,
) =>
  prev.bedLengthOuter == next.bedLengthOuter
  && prev.bedWidthOuter == next.bedWidthOuter
  && prev.bedXOffset == next.bedXOffset
  && prev.bedYOffset == next.bedYOffset
  && prev.columnLength == next.columnLength
  && prev.zGantryOffset == next.zGantryOffset
  && prev.mirrorX == next.mirrorX
  && prev.mirrorY == next.mirrorY;

const plantLabelPlantEqual = (
  prev: ThreeDGardenPlant,
  next: ThreeDGardenPlant,
) =>
  prev.label == next.label
  && prev.size == next.size
  && prev.x == next.x
  && prev.y == next.y;

const plantLabelPropsEqual = (
  prev: PlantLabelProps,
  next: PlantLabelProps,
) =>
  prev.i == next.i
  && prev.getZ == next.getZ
  && plantLabelVisible(prev) == plantLabelVisible(next)
  && plantLabelConfigEqual(prev.config, next.config)
  && plantLabelPlantEqual(prev.plant, next.plant);

const ThreeDPlantLabelBase = (props: PlantLabelProps) => {
  const { i, plant, config, hoveredPlant } = props;
  const alwaysShowLabels = config.labels && !config.labelsOnHover;
  // eslint-disable-next-line no-null/no-null
  const billboardRef = React.useRef<GroupType>(null);
  const get3DPosition = React.useMemo(() => get3DPositionFunc(config), [config]);
  const getPlantZ = (size: number) =>
    zZeroFunc(config)
    + props.getZ(plant.x, plant.y)
    + size / 2;
  const position = get3DPosition({ x: plant.x, y: plant.y });
  return <Billboard
    ref={billboardRef}
    follow={true}
    position={new Vector3(
      position.x,
      position.y,
      getPlantZ(plant.size),
    )}>
    <LabelPart
      visible={alwaysShowLabels || i === hoveredPlant}
      plant={plant} />
  </Billboard>;
};

export const ThreeDPlantLabel =
  React.memo(ThreeDPlantLabelBase, plantLabelPropsEqual);

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

export interface PlantSpreadInstancesProps {
  plants: ThreeDGardenPlant[];
  config: Config;
  getZ(x: number, y: number): number;
  visible?: boolean;
  dispatch?: Function;
  activePositionRef: ActivePositionRef;
  spreadVisible: boolean;
  instanceCapacity?: number;
}

interface PlantSpreadUpdateState {
  needsInstanceUpdate: boolean;
  lastUpdateKey: string;
}

const plantSpreadRaycast = function (
  this: ThreeInstancedMesh,
  raycaster: Raycaster,
  intersects: Intersection[],
) {
  if (HOVER_OBJECT_MODES.includes(getMode())) { return; }
  ThreeInstancedMesh.prototype.raycast.call(this, raycaster, intersects);
};

interface StaticPlantSpreadInstance {
  id?: number;
  x: number;
  y: number;
  z: number;
  positionX: number;
  positionY: number;
  size: number;
  spread: number;
}

const newPlantSpreadUpdateState = (): PlantSpreadUpdateState => ({
  needsInstanceUpdate: true,
  lastUpdateKey: "",
});

type PlantSpreadPositionConfig = Pick<Config,
  "bedLengthOuter" | "bedWidthOuter" | "bedXOffset" | "bedYOffset"
  | "columnLength" | "zGantryOffset" | "mirrorX" | "mirrorY">;

export const findPlantById = (
  plants: ThreeDGardenPlant[],
  plantId: number,
) => {
  for (let index = 0; index < plants.length; index++) {
    const plant = plants[index];
    if (plant.id == plantId) { return plant; }
  }
  return undefined;
};

const PlantSpreadInstancesBase = (props: PlantSpreadInstancesProps) => {
  const {
    config, plants, getZ, visible, dispatch, activePositionRef, spreadVisible,
  } = props;
  const instanceCapacity = Math.max(props.instanceCapacity || 0, plants.length);
  const navigate = useNavigate();
  // eslint-disable-next-line no-null/no-null
  const instancedRef = React.useRef<ThreeInstancedMesh>(null);
  const tempMatrix = React.useMemo(() => new Matrix4(), []);
  const tempPosition = React.useMemo(() => new Vector3(), []);
  const tempScale = React.useMemo(() => new Vector3(), []);
  const tempQuaternion = React.useMemo(() => new Quaternion(), []);
  const tempColor = React.useMemo(() => new Color(), []);
  const updateStateRef =
    React.useRef<PlantSpreadUpdateState>(newPlantSpreadUpdateState());
  const getUpdateState = () => {
    const current =
      updateStateRef.current as Partial<PlantSpreadUpdateState> | undefined;
    if (typeof current?.needsInstanceUpdate != "boolean" ||
      typeof current?.lastUpdateKey != "string") {
      updateStateRef.current = newPlantSpreadUpdateState();
    }
    return updateStateRef.current;
  };
  const {
    bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset,
    columnLength, zGantryOffset, mirrorX, mirrorY,
  } = config;
  const positionConfig = React.useMemo(
    (): PlantSpreadPositionConfig => ({
      bedLengthOuter,
      bedWidthOuter,
      bedXOffset,
      bedYOffset,
      columnLength,
      zGantryOffset,
      mirrorX,
      mirrorY,
    }),
    [
      bedLengthOuter,
      bedWidthOuter,
      bedXOffset,
      bedYOffset,
      columnLength,
      zGantryOffset,
      mirrorX,
      mirrorY,
    ]);
  const get3DPosition = React.useMemo(() =>
    get3DPositionFunc(positionConfig as Config), [positionConfig]);
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const boundsCenter = React.useMemo(getBoundsCenter(config), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const halfSize = React.useMemo(getHalfSize(config), []);
  const plantIndexes = React.useMemo(() =>
    plants.map((_, index) => index), [plants]);
  const zBase = React.useMemo(() =>
    zZeroFunc(positionConfig as Config), [positionConfig]);
  const staticInstances = React.useMemo<StaticPlantSpreadInstance[]>(() =>
    plants.map(plant => {
      const position = get3DPosition({ x: plant.x, y: plant.y });
      return {
        id: plant.id,
        x: plant.x,
        y: plant.y,
        z: zBase + getZ(plant.x, plant.y) + plant.size / 2,
        positionX: position.x,
        positionY: position.y,
        size: plant.size,
        spread: plant.spread,
      };
    }), [get3DPosition, getZ, plants, zBase]);
  const editPlantMode =
    Path.getSlug(Path.designer()) == "plants" && Path.lastChunkIsNum();
  const plantId = parseInt(Path.getSlug(Path.plants()));
  const currentPlant = findPlantById(plants, plantId);
  const activeDragSpread = editPlantMode
    ? currentPlant?.spread
    : findCropMetadata(Path.getCropSlug()).spread;
  const hasTransientPlant = React.useMemo(() =>
    plants.some(plant => !plant.id), [plants]);

  const ensureInstanceColor = React.useCallback((mesh: ThreeInstancedMesh) => {
    const needsResize = !mesh.instanceColor
      || mesh.instanceColor.count != instanceCapacity;
    if (needsResize) {
      const colors = new Float32Array(instanceCapacity * 3);
      colors.fill(1);
      mesh.instanceColor = new InstancedBufferAttribute(colors, 3);
      if (mesh.geometry) {
        mesh.geometry.setAttribute("instanceColor", mesh.instanceColor);
      }
      mesh.instanceColor.needsUpdate = true;
      const material = mesh.material;
      if (Array.isArray(material)) {
        material.forEach(entry => { entry.needsUpdate = true; });
      } else if (material) {
        material.needsUpdate = true;
      }
    }
  }, [instanceCapacity]);

  React.useLayoutEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) { return; }
    ensureInstanceColor(mesh);
  }, [ensureInstanceColor]);

  React.useEffect(() => {
    const updateState = getUpdateState();
    updateState.needsInstanceUpdate = true;
  }, [activeDragSpread, staticInstances]);

  // eslint-disable-next-line complexity
  useFrame(state => {
    const mesh = instancedRef.current;
    if (!mesh || visible === false) { return; }
    const updateState = getUpdateState();
    const clickToAddMode = getMode() == Mode.clickToAdd;
    const spreadActive =
      spreadVisible || editPlantMode || clickToAddMode || hasTransientPlant;
    if (!spreadActive && !updateState.needsInstanceUpdate) { return; }
    ensureInstanceColor(mesh);
    tempQuaternion.copy(state.camera.quaternion);
    const active = editPlantMode
      ? {
        x: currentPlant?.x || -10000,
        y: currentPlant?.y || -10000,
      }
      : getGardenPositionFunc(config)(
        activePositionRef.current || { x: -10000, y: -10000 });
    const activeKey = (clickToAddMode || editPlantMode)
      ? `${round(active.x)}:${round(active.y)}`
      : "";
    const updateKey = [
      spreadVisible,
      editPlantMode,
      clickToAddMode,
      hasTransientPlant,
      plantId,
      activeDragSpread || "",
      activeKey,
    ].join(":");
    if (!updateState.needsInstanceUpdate &&
      updateState.lastUpdateKey == updateKey) { return; }
    perfMeasure("spreadFrameUpdateMs", () => {
      const roundedActiveX = round(active.x);
      const roundedActiveY = round(active.y);
      staticInstances.forEach((plant, index) => {
        const spreadRadii = getSpreadRadii({
          activeDragSpread,
          inactiveSpread: plant.spread,
          radius: plant.size / 2,
        });
        const scale = (spreadVisible || !plant.id || editPlantMode)
          ? spreadRadii.inactive
          : 0;
        tempPosition.set(
          plant.positionX,
          plant.positionY,
          plant.z,
        );
        tempScale.set(scale, scale, scale);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        mesh.setMatrixAt(index, tempMatrix);
        if (mesh.setColorAt) {
          let r = 0;
          let g = 1;
          let b = 0;
          if (clickToAddMode || editPlantMode) {
            const overlap = getSpreadOverlap({
              spreadRadii,
              activeDragXY: {
                x: roundedActiveX,
                y: roundedActiveY,
                z: 0,
              },
              plantXY: {
                x: round(plant.x),
                y: round(plant.y),
                z: 0,
              },
            });
            if (plant.id && plantId != plant.id) {
              [r, g, b] = overlap.color.rgb;
            } else {
              r = 1;
              g = 1;
              b = 1;
            }
          }
          tempColor.setRGB(r, g, b);
          mesh.setColorAt(index, tempColor);
        }
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) { mesh.instanceColor.needsUpdate = true; }
    });
    updateState.needsInstanceUpdate = false;
    updateState.lastUpdateKey = updateKey;
  });

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (clickWasDragged(event)) { return; }
    const instanceId = event.instanceId;
    if (isUndefined(instanceId)) { return; }
    const plant = plants[instanceId];
    if (plant?.id && dispatch && visible &&
      ![...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
      dispatch(setPanelOpen3D(true));
      navigate(Path.plants(plant.id));
    }
  };

  return <InstancedMesh
    key={`plant-spread-${instanceCapacity}`}
    ref={instancedRef}
    args={[undefined, undefined, instanceCapacity]}
    count={plants.length}
    userData={{ plantIndexes }}
    visible={visible}
    raycast={plantSpreadRaycast}
    onClick={onClick}>
    <SphereGeometry args={[1, 32, 32]} />
    <MeshPhongMaterial
      color={"white"}
      transparent={true}
      opacity={0.4}
      vertexColors={true}
      onBeforeCompile={(shader) => {
        shader.uniforms.uBoundsCenter = { value: boundsCenter };
        shader.uniforms.uHalfSize = { value: halfSize };
        shader.uniforms.uOutside = { value: new Color("red") };
        shader.uniforms.uMirrorX = { value: config.mirrorX ? -1 : 1 };
        shader.uniforms.uMirrorY = { value: config.mirrorY ? -1 : 1 };
        outOfBoundsShaderModification(shader, true);
      }}
      depthWrite={false} />
  </InstancedMesh>;
};

export const PlantSpreadInstances = React.memo(PlantSpreadInstancesBase);


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
  (shader: WebGLProgramParametersWithUniforms,
    useInstanceColor = false) => {
    const vertexCommon = useInstanceColor
      ? `#include <common>
       varying vec3 vInstanceColor;
       varying vec3 vWorldPosition;`
      : `#include <common>
       varying vec3 vWorldPosition;`;
    const colorVertex = useInstanceColor
      ? `#include <color_vertex>
       vInstanceColor = instanceColor;`
      : "#include <color_vertex>";
    const fragmentUniforms = useInstanceColor
      ? `uniform vec3 uBoundsCenter;
       uniform vec3 uHalfSize;
       uniform vec3 uOutside;
       uniform float uMirrorX;
       uniform float uMirrorY;
       varying vec3 vInstanceColor;`
      : `uniform vec3 uBoundsCenter;
       uniform vec3 uHalfSize;
       uniform vec3 uInside;
       uniform vec3 uOutside;
       uniform float uMirrorX;
       uniform float uMirrorY;`;
    const insideColor = useInstanceColor ? "vInstanceColor" : "uInside";
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      vertexCommon,
    ).replace(
      "#include <color_vertex>",
      colorVertex,
    ).replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>
       vWorldPosition = worldPosition.xyz;`);
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
       varying vec3 vWorldPosition;
       ${fragmentUniforms}`,
    ).replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 p = vWorldPosition - uBoundsCenter;
       p.x *= uMirrorX;
       p.y *= uMirrorY;
       bool inside =
       p.x > -uHalfSize.x &&
       abs(p.y) <= uHalfSize.y &&
       abs(p.z) <= uHalfSize.z;
       diffuseColor.rgb = mix(uOutside, ${insideColor}, float(inside));
      `,
    );
  };
