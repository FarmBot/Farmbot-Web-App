import { Billboard, Cylinder, Line } from "@react-three/drei";
import React from "react";
import { getWorldPositionFunc } from "./helpers";
import { Config } from "./config";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { sortGroupBy } from "../point_groups/point_group_sort";
import { TaggedPoint, TaggedPointGroup } from "farmbot";
import { findGroupFromUrl } from "../point_groups/group_detail";
import { pointsSelectedByGroup } from "../point_groups/criteria/apply";
import { Group, MeshPhongMaterial } from "./components";
import { Text } from "./elements";
import { RenderOrder } from "./constants";

interface CommonProps {
  config: Config;
  getZ(x: number, y: number): number;
  tryGroupSortType: PointGroupSortType | undefined;
}

export interface GroupOrderVisualProps extends CommonProps {
  allPoints: TaggedPoint[];
  groups: TaggedPointGroup[];
}

export const GroupOrderVisual = (props: GroupOrderVisualProps) => {
  const group = findGroupFromUrl(props.groups);
  if (!group) { return; }
  const groupPoints = pointsSelectedByGroup(group, props.allPoints);
  if (groupPoints.length == 0) { return; }
  return <MemoGroupOrder {...props}
    sortType={group.body.sort_type}
    groupPoints={groupPoints} />;
};

export interface GroupOrderProps extends CommonProps {
  sortType: PointGroupSortType;
  groupPoints: TaggedPoint[];
}

export const areGroupOrderPropsEqual =
  (prev: GroupOrderProps, next: GroupOrderProps) => {
    if (prev.config.exaggeratedZ != next.config.exaggeratedZ) { return false; }
    if (prev.sortType != next.sortType) { return false; }
    if (prev.tryGroupSortType != next.tryGroupSortType) { return false; }
    const uuids = (pts: TaggedPoint[]) => JSON.stringify(pts.map(p => p.uuid));
    if (uuids(prev.groupPoints) != uuids(next.groupPoints)) { return false; }
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
    {positions.map((p, i) =>
      <Billboard
        follow={true}
        position={p}>
        <Cylinder
          args={[35, 35, 5]}
          rotation={[Math.PI / 2, 0, 0]}
          renderOrder={RenderOrder.pointerPlant}>
          <MeshPhongMaterial color={"black"} transparent={true} opacity={0.25} />
        </Cylinder>
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
