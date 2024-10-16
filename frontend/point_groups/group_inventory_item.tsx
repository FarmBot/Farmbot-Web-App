import React from "react";
import { TaggedPoint } from "farmbot";
import { t } from "../i18next_wrapper";
import { ErrorBoundary } from "../error_boundary";
import { DevSettings } from "../settings/dev/dev_support";
import { destroy } from "../api/crud";
import { TaggedPointGroup } from "../resources/interfaces";

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
    className={["group-search-item row grid-exp-1",
      props.hovered ? "hovered" : "",
      delMode ? "quick-del" : ""].join(" ")}>
    <div>
      {group.body.name}
    </div>
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
  const count = props.group.body.member_count || 0;
  return <i className="group-item-count">
    {t("{{count}} items", { count })}
  </i>;
};
