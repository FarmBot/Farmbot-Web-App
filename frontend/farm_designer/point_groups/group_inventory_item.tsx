import React from "react";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import { t } from "../../i18next_wrapper";
import { pointsSelectedByGroup } from "./criteria";
import { ErrorBoundary } from "../../error_boundary";
import { DevSettings } from "../../account/dev/dev_support";
import { destroy } from "../../api/crud";

export interface GroupInventoryItemProps {
  group: TaggedPointGroup;
  allPoints: TaggedPoint[];
  hovered: boolean;
  dispatch: Function;
  onClick(): void;
}

export function GroupInventoryItem(props: GroupInventoryItemProps) {
  const { group } = props;
  const delMode = DevSettings.quickDeleteEnabled();
  return <div
    onClick={delMode ? () => props.dispatch(destroy(group.uuid)) : props.onClick}
    className={["group-search-item",
      props.hovered ? "hovered" : "",
      delMode ? "quick-del" : ""].join(" ")}>
    <span className="group-search-item-name">
      {group.body.name}
    </span>
    <ErrorBoundary fallback={<i className="group-item-count">{t("? items")}</i>}>
      <GroupItemCount group={group} allPoints={props.allPoints} />
    </ErrorBoundary>
  </div>;
}

interface GroupItemCountProps {
  group: TaggedPointGroup;
  allPoints: TaggedPoint[];
}

const GroupItemCount = (props: GroupItemCountProps) => {
  const count = pointsSelectedByGroup(props.group, props.allPoints).length;
  return <i className="group-item-count">
    {t("{{count}} items", { count })}
  </i>;
};
