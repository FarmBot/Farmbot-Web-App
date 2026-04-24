import React from "react";
import { TaggedWeedPointer, Xyz } from "farmbot";
import { Config } from "../config";
import { ASSETS, HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import {
  Group, InstancedMesh, MeshBasicMaterial, MeshPhongMaterial, PlaneGeometry,
} from "../components";
import { Image, Billboard, Sphere, useTexture } from "@react-three/drei";
import {
  InstancedMesh as InstancedMeshType,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { getWorldPositionFunc } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined } from "lodash";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { getMode } from "../../farm_designer/map/util";
import { RadiusRef, BillboardRef, ImageRef } from "../bed/objects/pointer_objects";

export const WEED_IMG_SIZE_FRACTION = 0.89;

export interface WeedProps {
  weed: TaggedWeedPointer;
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
}

export const Weed = (props: WeedProps) => {
  const { weed, config } = props;
  const navigate = useNavigate();
  return <WeedBase
    pointName={"" + weed.body.id}
    alpha={1}
    onClick={() => {
      if (weed.body.id && !isUndefined(props.dispatch) && props.visible &&
        !HOVER_OBJECT_MODES.includes(getMode())) {
        props.dispatch(setPanelOpen(true));
        navigate(Path.weeds(weed.body.id));
      }
    }}
    position={{
      x: weed.body.x,
      y: weed.body.y,
      z: props.getZ(weed.body.x, weed.body.y),
    }}
    config={config}
    color={weed.body.meta.color}
    radius={weed.body.radius} />;
};

interface WeedBaseProps {
  pointName: string;
  position?: Record<Xyz, number>;
  onClick?: () => void;
  color: string | undefined;
  radius: number;
  alpha: number;
  config: Config;
  radiusRef?: RadiusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
}

export const WeedBase = (props: WeedBaseProps) => {
  const {
    pointName, position, onClick, color, radius, alpha, config,
    radiusRef, billboardRef, imageRef,
  } = props;
  const getWorldPosition = getWorldPositionFunc(config);
  const weedSize = radius == 0 ? 50 : radius;
  const iconSize = weedSize * WEED_IMG_SIZE_FRACTION;
  return <Group
    name={"weed-" + pointName}
    position={position
      ? getWorldPosition(position)
      : [0, 0, 0]}
    onClick={onClick}>
    <Billboard
      ref={billboardRef}
      follow={true}
      position={[0, 0, iconSize / 2]}>
      <Image
        ref={imageRef}
        renderOrder={RenderOrder.weedImages}
        url={ASSETS.other.weed}
        scale={iconSize}
        transparent={true}
        opacity={1 * alpha}
        position={[0, 0, 0]} />
    </Billboard>
    <Sphere
      ref={radiusRef}
      scale={weedSize}
      renderOrder={RenderOrder.weedSpheres}
      args={[1, 32, 32]}
      position={[0, 0, iconSize / 2]}>
      <MeshPhongMaterial
        color={color}
        depthWrite={false}
        transparent={true}
        opacity={0.5 * alpha} />
    </Sphere>
  </Group>;
};

interface WeedInstance {
  weed: TaggedWeedPointer;
  position: [number, number, number];
  weedSize: number;
  iconSize: number;
}

interface WeedColorBucket {
  color: string | undefined;
  weeds: WeedInstance[];
}

export interface WeedInstancesProps {
  weeds: TaggedWeedPointer[];
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
}

const weedSize = (weed: TaggedWeedPointer) =>
  weed.body.radius == 0 ? 50 : weed.body.radius;

const getWeedInstances = (
  weeds: TaggedWeedPointer[],
  config: Config,
  getZ: (x: number, y: number) => number,
) => {
  const getWorldPosition = getWorldPositionFunc(config);
  return weeds.map(weed => {
    const size = weedSize(weed);
    return {
      weed,
      position: getWorldPosition({
        x: weed.body.x,
        y: weed.body.y,
        z: getZ(weed.body.x, weed.body.y),
      }),
      weedSize: size,
      iconSize: size * WEED_IMG_SIZE_FRACTION,
    };
  });
};

const getWeedColorBuckets = (weeds: WeedInstance[]) => {
  const buckets: Record<string, WeedColorBucket> = {};
  weeds.forEach(weed => {
    const color = weed.weed.body.meta.color;
    const key = color || "";
    buckets[key] ||= { color, weeds: [] };
    buckets[key].weeds.push(weed);
  });
  return Object.values(buckets);
};

interface WeedIconUpdateState {
  lastCameraQuaternion: Quaternion;
  hasCameraQuaternion: boolean;
  needsMatrixUpdate: boolean;
}

const newWeedIconUpdateState = (): WeedIconUpdateState => ({
  lastCameraQuaternion: new Quaternion(),
  hasCameraQuaternion: false,
  needsMatrixUpdate: true,
});

const useNavigateToWeed = (
  dispatch: Function | undefined,
  visible: boolean,
) => {
  const navigate = useNavigate();
  return (weed: TaggedWeedPointer | undefined) => {
    if (weed?.body.id && dispatch && visible &&
      !HOVER_OBJECT_MODES.includes(getMode())) {
      dispatch(setPanelOpen(true));
      navigate(Path.weeds(weed.body.id));
    }
  };
};

interface WeedIconInstancesProps extends WeedInstancesProps {
  weedInstances: WeedInstance[];
}

const WeedIconInstances = (props: WeedIconInstancesProps) => {
  const { weedInstances, dispatch, visible } = props;
  const texture = useTexture(ASSETS.other.weed);
  const navigateToWeed = useNavigateToWeed(dispatch, visible);
  // eslint-disable-next-line no-null/no-null
  const instancedRef = React.useRef<InstancedMeshType>(null);
  const updateStateRef =
    React.useRef<WeedIconUpdateState>(newWeedIconUpdateState());
  const getUpdateState = () => {
    const current =
      updateStateRef.current as Partial<WeedIconUpdateState> | undefined;
    if (!current?.lastCameraQuaternion) {
      updateStateRef.current = newWeedIconUpdateState();
    }
    return updateStateRef.current;
  };
  const tempMatrix = React.useMemo(() => new Matrix4(), []);
  const tempPosition = React.useMemo(() => new Vector3(), []);
  const tempScale = React.useMemo(() => new Vector3(), []);
  const tempQuaternion = React.useMemo(() => new Quaternion(), []);

  React.useEffect(() => {
    getUpdateState().needsMatrixUpdate = true;
  }, [weedInstances]);

  useFrame(state => {
    const mesh = instancedRef.current;
    if (!mesh?.setMatrixAt || visible === false) { return; }
    const updateState = getUpdateState();
    const cameraChanged = !updateState.hasCameraQuaternion
      || !updateState.lastCameraQuaternion.equals(state.camera.quaternion);
    if (!updateState.needsMatrixUpdate && !cameraChanged) { return; }
    tempQuaternion.copy(state.camera.quaternion);
    weedInstances.forEach((weed, index) => {
      const [x, y, z] = weed.position;
      tempPosition.set(x, y, z + weed.iconSize / 2);
      tempScale.set(weed.iconSize, weed.iconSize, 1);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mesh.setMatrixAt(index, tempMatrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    updateState.lastCameraQuaternion.copy(state.camera.quaternion);
    updateState.hasCameraQuaternion = true;
    updateState.needsMatrixUpdate = false;
  });

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    const instanceId = event.instanceId;
    if (isUndefined(instanceId)) { return; }
    navigateToWeed(weedInstances[instanceId]?.weed);
  };

  return <InstancedMesh
    ref={instancedRef}
    name={"weed-icons"}
    args={[undefined, undefined, weedInstances.length]}
    visible={visible}
    onClick={onClick}
    renderOrder={RenderOrder.weedImages}>
    <PlaneGeometry args={[1, 1]} />
    <MeshBasicMaterial
      map={texture}
      transparent={true}
      opacity={1} />
  </InstancedMesh>;
};

interface WeedRadiusInstancesProps extends WeedInstancesProps {
  bucket: WeedColorBucket;
}

const WeedRadiusInstances = (props: WeedRadiusInstancesProps) => {
  const { bucket, dispatch, visible } = props;
  const navigateToWeed = useNavigateToWeed(dispatch, visible);
  // eslint-disable-next-line no-null/no-null
  const instancedRef = React.useRef<InstancedMeshType>(null);
  const tempMatrix = React.useMemo(() => new Matrix4(), []);
  const tempPosition = React.useMemo(() => new Vector3(), []);
  const noRotation = React.useMemo(() => new Quaternion(), []);
  const tempScale = React.useMemo(() => new Vector3(), []);

  React.useEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh?.setMatrixAt) { return; }
    bucket.weeds.forEach((weed, index) => {
      const [x, y, z] = weed.position;
      tempPosition.set(x, y, z + weed.iconSize / 2);
      tempScale.set(weed.weedSize, weed.weedSize, weed.weedSize);
      tempMatrix.compose(tempPosition, noRotation, tempScale);
      mesh.setMatrixAt(index, tempMatrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [bucket.weeds, noRotation, tempMatrix, tempPosition, tempScale]);

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    const instanceId = event.instanceId;
    if (isUndefined(instanceId)) { return; }
    navigateToWeed(bucket.weeds[instanceId]?.weed);
  };

  return <InstancedMesh
    ref={instancedRef}
    name={"weed-radius"}
    args={[undefined, undefined, bucket.weeds.length]}
    visible={visible}
    onClick={onClick}
    renderOrder={RenderOrder.weedSpheres}>
    <sphereGeometry args={[1, 32, 32]} />
    <MeshPhongMaterial
      color={bucket.color}
      depthWrite={false}
      transparent={true}
      opacity={0.5} />
  </InstancedMesh>;
};

export const WeedInstances = React.memo((props: WeedInstancesProps) => {
  const weedInstances = React.useMemo(
    () => getWeedInstances(props.weeds, props.config, props.getZ),
    [props.weeds, props.config, props.getZ]);
  const buckets = React.useMemo(
    () => getWeedColorBuckets(weedInstances),
    [weedInstances]);
  return <>
    <WeedIconInstances {...props} weedInstances={weedInstances} />
    {buckets.map(bucket =>
      <WeedRadiusInstances
        key={bucket.color || ""}
        {...props}
        bucket={bucket} />)}
  </>;
});
