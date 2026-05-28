import { Billboard, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React from "react";
import { getWorldPositionFunc } from "./helpers";
import { Config } from "./config";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { sortGroupBy } from "../point_groups/point_group_sort";
import { TaggedPoint, TaggedPointGroup } from "farmbot";
import { findGroupFromUrl } from "../point_groups/find_group_from_url";
import { pointsSelectedByGroup } from "../point_groups/criteria/apply";
import { Group, InstancedMesh, MeshPhongMaterial } from "./components";
import { Text } from "./elements";
import { RenderOrder } from "./constants";
import { isEqual } from "lodash";
import {
  InstancedMesh as InstancedMeshType,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";

interface CommonProps {
  config: Config;
  getZ(x: number, y: number): number;
  tryGroupSortType: PointGroupSortType | undefined;
}

export interface GroupOrderVisualProps extends CommonProps {
  allPoints: TaggedPoint[];
  groups: TaggedPointGroup[];
}

interface SelectedGroupPointsCache {
  group: TaggedPointGroup;
  allPoints: TaggedPoint[];
  groupPoints: TaggedPoint[];
}

let selectedGroupPointsCache: SelectedGroupPointsCache | undefined = undefined;

const samePointRefs = (prev: TaggedPoint[], next: TaggedPoint[]) => {
  if (prev == next) { return true; }
  if (prev.length != next.length) { return false; }
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] != next[i]) { return false; }
  }
  return true;
};

const samePointIds = (prev: number[], next: number[]) => {
  if (prev == next) { return true; }
  if (prev.length != next.length) { return false; }
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] != next[i]) { return false; }
  }
  return true;
};

const sameGroupSelection = (
  prev: TaggedPointGroup,
  next: TaggedPointGroup,
) =>
  prev == next ||
  (prev.uuid == next.uuid &&
    prev.body.id == next.body.id &&
    samePointIds(prev.body.point_ids, next.body.point_ids) &&
    isEqual(prev.body.criteria, next.body.criteria));

const selectedGroupPointsFor = (
  group: TaggedPointGroup | undefined,
  allPoints: TaggedPoint[],
) => {
  if (!group) { return []; }
  const cached = selectedGroupPointsCache;
  if (cached &&
    sameGroupSelection(cached.group, group) &&
    samePointRefs(cached.allPoints, allPoints)) {
    return cached.groupPoints;
  }
  const groupPoints = pointsSelectedByGroup(group, allPoints);
  selectedGroupPointsCache = { group, allPoints, groupPoints };
  return groupPoints;
};

export const GroupOrderVisual = (props: GroupOrderVisualProps) => {
  const group = findGroupFromUrl(props.groups);
  const groupPoints = selectedGroupPointsFor(group, props.allPoints);
  if (!group) { return; }
  if (groupPoints.length == 0) { return; }
  return <MemoGroupOrder {...props}
    sortType={group.body.sort_type}
    groupPoints={groupPoints} />;
};

export interface GroupOrderProps extends CommonProps {
  sortType: PointGroupSortType;
  groupPoints: TaggedPoint[];
}

interface OrderMarkerDisksProps {
  positions: [number, number, number][];
}

const OrderMarkerDisks = (props: OrderMarkerDisksProps) => {
  // eslint-disable-next-line no-null/no-null
  const ref = React.useRef<InstancedMeshType>(null);
  const matrix = React.useMemo(() => new Matrix4(), []);
  const position = React.useMemo(() => new Vector3(), []);
  const scale = React.useMemo(() => new Vector3(1, 1, 1), []);
  const markerRotation = React.useMemo(() =>
    new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2), []);
  const quaternion = React.useMemo(() => new Quaternion(), []);
  const lastCameraQuaternion = React.useMemo(() => new Quaternion(), []);
  const hasCameraQuaternion = React.useRef(false);
  const matrixNeedsUpdate = React.useRef(true);

  React.useEffect(() => {
    matrixNeedsUpdate.current = true;
  }, [props.positions]);

  useFrame(state => {
    const mesh = ref.current;
    if (!mesh) { return; }
    const cameraChanged = !hasCameraQuaternion.current ||
      !lastCameraQuaternion.equals(state.camera.quaternion);
    if (!matrixNeedsUpdate.current && !cameraChanged) { return; }
    quaternion.copy(state.camera.quaternion).multiply(markerRotation);
    props.positions.forEach((coords, index) => {
      position.set(coords[0], coords[1], coords[2]);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    lastCameraQuaternion.copy(state.camera.quaternion);
    hasCameraQuaternion.current = true;
    matrixNeedsUpdate.current = false;
  });

  return <InstancedMesh
    name={"group-order-marker-disks"}
    ref={ref}
    args={[undefined, undefined, props.positions.length]}
    count={props.positions.length}
    renderOrder={RenderOrder.pointerPlant}
    frustumCulled={false}>
    <cylinderGeometry args={[35, 35, 5]} />
    <MeshPhongMaterial color={"black"} transparent={true} opacity={0.25} />
  </InstancedMesh>;
};

export const areGroupOrderPropsEqual =
  (prev: GroupOrderProps, next: GroupOrderProps) => {
    if (prev.config.exaggeratedZ != next.config.exaggeratedZ) { return false; }
    if (prev.sortType != next.sortType) { return false; }
    if (prev.tryGroupSortType != next.tryGroupSortType) { return false; }
    if (prev.groupPoints.length != next.groupPoints.length) { return false; }
    for (let i = 0; i < prev.groupPoints.length; i++) {
      if (prev.groupPoints[i].uuid != next.groupPoints[i].uuid) {
        return false;
      }
    }
    return true;
  };

const GroupOrder = (props: GroupOrderProps) => {
  const { sortType, groupPoints, config, getZ, tryGroupSortType } = props;
  const sortedPoints = sortGroupBy(tryGroupSortType || sortType, groupPoints);
  const getWorldPosition = getWorldPositionFunc(config);
  const positions: [number, number, number][] = sortedPoints
    .map(p => {
      if (p.body.pointer_type == "ToolSlot") {
        return getWorldPosition({ x: p.body.x, y: p.body.y, z: p.body.z + 25 });
      }
      if (p.body.pointer_type == "GenericPointer") {
        return getWorldPosition({
          x: p.body.x,
          y: p.body.y,
          z: getZ(p.body.x, p.body.y) + 75,
        });
      }
      return getWorldPosition({
        x: p.body.x,
        y: p.body.y,
        z: getZ(p.body.x, p.body.y) + p.body.radius + 10,
      });
    });
  return <Group name={"group-order"}>
    <Line name={"group-order-line"}
      color={"gray"}
      worldUnits={true}
      dashed={true}
      dashSize={25}
      gapSize={25}
      linewidth={10}
      points={positions} />
    <OrderMarkerDisks positions={positions} />
    {positions.map((p, i) =>
      <Billboard
        key={i}
        follow={true}
        position={p}>
        <Text
          fontSize={25}
          color={"white"}
          thickness={10}
          renderOrder={RenderOrder.plantLabels}
          rotation={[0, 0, 0]}
          position={[0, 0, 0]}>
          {i + 1}
        </Text>
      </Billboard>)}
  </Group>;
};

const MemoGroupOrder = React.memo(GroupOrder, areGroupOrderPropsEqual);
