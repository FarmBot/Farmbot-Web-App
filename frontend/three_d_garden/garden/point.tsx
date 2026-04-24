import React from "react";
import { SpecialStatus, TaggedGenericPointer, Xyz } from "farmbot";
import { Config } from "../config";
import {
  Group, InstancedMesh, MeshPhongMaterial,
} from "../components";
import { Cylinder, Sphere, Torus } from "@react-three/drei";
import {
  DoubleSide,
  Euler,
  InstancedMesh as InstancedMeshType,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { ThreeEvent } from "@react-three/fiber";
import { getWorldPositionFunc } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined, round } from "lodash";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { DesignerState } from "../../farm_designer/interfaces";
import { getMode } from "../../farm_designer/map/util";
import { Mode } from "../../farm_designer/map/interfaces";
import { WeedBase } from ".";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import {
  BillboardRef, ImageRef, RadiusRef, TorusRef,
} from "../bed/objects/pointer_objects";

const POINT_PIN_RADIUS = 12.5;
const POINT_PIN_HEIGHT = 50;
const POINT_CYLINDER_HEIGHT = 25;
const POINT_CYLINDER_INNER_R_FRACTION = 0.95;
const POINT_CYLINDER_TUBE_SIZE = 1 - POINT_CYLINDER_INNER_R_FRACTION;
export const POINT_CYLINDER_SCALE_FACTOR =
  round(1 / POINT_CYLINDER_TUBE_SIZE ** 2);
const SEGMENTS = 64;

export interface PointProps {
  point: TaggedGenericPointer;
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
}

export const Point = (props: PointProps) => {
  const { point, config } = props;
  const navigate = useNavigate();
  const unsaved = point.specialStatus !== SpecialStatus.SAVED;
  return <PointBase
    pointName={"" + point.body.id}
    alpha={unsaved ? 0.5 : 1}
    position={{
      x: point.body.x,
      y: point.body.y,
      z: props.getZ(point.body.x, point.body.y),
    }}
    onClick={() => {
      if (point.body.id && !isUndefined(props.dispatch) && props.visible &&
        !HOVER_OBJECT_MODES.includes(getMode())) {
        props.dispatch(setPanelOpen(true));
        navigate(Path.points(point.body.id));
      }
    }}
    config={config}
    color={point.body.meta.color}
    radius={point.body.radius}
  />;
};

interface PointInstance {
  point: TaggedGenericPointer;
  position: [number, number, number];
  radius: number;
}

interface PointInstanceBucket {
  color: string | undefined;
  alpha: number;
  points: PointInstance[];
  ringPoints: PointInstance[];
}

export interface PointInstancesProps {
  points: TaggedGenericPointer[];
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
}

const pointAlpha = (point: TaggedGenericPointer) =>
  point.specialStatus !== SpecialStatus.SAVED ? 0.5 : 1;

const pointBucketKey = (point: TaggedGenericPointer) =>
  `${point.body.meta.color || ""}-${pointAlpha(point)}`;

const getPointInstanceBuckets = (
  points: TaggedGenericPointer[],
  config: Config,
  getZ: (x: number, y: number) => number,
) => {
  const getWorldPosition = getWorldPositionFunc(config);
  const buckets: Record<string, PointInstanceBucket> = {};
  points.forEach(point => {
    const alpha = pointAlpha(point);
    const key = pointBucketKey(point);
    const instance = {
      point,
      position: getWorldPosition({
        x: point.body.x,
        y: point.body.y,
        z: getZ(point.body.x, point.body.y),
      }),
      radius: point.body.radius,
    };
    buckets[key] ||= {
      color: point.body.meta.color,
      alpha,
      points: [],
      ringPoints: [],
    };
    buckets[key].points.push(instance);
    if (point.body.radius > 0) { buckets[key].ringPoints.push(instance); }
  });
  return Object.values(buckets);
};

interface PointInstanceBucketProps extends PointInstancesProps {
  bucket: PointInstanceBucket;
}

const PointBucketInstances = (props: PointInstanceBucketProps) => {
  const { bucket, dispatch, visible } = props;
  const navigate = useNavigate();
  // eslint-disable-next-line no-null/no-null
  const pinRef = React.useRef<InstancedMeshType>(null);
  // eslint-disable-next-line no-null/no-null
  const sphereRef = React.useRef<InstancedMeshType>(null);
  // eslint-disable-next-line no-null/no-null
  const ringRef = React.useRef<InstancedMeshType>(null);
  const tempMatrix = React.useMemo(() => new Matrix4(), []);
  const tempPosition = React.useMemo(() => new Vector3(), []);
  const pinRotation = React.useMemo(() =>
    new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)), []);
  const noRotation = React.useMemo(() => new Quaternion(), []);
  const noScale = React.useMemo(() => new Vector3(1, 1, 1), []);
  const ringScale = React.useMemo(() => new Vector3(), []);

  React.useEffect(() => {
    const pinMesh = pinRef.current;
    const sphereMesh = sphereRef.current;
    if (!pinMesh?.setMatrixAt || !sphereMesh?.setMatrixAt) { return; }
    bucket.points.forEach((instance, index) => {
      const [x, y, z] = instance.position;
      tempPosition.set(x, y, z + POINT_PIN_HEIGHT / 2);
      tempMatrix.compose(tempPosition, pinRotation, noScale);
      pinMesh.setMatrixAt(index, tempMatrix);
      tempPosition.set(x, y, z + POINT_PIN_HEIGHT);
      tempMatrix.compose(tempPosition, noRotation, noScale);
      sphereMesh.setMatrixAt(index, tempMatrix);
    });
    pinMesh.instanceMatrix.needsUpdate = true;
    sphereMesh.instanceMatrix.needsUpdate = true;
  }, [bucket.points, noRotation, noScale, pinRotation, tempMatrix, tempPosition]);

  React.useEffect(() => {
    const ringMesh = ringRef.current;
    if (!ringMesh?.setMatrixAt) { return; }
    bucket.ringPoints.forEach((instance, index) => {
      const [x, y, z] = instance.position;
      tempPosition.set(x, y, z);
      ringScale.set(
        instance.radius,
        instance.radius,
        POINT_CYLINDER_SCALE_FACTOR,
      );
      tempMatrix.compose(tempPosition, noRotation, ringScale);
      ringMesh.setMatrixAt(index, tempMatrix);
    });
    ringMesh.instanceMatrix.needsUpdate = true;
  }, [bucket.ringPoints, noRotation, ringScale, tempMatrix, tempPosition]);

  const onClick = (instances: PointInstance[]) =>
    (event: ThreeEvent<MouseEvent>) => {
      const instanceId = event.instanceId;
      if (isUndefined(instanceId)) { return; }
      const point = instances[instanceId]?.point;
      if (point?.body.id && dispatch && visible &&
        !HOVER_OBJECT_MODES.includes(getMode())) {
        dispatch(setPanelOpen(true));
        navigate(Path.points(point.body.id));
      }
    };

  return <>
    <InstancedMesh
      ref={pinRef}
      name={"marker"}
      args={[undefined, undefined, bucket.points.length]}
      visible={visible}
      onClick={onClick(bucket.points)}
      renderOrder={RenderOrder.default}>
      <cylinderGeometry
        args={[POINT_PIN_RADIUS, 0, POINT_PIN_HEIGHT, 16, 2, true]} />
      <MeshPhongMaterial
        color={bucket.color}
        side={DoubleSide}
        transparent={true}
        opacity={1 * bucket.alpha} />
    </InstancedMesh>
    <InstancedMesh
      ref={sphereRef}
      name={"marker"}
      args={[undefined, undefined, bucket.points.length]}
      visible={visible}
      onClick={onClick(bucket.points)}
      renderOrder={RenderOrder.default}>
      <sphereGeometry args={[POINT_PIN_RADIUS, 16, 16]} />
      <MeshPhongMaterial
        color={bucket.color}
        side={DoubleSide}
        transparent={true}
        opacity={1 * bucket.alpha} />
    </InstancedMesh>
    {bucket.ringPoints.length > 0 &&
      <InstancedMesh
        ref={ringRef}
        name={"marker-radius"}
        args={[undefined, undefined, bucket.ringPoints.length]}
        visible={visible}
        onClick={onClick(bucket.ringPoints)}
        renderOrder={RenderOrder.default}>
        <torusGeometry
          args={[1, POINT_CYLINDER_TUBE_SIZE, SEGMENTS, SEGMENTS]} />
        <MeshPhongMaterial
          color={bucket.color}
          transparent={true}
          opacity={0.5 * bucket.alpha} />
      </InstancedMesh>}
  </>;
};

export const PointInstances = React.memo((props: PointInstancesProps) => {
  const buckets = React.useMemo(
    () => getPointInstanceBuckets(props.points, props.config, props.getZ),
    [props.points, props.config, props.getZ]);
  return <>
    {buckets.map(bucket =>
      <PointBucketInstances
        key={`${bucket.color || ""}-${bucket.alpha}`}
        {...props}
        bucket={bucket} />)}
  </>;
});

export interface DrawnPointProps {
  designer: DesignerState;
  usePosition: boolean;
  config: Config;
  radiusRef?: RadiusRef;
  torusRef?: TorusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
}

export const DrawnPoint = (props: DrawnPointProps) => {
  const { config } = props;
  const { drawnPoint } = props.designer;
  const drawnPointPosition =
    drawnPoint && !isUndefined(drawnPoint.cx) && !isUndefined(drawnPoint.cy)
      ? { x: drawnPoint.cx, y: drawnPoint.cy, z: drawnPoint.z }
      : undefined;
  if (props.usePosition && isUndefined(drawnPointPosition)) { return <></>; }
  const Base = getMode() == Mode.createWeed ? WeedBase : PointBase;
  return <Base
    pointName={"drawn-point"}
    alpha={0.5}
    position={props.usePosition ? drawnPointPosition : undefined}
    color={drawnPoint?.color}
    config={config}
    radius={drawnPoint?.r || 0}
    radiusRef={props.radiusRef}
    torusRef={props.torusRef}
    billboardRef={props.billboardRef}
    imageRef={props.imageRef} />;
};

interface PointBaseProps {
  pointName: string;
  position?: Record<Xyz, number>;
  onClick?: () => void;
  color: string | undefined;
  radius: number;
  alpha: number;
  config: Config;
  torusRef?: TorusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
}

const PointBase = (props: PointBaseProps) => {
  const {
    pointName, position, onClick, color, alpha, config, radius, torusRef,
  } = props;
  const getWorldPosition = getWorldPositionFunc(config);
  return <Group
    name={"point-" + pointName}
    renderOrder={RenderOrder.default}
    rotation={[Math.PI / 2, 0, 0]}
    position={position
      ? getWorldPosition(position)
      : [0, 0, 0]}>
    <Group name={"marker"}
      onClick={onClick}>
      <Cylinder
        args={[POINT_PIN_RADIUS, 0, POINT_PIN_HEIGHT, 16, 2, true]}
        position={[0, POINT_PIN_HEIGHT / 2, 0]}>
        <MeshPhongMaterial
          color={color}
          side={DoubleSide}
          transparent={true}
          opacity={1 * alpha} />
      </Cylinder>
      <Sphere
        args={[POINT_PIN_RADIUS, 16, 16]}
        position={[0, POINT_PIN_HEIGHT, 0]}>
        <MeshPhongMaterial
          color={color}
          side={DoubleSide}
          transparent={true}
          opacity={1 * alpha} />
      </Sphere>
    </Group>
    {radius > 0 &&
      <HollowCylinder
        torusRef={torusRef}
        radius={radius}
        thickness={10}
        color={color}
        alpha={0.5 * alpha} />}
  </Group>;
};

interface HollowCylinderProps {
  radius: number;
  thickness: number;
  color?: string;
  alpha: number;
  torusRef?: TorusRef;
}

const HollowCylinder = (
  { radius, color, alpha, torusRef }: HollowCylinderProps,
) => {
  return torusRef
    ? <Torus
      ref={torusRef}
      scale={[radius, radius, POINT_CYLINDER_SCALE_FACTOR]}
      rotation={[-Math.PI / 2, 0, 0]}
      args={[1, POINT_CYLINDER_TUBE_SIZE, SEGMENTS, SEGMENTS]}>
      <MeshPhongMaterial
        color={color}
        transparent={true}
        opacity={alpha} />
    </Torus>
    : <Torus
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1, 1, POINT_CYLINDER_HEIGHT / 5]}
      args={[radius, 5, SEGMENTS, SEGMENTS]}>
      <MeshPhongMaterial
        color={color}
        transparent={true}
        opacity={alpha} />
    </Torus>;
};
