import React from "react";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import { t } from "../../i18next_wrapper";
import { pointsSelectedByGroup } from "./criteria";

export interface GroupInventoryItemProps {
  group: TaggedPointGroup;
  allPoints: TaggedPoint[];
  hovered: boolean;
  dispatch: Function;
  onClick(): void;
}

export function GroupInventoryItem(props: GroupInventoryItemProps) {
  const count = pointsSelectedByGroup(props.group, props.allPoints).length;
  return <div
    onClick={props.onClick}
    className={`group-search-item ${props.hovered ? "hovered" : ""}`}>
    <span className="group-search-item-name">
      {props.group.body.name}
    </span>
    <i className="group-item-count">
      {t("{{count}} items", { count })}
    </i>
  </div>;
}
