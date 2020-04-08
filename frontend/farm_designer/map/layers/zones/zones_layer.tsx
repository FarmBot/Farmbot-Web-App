import * as React from "react";
import { TaggedPointGroup } from "farmbot";
import { MapTransformProps, BotSize } from "../../interfaces";
import { Zones0D, Zones1D, Zones2D, getZoneType, ZoneType } from "./zones";
import { UUID } from "../../../../resources/interfaces";
import { allowGroupAreaInteraction } from "../../util";

export interface ZonesLayerProps {
  visible: boolean;
  currentGroup: UUID | undefined;
  groups: TaggedPointGroup[];
  botSize: BotSize;
  mapTransformProps: MapTransformProps;
  startDrag(e: React.MouseEvent<SVGElement>): void;
}

export function ZonesLayer(props: ZonesLayerProps) {
  const { groups, botSize, mapTransformProps, currentGroup } = props;
  const commonProps = { botSize, mapTransformProps, currentGroup };
  const visible = (group: TaggedPointGroup) =>
    props.visible || (group.uuid == currentGroup);
  return <g className="zones-layer" style={allowGroupAreaInteraction()
    ? { cursor: "pointer" }
    : { pointerEvents: "none" }} onMouseDown={props.startDrag}>
    {groups.map(group => visible(group) &&
      getZoneType(group) === ZoneType.area &&
      <Zones2D {...commonProps} key={group.uuid} group={group} />)}
    {groups.map(group => visible(group) &&
      getZoneType(group) === ZoneType.lines &&
      <Zones1D {...commonProps} key={group.uuid} group={group} />)}
    {groups.map(group => visible(group) &&
      getZoneType(group) === ZoneType.points &&
      <Zones0D {...commonProps} key={group.uuid} group={group} />)}
  </g>;
}
