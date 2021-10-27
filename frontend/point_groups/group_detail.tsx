import React from "react";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { TaggedPointGroup, TaggedPoint, PointType, TaggedTool } from "farmbot";
import {
  selectAllActivePoints, selectAllPlantPointers, selectAllPointGroups,
  selectAllTools,
} from "../resources/selectors";
import { getPathArray } from "../history";
import { GroupDetailActive } from "./group_detail_active";
import { uniq } from "lodash";
import { UUID } from "../resources/interfaces";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { t } from "../i18next_wrapper";
import { BotSize } from "../farm_designer/map/interfaces";
import { botSize } from "../farm_designer/state_to_props";
import { ToolTransformProps } from "../tools/interfaces";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { isBotOriginQuadrant } from "../farm_designer/interfaces";
import { validPointTypes } from "../plants/select_plants";

export interface GroupDetailProps {
  dispatch: Function;
  group: TaggedPointGroup | undefined;
  allPoints: TaggedPoint[];
  slugs: string[];
  hovered: UUID | undefined;
  editGroupAreaInMap: boolean;
  botSize: BotSize;
  selectionPointType: PointType[] | undefined;
  tools: TaggedTool[];
  toolTransformProps: ToolTransformProps;
}

/** Find a group from a URL-provided ID. */
export const findGroupFromUrl = (groups: TaggedPointGroup[]) => {
  const urlIncludes = (string: string) => getPathArray().includes(string);
  if (!urlIncludes("groups") && !urlIncludes("zones")) { return; }
  const groupId = parseInt(getPathArray().pop() || "?", 10);
  return groups.filter(group => group.body.id === groupId)[0];
};

export function mapStateToProps(props: Everything): GroupDetailProps {
  const { hoveredPlantListItem, editGroupAreaInMap, selectionPointType } =
    props.resources.consumers.farm_designer;
  const getWebAppConfig = getWebAppConfigValue(() => props);
  const xySwap = !!getWebAppConfig(BooleanSetting.xy_swap);
  const rawQuadrant = getWebAppConfig(NumericSetting.bot_origin_quadrant);
  const quadrant = isBotOriginQuadrant(rawQuadrant) ? rawQuadrant : 2;
  return {
    allPoints: selectAllActivePoints(props.resources.index),
    group: findGroupFromUrl(selectAllPointGroups(props.resources.index)),
    dispatch: props.dispatch,
    slugs: uniq(selectAllPlantPointers(props.resources.index)
      .map(p => p.body.openfarm_slug)),
    hovered: hoveredPlantListItem,
    editGroupAreaInMap,
    botSize: botSize(props),
    selectionPointType,
    tools: selectAllTools(props.resources.index),
    toolTransformProps: { quadrant, xySwap },
  };
}

const panelInfo = (
  group: TaggedPointGroup | undefined,
): { title: string, backTo: string | undefined } => {
  const pointTypes =
    validPointTypes(group?.body.criteria.string_eq.pointer_type) || [];
  switch (pointTypes[0]) {
    case "GenericPointer":
      return { title: t("Edit point group"), backTo: "/app/designer/points" };
    case "Plant":
      return { title: t("Edit plant group"), backTo: "/app/designer/plants" };
    case "Weed":
      return { title: t("Edit weed group"), backTo: "/app/designer/weeds" };
    case "ToolSlot":
      return { title: t("Edit slot group"), backTo: "/app/designer/tools" };
    default:
      return { title: t("Edit group"), backTo: undefined };
  }
};

export class RawGroupDetail extends React.Component<GroupDetailProps, {}> {
  render() {
    const { group } = this.props;
    const groupsPath = "/app/designer/groups";
    !group && getPathArray().join("/").startsWith(groupsPath) && history.back();
    return <DesignerPanel panelName={"group-detail"} panel={Panel.Groups}>
      <DesignerPanelHeader
        panelName={Panel.Groups}
        panel={Panel.Groups}
        backTo={panelInfo(group).backTo}
        title={panelInfo(group).title} />
      <DesignerPanelContent panelName={"groups"}>
        {group
          ? <GroupDetailActive {...this.props} group={group} />
          : <div className={"redirect"}>{t("Redirecting")}...</div>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
export const GroupDetail = connect(mapStateToProps)(RawGroupDetail);
