import React from "react";
import { t } from "../i18next_wrapper";
import { TaggedPointGroup, TaggedPoint, PointType, TaggedTool } from "farmbot";
import { Paths } from "./paths";
import { ErrorBoundary } from "../error_boundary";
import {
  GroupCriteria, GroupPointCountBreakdown, pointsSelectedByGroup,
} from "./criteria";
import { ToolTips } from "../constants";
import { UUID } from "../resources/interfaces";
import { Help } from "../ui";
import { BotSize } from "../farm_designer/map/interfaces";
import { setSelectionPointType } from "../plants/select_plants";
import { ToolTransformProps } from "../tools/interfaces";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";

export interface GroupDetailActiveProps {
  dispatch: Function;
  group: TaggedPointGroup;
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

interface GroupDetailActiveState {
  iconDisplay: boolean;
}

export class GroupDetailActive
  extends React.Component<GroupDetailActiveProps, GroupDetailActiveState> {
  state: GroupDetailActiveState = {
    iconDisplay: true,
  };

  get pointsSelectedByGroup() {
    return pointsSelectedByGroup(this.props.group, this.props.allPoints);
  }

  componentWillUnmount = () =>
    this.props.dispatch(setSelectionPointType(undefined));

  toggleIconShow = () => this.setState({ iconDisplay: !this.state.iconDisplay });

  render() {
    const { group, dispatch } = this.props;
    return <ErrorBoundary>
      <GroupMemberDisplay group={group} dispatch={dispatch}
        pointsSelectedByGroup={this.pointsSelectedByGroup}
        hovered={this.props.hovered}
        iconDisplay={this.state.iconDisplay}
        toggleIconShow={this.toggleIconShow}
        tools={this.props.tools}
        tryGroupSortType={this.props.tryGroupSortType}
        toolTransformProps={this.props.toolTransformProps} />
      <GroupCriteria dispatch={dispatch}
        group={group} slugs={this.props.slugs} botSize={this.props.botSize}
        editGroupAreaInMap={this.props.editGroupAreaInMap}
        selectionPointType={this.props.selectionPointType} />
    </ErrorBoundary>;
  }
}

export interface GroupSortSelectionProps {
  group: TaggedPointGroup;
  dispatch: Function;
  pointsSelectedByGroup: TaggedPoint[];
}

/** Choose and view group point sort method. */
export const GroupSortSelection = (props: GroupSortSelectionProps) =>
  <div className={"group-sort-section"}>
    <label>
      {t("SORT BY")}
    </label>
    {props.group.body.sort_type == "random" &&
      <Help
        text={ToolTips.SORT_DESCRIPTION}
        customIcon={"fa-exclamation-triangle"} />}
    <Paths
      key={JSON.stringify(props.pointsSelectedByGroup
        .map(p => p.body.id))}
      pathPoints={props.pointsSelectedByGroup}
      dispatch={props.dispatch}
      group={props.group} />
  </div>;

interface GroupMemberDisplayProps {
  group: TaggedPointGroup;
  dispatch: Function;
  pointsSelectedByGroup: TaggedPoint[];
  iconDisplay: boolean;
  toggleIconShow(): void;
  hovered: UUID | undefined;
  tools: TaggedTool[];
  toolTransformProps: ToolTransformProps;
  tryGroupSortType: PointGroupSortType | undefined;
}

/** View group point counts and icon list. */
const GroupMemberDisplay = (props: GroupMemberDisplayProps) => {
  return <div className="group-member-display">
    <div className={"row grid-exp-1"}>
      <label>
        {t("GROUP MEMBERS ({{count}})", {
          count: props.pointsSelectedByGroup.length
        })}
      </label>
      <Help text={ToolTips.CRITERIA_SELECTION_COUNT} />
      <i onClick={props.toggleIconShow}
        className={`fa fa-caret-${props.iconDisplay ? "up" : "down"}`}
        title={props.iconDisplay
          ? t("hide icons")
          : t("show icons")} />
    </div>
    <GroupPointCountBreakdown
      group={props.group}
      dispatch={props.dispatch}
      iconDisplay={props.iconDisplay}
      hovered={props.hovered}
      tools={props.tools}
      toolTransformProps={props.toolTransformProps}
      tryGroupSortType={props.tryGroupSortType}
      pointsSelectedByGroup={props.pointsSelectedByGroup} />
  </div>;
};
