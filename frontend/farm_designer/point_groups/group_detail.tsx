import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import {
  selectAllActivePoints, selectAllPlantPointers, selectAllPointGroups
} from "../../resources/selectors";
import { push, getPathArray } from "../../history";
import { GroupDetailActive } from "./group_detail_active";
import { ShouldDisplay } from "../../devices/interfaces";
import { getShouldDisplayFn } from "../../farmware/state_to_props";
import { uniq } from "lodash";
import { UUID } from "../../resources/interfaces";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "../designer_panel";
import { Panel } from "../panel_header";
import { t } from "../../i18next_wrapper";

interface GroupDetailProps {
  dispatch: Function;
  group: TaggedPointGroup | undefined;
  allPoints: TaggedPoint[];
  shouldDisplay: ShouldDisplay;
  slugs: string[];
  hovered: UUID | undefined;
}

/** Find a group from a URL-provided ID. */
export const findGroupFromUrl = (groups: TaggedPointGroup[]) => {
  const urlIncludes = (string: string) => getPathArray().includes(string);
  if (!urlIncludes("groups") && !urlIncludes("zones")) { return; }
  const groupId = parseInt(getPathArray().pop() || "?", 10);
  return groups.filter(group => group.body.id === groupId)[0];
};

function mapStateToProps(props: Everything): GroupDetailProps {
  return {
    allPoints: selectAllActivePoints(props.resources.index),
    group: findGroupFromUrl(selectAllPointGroups(props.resources.index)),
    dispatch: props.dispatch,
    shouldDisplay: getShouldDisplayFn(props.resources.index, props.bot),
    slugs: uniq(selectAllPlantPointers(props.resources.index)
      .map(p => p.body.openfarm_slug)),
    hovered: props.resources.consumers.farm_designer.hoveredPlantListItem,
  };
}

export class RawGroupDetail extends React.Component<GroupDetailProps, {}> {
  render() {
    const { group } = this.props;
    !group && push("/app/designer/groups");
    return <DesignerPanel panelName={"group-detail"} panel={Panel.Groups}>
      <DesignerPanelHeader
        panelName={Panel.Groups}
        panel={Panel.Groups}
        title={t("Edit group")}
        backTo={"/app/designer/groups"} />
      <DesignerPanelContent panelName={"groups"}>
        {group
          ? <GroupDetailActive {...this.props} group={group} />
          : <div className={"redirect"}>{t("Redirecting")}...</div>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
export const GroupDetail = connect(mapStateToProps)(RawGroupDetail);
