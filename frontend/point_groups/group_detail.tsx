import React from "react";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { TaggedPointGroup, TaggedPoint, PointType, TaggedTool } from "farmbot";
import {
  selectAllActivePoints, selectAllPlantPointers, selectAllPointGroups,
  selectAllTools,
} from "../resources/selectors";
import { GroupDetailActive, GroupSortSelection } from "./group_detail_active";
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
import { Path } from "../internal_urls";
import { destroy } from "../api/crud";
import { ResourceTitle } from "../sequences/panel/editor";
import { Popover } from "../ui";
import { pointsSelectedByGroup } from "./criteria/apply";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";

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
  tryGroupSortType: PointGroupSortType | undefined;
}

/** Find a group from a URL-provided ID. */
export const findGroupFromUrl = (groups: TaggedPointGroup[]) => {
  if (!Path.startsWith(Path.groups()) &&
    !Path.startsWith(Path.zones())) { return; }
  const groupId = parseInt(Path.getLastChunk());
  return groups.filter(group => group.body.id === groupId)[0];
};

export function mapStateToProps(props: Everything): GroupDetailProps {
  const {
    hoveredPlantListItem, editGroupAreaInMap, selectionPointType,
    tryGroupSortType,
  } =
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
    tryGroupSortType,
  };
}

const panelInfo = (
  group: TaggedPointGroup | undefined,
): { title: string, backTo: string | undefined } => {
  const pointTypes =
    validPointTypes(group?.body.criteria.string_eq.pointer_type) || [];
  switch (pointTypes[0]) {
    case "GenericPointer":
      return { title: t("Edit point group"), backTo: Path.points() };
    case "Plant":
      return { title: t("Edit plant group"), backTo: Path.plants() };
    case "Weed":
      return { title: t("Edit weed group"), backTo: Path.weeds() };
    case "ToolSlot":
      return { title: t("Edit slot group"), backTo: Path.tools() };
    default:
      return { title: t("Edit group"), backTo: undefined };
  }
};

export class RawGroupDetail extends React.Component<GroupDetailProps, {}> {
  render() {
    const { group } = this.props;
    const groupsPath = Path.groups();
    !group && Path.startsWith(groupsPath) && history.back();
    return <DesignerPanel panelName={"group-detail"} panel={Panel.Groups}>
      <DesignerPanelHeader
        panelName={Panel.Groups}
        panel={Panel.Groups}
        titleElement={<ResourceTitle
          key={group?.body.name}
          resource={group}
          save={true}
          fallback={t("No Group selected")}
          dispatch={this.props.dispatch} />}
        backTo={panelInfo(group).backTo}>
        <div className={"panel-header-icon-group"}>
          {group &&
            <Popover
              target={<i className={"fa fa-sort fb-icon-button invert"}
                title={t("Sort by")} />}
              content={
                <GroupSortSelection group={group} dispatch={this.props.dispatch}
                  pointsSelectedByGroup={pointsSelectedByGroup(
                    group, this.props.allPoints)} />} />}
          {group &&
            <i className={"fa fa-trash fb-icon-button invert"}
              title={t("Delete group")}
              onClick={() => this.props.dispatch(destroy(group.uuid))} />}
        </div>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={"groups"}>
        {group
          ? <GroupDetailActive {...this.props} group={group} />
          : <div className={"redirect"}>{t("Redirecting")}...</div>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
export const GroupDetail = connect(mapStateToProps)(RawGroupDetail);
// eslint-disable-next-line import/no-default-export
export default GroupDetail;
