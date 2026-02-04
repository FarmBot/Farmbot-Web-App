import React from "react";
import {
  InstancedMesh as InstancedMeshType,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useNavigate } from "react-router";
import { useTexture } from "@react-three/drei";
import { isUndefined } from "lodash";
import { Config } from "../config";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import { Path } from "../../internal_urls";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { getMode } from "../../farm_designer/map/util";
import { getSizeAtTime } from "../../promo/plants";
import { FixedNormalMaterial } from "./fixed_normal_material";
import { threeSpace, zZero as zZeroFunc } from "../helpers";
import { ThreeDGardenPlant } from "./plants";
import { PlaneGeometry, InstancedMesh } from "../components";

export interface PlantInstancesProps {
  plants: ThreeDGardenPlant[];
  config: Config;
  getZ(x: number, y: number): number;
  visible?: boolean;
  startTimeRef?: React.RefObject<number>;
  dispatch?: Function;
}

interface PlantIconInstancesProps extends PlantInstancesProps {
  icon: string;
  plants: ThreeDGardenPlant[];
  plantIndexes: number[];
}

const PlantIconInstances = (props: PlantIconInstancesProps) => {
  const {
    config, plants, icon, visible, startTimeRef, dispatch, getZ, plantIndexes,
  } = props;
  const navigate = useNavigate();
  const texture = useTexture(icon);
  // eslint-disable-next-line no-null/no-null
  const instancedRef = React.useRef<InstancedMeshType>(null);
  const tempMatrix = React.useMemo(() => new Matrix4(), []);
  const tempPosition = React.useMemo(() => new Vector3(), []);
  const tempScale = React.useMemo(() => new Vector3(), []);
  const tempQuaternion = React.useMemo(() => new Quaternion(), []);
  const getPlantZ = React.useCallback((size: number, plant: ThreeDGardenPlant) =>
    zZeroFunc(config)
    + getZ(plant.x - config.bedXOffset, plant.y - config.bedYOffset)
    + size / 2, [config, getZ]);

  useFrame(state => {
    const mesh = instancedRef.current;
    if (!mesh) { return; }
    tempQuaternion.copy(state.camera.quaternion);
    const currentTime = performance.now() / 1000;
    const t = startTimeRef ? currentTime - (startTimeRef.current || 0) : 0;
    plants.forEach((plant, index) => {
      const scale = (config.animateSeasons && startTimeRef)
        ? plant.size * getSizeAtTime(plant, config.plants, t)
        : plant.size;
      tempPosition.set(
        threeSpace(plant.x, config.bedLengthOuter),
        threeSpace(plant.y, config.bedWidthOuter),
        getPlantZ(scale, plant),
      );
      tempScale.set(scale, scale, scale);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mesh.setMatrixAt(index, tempMatrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    const instanceId = event.instanceId;
    if (isUndefined(instanceId)) { return; }
    const plant = plants[instanceId];
    if (plant?.id && dispatch && visible &&
      !HOVER_OBJECT_MODES.includes(getMode())) {
      dispatch(setPanelOpen(true));
      navigate(Path.plants(plant.id));
    }
  };

  return <InstancedMesh
    ref={instancedRef}
    args={[undefined, undefined, plants.length]}
    userData={{ plantIndexes }}
    visible={visible}
    onClick={onClick}
    renderOrder={RenderOrder.plants}>
    <PlaneGeometry args={[1, 1]} />
    <FixedNormalMaterial
      map={texture}
      roughness={0}
      metalness={0}
      transparent={true} />
  </InstancedMesh>;
};

export const PlantInstances = (props: PlantInstancesProps) => {
  const instances = React.useMemo(() => {
    const iconInstances: Record<string, PlantIconInstancesProps> = {};
    props.plants.forEach((plant, index) => {
      const instance = iconInstances[plant.icon];
      if (instance) {
        instance.plants.push(plant);
        instance.plantIndexes.push(index);
      } else {
        iconInstances[plant.icon] = {
          ...props,
          icon: plant.icon,
          plants: [plant],
          plantIndexes: [index],
        };
      }
    });
    return Object.values(iconInstances);
  }, [props]);

  return <>
    {instances.map(instance =>
      <PlantIconInstances
        key={instance.icon}
        {...instance} />)}
  </>;
};
