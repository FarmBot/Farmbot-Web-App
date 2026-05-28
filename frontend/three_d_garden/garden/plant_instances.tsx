import React from "react";
import {
  InstancedMesh as ThreeInstancedMesh,
  Matrix4,
  PlaneGeometry as ThreePlaneGeometry,
  Quaternion,
  Vector3,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  type Intersection,
  type Raycaster,
} from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useNavigate } from "react-router";
import { useTexture } from "@react-three/drei";
import { isUndefined } from "lodash";
import { Config } from "../config";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import { Path } from "../../internal_urls";
import { setPanelOpen3D } from "../panel_actions";
import { getMode } from "../../farm_designer/map/util";
import { getSizeAtTime } from "../../promo/plants";
import { get3DPositionFunc, zZero as zZeroFunc } from "../helpers";
import { ThreeDGardenPlant } from "./plants";
import { InstancedMesh, MeshBasicMaterial } from "../components";
import {
  getPlantIconTexture,
  getPlantIconTextureTransform,
  getPlantIconTextureUrl,
} from "./plant_icon_atlas";
import { Mode } from "../../farm_designer/map/interfaces";
import {
  calcSunCoordinate, calcSunI, getAnimatedSeasonDate,
} from "./sun";
import { clickWasDragged } from "../click_event";

export interface PlantInstancesProps {
  plants: ThreeDGardenPlant[];
  config: Config;
  getZ(x: number, y: number): number;
  visible?: boolean;
  startTimeRef?: React.RefObject<number>;
  dispatch?: Function;
  iconCapacities?: Record<string, number>;
}

interface PlantIconInstancesProps extends PlantInstancesProps {
  icon: string;
  plants: ThreeDGardenPlant[];
  plantIndexes: number[];
  capacity: number;
  useAtlas: boolean;
}

interface AtlasPlantIconInstancesProps extends PlantInstancesProps {
  plants: ThreeDGardenPlant[];
  plantIndexes: number[];
  capacity: number;
  atlasUrl: string;
}

interface PlantIconUpdateState {
  lastCameraQuaternion: Quaternion;
  hasCameraQuaternion: boolean;
  needsMatrixUpdate: boolean;
}

interface StaticPlantIconInstance {
  x: number;
  y: number;
  groundZ: number;
  scale: number;
}

const newPlantIconUpdateState = (): PlantIconUpdateState => ({
  lastCameraQuaternion: new Quaternion(),
  hasCameraQuaternion: false,
  needsMatrixUpdate: true,
});

let plantIconGeometry: ThreePlaneGeometry | undefined = undefined;
const getPlantIconGeometry = () => {
  plantIconGeometry ||= new ThreePlaneGeometry(1, 1);
  return plantIconGeometry;
};

const PLANT_ICON_ATLAS_MIN_ICON_COUNT = 32;

export const plantIconBrightness = (sunFactor?: number) =>
  Math.max(0.25, sunFactor ?? 1);

const PLANT_ICON_CONFIG_KEYS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "columnLength",
  "zGantryOffset",
  "mirrorX",
  "mirrorY",
  "sunInclination",
  "animateSeasons",
  "plants",
];

const plantIconConfigEquals = (prev: Config, next: Config) => {
  for (const key of PLANT_ICON_CONFIG_KEYS) {
    if (prev[key] !== next[key]) { return false; }
  }
  return true;
};

const plantInstancesPropsEqual = (
  prev: PlantInstancesProps,
  next: PlantInstancesProps,
) =>
  prev.plants === next.plants &&
  prev.getZ === next.getZ &&
  prev.visible === next.visible &&
  prev.startTimeRef === next.startTimeRef &&
  prev.dispatch === next.dispatch &&
  prev.iconCapacities === next.iconCapacities &&
  plantIconConfigEquals(prev.config, next.config);

const plantIconRaycast = function (
  this: ThreeInstancedMesh,
  raycaster: Raycaster,
  intersects: Intersection[],
) {
  if (HOVER_OBJECT_MODES.includes(getMode())) { return; }
  ThreeInstancedMesh.prototype.raycast.call(this, raycaster, intersects);
};

const useStaticPlantIconInstances = (
  plants: ThreeDGardenPlant[],
  config: Config,
  getZ: (x: number, y: number) => number,
) => {
  const get3DPosition = React.useMemo(() => get3DPositionFunc(config), [config]);
  const zBase = React.useMemo(() => zZeroFunc(config), [config]);
  return React.useMemo<StaticPlantIconInstance[]>(() => {
    return plants.map(plant => {
      const position = get3DPosition({ x: plant.x, y: plant.y });
      return {
        x: position.x,
        y: position.y,
        groundZ: zBase + getZ(plant.x, plant.y),
        scale: plant.size,
      };
    });
  }, [get3DPosition, getZ, plants, zBase]);
};

interface UsePlantIconFrameProps {
  config: Config;
  plants: ThreeDGardenPlant[];
  visible?: boolean;
  startTimeRef?: React.RefObject<number>;
  staticInstances: StaticPlantIconInstance[];
  instancedRef: React.RefObject<ThreeInstancedMesh | null>;
  materialRef: React.RefObject<ThreeMeshBasicMaterial | null>;
}

const usePlantIconFrame = (props: UsePlantIconFrameProps) => {
  const {
    config, plants, visible, startTimeRef, staticInstances,
    instancedRef, materialRef,
  } = props;
  const lastBrightness = React.useRef<number | undefined>(undefined);
  const updateStateRef =
    React.useRef<PlantIconUpdateState>(newPlantIconUpdateState());
  const getUpdateState = () => {
    const current =
      updateStateRef.current as Partial<PlantIconUpdateState> | undefined;
    if (!current?.lastCameraQuaternion) {
      updateStateRef.current = newPlantIconUpdateState();
    }
    return updateStateRef.current;
  };
  const tempMatrix = React.useMemo(() => new Matrix4(), []);
  const tempPosition = React.useMemo(() => new Vector3(), []);
  const tempScale = React.useMemo(() => new Vector3(), []);
  const tempQuaternion = React.useMemo(() => new Quaternion(), []);
  const seasonAnimationEnabled = !!(config.animateSeasons && startTimeRef);

  React.useEffect(() => {
    const updateState = getUpdateState();
    updateState.needsMatrixUpdate = true;
    lastBrightness.current = undefined;
  }, [config, plants, startTimeRef, staticInstances]);

  // eslint-disable-next-line complexity
  useFrame(state => {
    const mesh = instancedRef.current;
    if (!mesh || visible === false) { return; }
    if (plants.length == 0) { return; }
    const updateState = getUpdateState();
    const seasonAnimating = seasonAnimationEnabled;
    const cameraChanged = !updateState.hasCameraQuaternion
      || !updateState.lastCameraQuaternion.equals(state.camera.quaternion);
    let sunFactor = calcSunI(config.sunInclination);
    let seasonT = 0;
    if (seasonAnimating) {
      const currentTime = performance.now() / 1000;
      seasonT = currentTime - (startTimeRef.current || 0);
      const date = getAnimatedSeasonDate(config.plants, seasonT);
      sunFactor = calcSunI(calcSunCoordinate(date, 0, 52, 0).inclination);
    }
    const brightness = plantIconBrightness(sunFactor);
    if (materialRef.current &&
      materialRef.current.color &&
      brightness != lastBrightness.current) {
      materialRef.current.color.setScalar(brightness);
      lastBrightness.current = brightness;
    }
    if (!updateState.needsMatrixUpdate && !seasonAnimating && !cameraChanged) {
      return;
    }
    tempQuaternion.copy(state.camera.quaternion);
    if (!seasonAnimating) {
      staticInstances.forEach((instance, index) => {
        tempPosition.set(
          instance.x,
          instance.y,
          instance.groundZ + instance.scale / 2,
        );
        tempScale.set(instance.scale, instance.scale, instance.scale);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        mesh.setMatrixAt(index, tempMatrix);
      });
    } else {
      plants.forEach((plant, index) => {
        const instance = staticInstances[index];
        const scale = (config.animateSeasons && startTimeRef)
          ? plant.size * getSizeAtTime(plant, config.plants, seasonT)
          : plant.size;
        tempPosition.set(
          instance.x,
          instance.y,
          instance.groundZ + scale / 2,
        );
        tempScale.set(scale, scale, scale);
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        mesh.setMatrixAt(index, tempMatrix);
      });
    }
    mesh.instanceMatrix.needsUpdate = true;
    updateState.lastCameraQuaternion.copy(state.camera.quaternion);
    updateState.hasCameraQuaternion = true;
    updateState.needsMatrixUpdate = false;
  });
};

const usePlantIconClick = (
  plants: ThreeDGardenPlant[],
  dispatch: Function | undefined,
  visible: boolean | undefined,
) => {
  const navigate = useNavigate();
  return (event: ThreeEvent<MouseEvent>) => {
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
};

const onAtlasMaterialCompile = (
  shader: { vertexShader?: string },
) => {
  if (!shader.vertexShader) { return; }
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `#include <common>
     attribute vec2 instanceUvOffset;
     attribute vec2 instanceUvRepeat;`,
  ).replace(
    "#include <uv_vertex>",
    `#include <uv_vertex>
     #ifdef USE_MAP
       vMapUv = MAP_UV * instanceUvRepeat + instanceUvOffset;
     #endif`,
  );
};

const atlasUvBuffers = (
  plants: ThreeDGardenPlant[],
  capacity: number,
) => {
  const offsets = new Float32Array(capacity * 2);
  const repeats = new Float32Array(capacity * 2);
  for (let index = 0; index < capacity; index++) {
    repeats[index * 2] = 1;
    repeats[index * 2 + 1] = 1;
  }
  plants.forEach((plant, index) => {
    const transform = getPlantIconTextureTransform(plant.icon);
    if (!transform) { return; }
    offsets[index * 2] = transform.offset[0];
    offsets[index * 2 + 1] = transform.offset[1];
    repeats[index * 2] = transform.repeat[0];
    repeats[index * 2 + 1] = transform.repeat[1];
  });
  return { offsets, repeats };
};

const AtlasPlantIconInstances = (props: AtlasPlantIconInstancesProps) => {
  const {
    config, plants, visible, startTimeRef, dispatch, getZ, plantIndexes,
  } = props;
  const texture = useTexture(props.atlasUrl);
  // eslint-disable-next-line no-null/no-null
  const instancedRef = React.useRef<ThreeInstancedMesh>(null);
  // eslint-disable-next-line no-null/no-null
  const materialRef = React.useRef<ThreeMeshBasicMaterial>(null);
  const staticInstances = useStaticPlantIconInstances(plants, config, getZ);
  const uvBuffers = React.useMemo(() =>
    atlasUvBuffers(plants, props.capacity), [plants, props.capacity]);
  usePlantIconFrame({
    config,
    plants,
    visible,
    startTimeRef,
    staticInstances,
    instancedRef,
    materialRef,
  });
  const onClick = usePlantIconClick(plants, dispatch, visible);

  return <InstancedMesh
    ref={instancedRef}
    args={[getPlantIconGeometry(), undefined, props.capacity]}
    // eslint-disable-next-line no-null/no-null
    dispose={null}
    count={plants.length}
    frustumCulled={false}
    userData={{ plantIndexes }}
    visible={visible}
    raycast={plantIconRaycast}
    onClick={onClick}
    renderOrder={RenderOrder.plants}>
    <instancedBufferAttribute
      attach={"geometry-attributes-instanceUvOffset"}
      args={[uvBuffers.offsets, 2]} />
    <instancedBufferAttribute
      attach={"geometry-attributes-instanceUvRepeat"}
      args={[uvBuffers.repeats, 2]} />
    <MeshBasicMaterial
      ref={materialRef}
      map={texture}
      alphaTest={0.1}
      transparent={true}
      onBeforeCompile={onAtlasMaterialCompile} />
  </InstancedMesh>;
};

const PlantIconInstances = (props: PlantIconInstancesProps) => {
  const {
    config, plants, icon, visible, startTimeRef, dispatch, getZ, plantIndexes,
    useAtlas,
  } = props;
  const textureUrl = getPlantIconTextureUrl(icon, useAtlas);
  const baseTexture = useTexture(textureUrl);
  const texture = React.useMemo(
    () => getPlantIconTexture(baseTexture, icon, useAtlas),
    [baseTexture, icon, useAtlas]);
  // eslint-disable-next-line no-null/no-null
  const instancedRef = React.useRef<ThreeInstancedMesh>(null);
  // eslint-disable-next-line no-null/no-null
  const materialRef = React.useRef<ThreeMeshBasicMaterial>(null);
  const staticInstances = useStaticPlantIconInstances(plants, config, getZ);
  usePlantIconFrame({
    config,
    plants,
    visible,
    startTimeRef,
    staticInstances,
    instancedRef,
    materialRef,
  });
  const onClick = usePlantIconClick(plants, dispatch, visible);

  return <InstancedMesh
    ref={instancedRef}
    args={[getPlantIconGeometry(), undefined, props.capacity]}
    // eslint-disable-next-line no-null/no-null
    dispose={null}
    count={plants.length}
    frustumCulled={false}
    userData={{ plantIndexes }}
    visible={visible}
    raycast={plantIconRaycast}
    onClick={onClick}
    renderOrder={RenderOrder.plants}>
    <MeshBasicMaterial
      ref={materialRef}
      map={texture}
      alphaTest={0.1}
      transparent={true} />
  </InstancedMesh>;
};

export const PlantInstances = React.memo(
  (props: PlantInstancesProps) => {
    if (props.visible === false) { return <></>; }
    return <VisiblePlantInstances {...props} />;
  },
  plantInstancesPropsEqual,
);

const VisiblePlantInstances = (props: PlantInstancesProps) => {
  const { atlas, instances } = React.useMemo(() => {
    const iconInstances: Record<string, PlantIconInstancesProps> = {};
    Object.entries(props.iconCapacities || {}).map(([icon, capacity]) => {
      iconInstances[icon] = {
        config: props.config,
        dispatch: props.dispatch,
        getZ: props.getZ,
        icon,
        plants: [],
        plantIndexes: [],
        capacity,
        useAtlas: false,
        startTimeRef: props.startTimeRef,
        visible: props.visible,
      };
    });
    props.plants.forEach((plant, index) => {
      const instance = iconInstances[plant.icon];
      if (instance) {
        instance.plants.push(plant);
        instance.plantIndexes.push(index);
      } else {
        iconInstances[plant.icon] = {
          config: props.config,
          dispatch: props.dispatch,
          getZ: props.getZ,
          icon: plant.icon,
          plants: [plant],
          plantIndexes: [index],
          capacity: 0,
          useAtlas: false,
          startTimeRef: props.startTimeRef,
          visible: props.visible,
        };
      }
    });
    const visibleInstances = Object.values(iconInstances)
      .filter(instance => instance.plants.length > 0);
    const useAtlas =
      visibleInstances.length >= PLANT_ICON_ATLAS_MIN_ICON_COUNT;
    const instances = visibleInstances
      .map(instance => ({
        ...instance,
        useAtlas,
        capacity: Math.max(
          instance.plants.length,
          props.iconCapacities?.[instance.icon] || 0,
        ),
      }));
    if (!useAtlas) { return { atlas: undefined, instances }; }
    const atlasPlants: ThreeDGardenPlant[] = [];
    const atlasPlantIndexes: number[] = [];
    let atlasCapacity = 0;
    let atlasUrl = "";
    const individualInstances: PlantIconInstancesProps[] = [];
    instances.forEach(instance => {
      if (getPlantIconTextureTransform(instance.icon)) {
        if (!atlasUrl) {
          atlasUrl = getPlantIconTextureUrl(instance.icon, true);
        }
        atlasPlants.push(...instance.plants);
        atlasPlantIndexes.push(...instance.plantIndexes);
        atlasCapacity += instance.capacity;
      } else {
        individualInstances.push({ ...instance, useAtlas: false });
      }
    });
    const atlas = atlasPlants.length > 0
      ? {
        plants: atlasPlants,
        plantIndexes: atlasPlantIndexes,
        capacity: Math.max(atlasPlants.length, atlasCapacity),
        atlasUrl,
      }
      : undefined;
    return { atlas, instances: individualInstances };
  }, [
    props.config,
    props.dispatch,
    props.getZ,
    props.iconCapacities,
    props.plants,
    props.startTimeRef,
    props.visible,
  ]);

  return <>
    {atlas &&
      <AtlasPlantIconInstances
        key={`atlas-${atlas.capacity}`}
        {...props}
        plants={atlas.plants}
        plantIndexes={atlas.plantIndexes}
        capacity={atlas.capacity}
        atlasUrl={atlas.atlasUrl} />}
    {instances.map(instance =>
      <PlantIconInstances
        key={`${instance.icon}-${instance.capacity}`}
        {...instance} />)}
  </>;
};
