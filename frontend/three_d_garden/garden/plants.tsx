import React from "react";
import { Config } from "../config";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import { Billboard } from "@react-three/drei";
import {
  Vector3,
  Group as GroupType,
  Color,
  WebGLProgramParametersWithUniforms,
  InstancedMesh as InstancedMeshType,
  Matrix4,
  Quaternion,
  InstancedBufferAttribute,
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
import { setPanelOpen } from "../../farm_designer/panel_header";
import { getMode, round } from "../../farm_designer/map/util";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { InstancedMesh, MeshPhongMaterial, SphereGeometry } from "../components";
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
}

interface PlantSpreadUpdateState {
  needsInstanceUpdate: boolean;
}

const newPlantSpreadUpdateState = (): PlantSpreadUpdateState => ({
  needsInstanceUpdate: true,
});

export const PlantSpreadInstances = React.memo((props: PlantSpreadInstancesProps) => {
  const {
    config, plants, getZ, visible, dispatch, activePositionRef, spreadVisible,
  } = props;
  const navigate = useNavigate();
  // eslint-disable-next-line no-null/no-null
  const instancedRef = React.useRef<InstancedMeshType>(null);
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
    if (typeof current?.needsInstanceUpdate != "boolean") {
      updateStateRef.current = newPlantSpreadUpdateState();
    }
    return updateStateRef.current;
  };
  const get3DPosition = React.useMemo(() => get3DPositionFunc(config), [config]);
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const boundsCenter = React.useMemo(getBoundsCenter(config), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const halfSize = React.useMemo(getHalfSize(config), []);
  const plantIndexes = React.useMemo(() =>
    plants.map((_, index) => index), [plants]);
  const getPlantZ = React.useCallback((size: number, plant: ThreeDGardenPlant) =>
    zZeroFunc(config)
    + getZ(plant.x, plant.y)
    + size / 2, [config, getZ]);
  const editPlantMode =
    Path.getSlug(Path.designer()) == "plants" && Path.lastChunkIsNum();
  const plantId = parseInt(Path.getSlug(Path.plants()));
  const currentPlant =
    plants.filter(p => p.id == plantId)[0] as ThreeDGardenPlant | undefined;
  const activeDragSpread = editPlantMode
    ? currentPlant?.spread
    : findCrop(Path.getCropSlug()).spread;
  const hasTransientPlant = React.useMemo(() =>
    plants.some(plant => !plant.id), [plants]);

  const ensureInstanceColor = React.useCallback((mesh: InstancedMeshType) => {
    const needsResize = !mesh.instanceColor
      || mesh.instanceColor.count != plants.length;
    if (needsResize) {
      const colors = new Float32Array(plants.length * 3);
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
  }, [plants.length]);

  React.useLayoutEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) { return; }
    ensureInstanceColor(mesh);
  }, [ensureInstanceColor]);

  React.useEffect(() => {
    const updateState = getUpdateState();
    updateState.needsInstanceUpdate = true;
  });

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
    const worldPos = activePositionRef.current || { x: -10000, y: -10000 };
    const activePointer = getGardenPositionFunc(config)(worldPos);
    const active = editPlantMode
      ? {
        x: currentPlant?.x || -10000,
        y: currentPlant?.y || -10000,
      }
      : {
        x: activePointer.x,
        y: activePointer.y,
      };
    plants.forEach((plant, index) => {
      const spreadRadii = getSpreadRadii({
        activeDragSpread,
        inactiveSpread: plant.spread,
        radius: plant.size / 2,
      });
      const scale = (spreadVisible || !plant.id || editPlantMode)
        ? spreadRadii.inactive
        : 0;
      const position = get3DPosition({ x: plant.x, y: plant.y });
      tempPosition.set(
        position.x,
        position.y,
        getPlantZ(plant.size, plant),
      );
      tempScale.set(scale, scale, scale);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mesh.setMatrixAt(index, tempMatrix);
      if (mesh.setColorAt) {
        const overlap = getSpreadOverlap({
          spreadRadii,
          activeDragXY: {
            x: round(active.x),
            y: round(active.y),
            z: 0,
          },
          plantXY: {
            x: round(plant.x),
            y: round(plant.y),
            z: 0,
          },
        });
        const color = (plant.id && (plantId != plant.id))
          ? overlap.color.rgb
          : [1, 1, 1];
        const insideColor =
          (clickToAddMode || editPlantMode) ? color : [0, 1, 0];
        tempColor.setRGB(insideColor[0], insideColor[1], insideColor[2]);
        mesh.setColorAt(index, tempColor);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) { mesh.instanceColor.needsUpdate = true; }
    updateState.needsInstanceUpdate = false;
  });

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    const instanceId = event.instanceId;
    if (isUndefined(instanceId)) { return; }
    const plant = plants[instanceId];
    if (plant?.id && dispatch && visible &&
      ![...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
      dispatch(setPanelOpen(true));
      navigate(Path.plants(plant.id));
    }
  };

  return <InstancedMesh
    key={`plant-spread-${plants.length}`}
    ref={instancedRef}
    args={[undefined, undefined, plants.length]}
    userData={{ plantIndexes }}
    visible={visible}
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
});


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
