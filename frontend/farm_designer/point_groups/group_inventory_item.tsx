import React from "react";
import { TaggedPointGroup } from "farmbot";
import { t } from "../../i18next_wrapper";

interface GroupInventoryItemProps {
  group: TaggedPointGroup;
  hovered: boolean;
  dispatch: Function;
  onClick(): void;
}

export function GroupInventoryItem(props: GroupInventoryItemProps) {
  return <div
    onClick={props.onClick}
    className={`plant-search-item ${props.hovered ? "hovered" : ""}`}>
    <span className="plant-search-item-name">
      {props.group.body.name}
    </span>
    <i className="group-item-count">
      {t("{{count}} items", { count: props.group.body.point_ids.length })}
    </i>
  </div>;
}
