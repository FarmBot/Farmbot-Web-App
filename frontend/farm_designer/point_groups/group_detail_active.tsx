import * as React from "react";
import { t } from "../../i18next_wrapper";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import { DeleteButton } from "../../ui/delete_button";
import { save, edit } from "../../api/crud";
import { sortGroupBy } from "./point_group_sort";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { PointGroupItem } from "./point_group_item";
import { Paths } from "./paths";
import { Feature, ShouldDisplay } from "../../devices/interfaces";
import { ErrorBoundary } from "../../error_boundary";
import {
  GroupCriteria, GroupPointCountBreakdown, pointsSelectedByGroup,
} from "./criteria";
import { Content } from "../../constants";
import { UUID } from "../../resources/interfaces";
import { Help } from "../../ui";

export interface GroupDetailActiveProps {
  dispatch: Function;
  group: TaggedPointGroup;
  allPoints: TaggedPoint[];
  shouldDisplay: ShouldDisplay;
  slugs: string[];
  hovered: UUID | undefined;
  editGroupAreaInMap: boolean;
}

interface GroupDetailActiveState {
  timerId?: ReturnType<typeof setInterval>;
  iconDisplay: boolean;
}

export class GroupDetailActive
  extends React.Component<GroupDetailActiveProps, GroupDetailActiveState> {
  state: GroupDetailActiveState = { iconDisplay: true };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.dispatch(edit(this.props.group, { name: currentTarget.value }));
  };

  get pointsSelectedByGroup() {
    return pointsSelectedByGroup(this.props.group, this.props.allPoints);
  }

  get icons() {
    const sortedPoints =
      sortGroupBy(this.props.group.body.sort_type, this.pointsSelectedByGroup);
    return sortedPoints.map(point => {
      return <PointGroupItem
        key={point.uuid}
        hovered={point.uuid === this.props.hovered}
        group={this.props.group}
        point={point}
        dispatch={this.props.dispatch} />;
    });
  }

  get saved(): boolean {
    return !this.props.group.specialStatus;
  }

  saveGroup = () => {
    if (!this.saved) {
      this.props.dispatch(save(this.props.group.uuid));
    }
  }

  changeSortType = (sort_type: PointGroupSortType) => {
    const { dispatch, group } = this.props;
    dispatch(edit(group, { sort_type }));
  }

  componentDidMount() {
    // There are better ways to do this.
    this.setState({ timerId: setInterval(this.saveGroup, 900) });
  }

  componentWillUnmount() {
    const { timerId } = this.state;
    (typeof timerId == "number") && clearInterval(timerId);
  }

  toggleIconShow = () => this.setState({ iconDisplay: !this.state.iconDisplay });

  render() {
    const { group, dispatch } = this.props;
    return <ErrorBoundary>
      <label>{t("GROUP NAME")}</label>
      <i style={{ float: "right" }}>{this.saved ? "" : "  saving..."}</i>
      <input
        name="name"
        defaultValue={group.body.name}
        onChange={this.update}
        onBlur={this.saveGroup} />
      <GroupSortSelection group={group} dispatch={dispatch}
        pointsSelectedByGroup={this.pointsSelectedByGroup} />
      <GroupMemberDisplay group={group} dispatch={dispatch}
        pointsSelectedByGroup={this.pointsSelectedByGroup}
        icons={this.icons}
        iconDisplay={this.state.iconDisplay}
        toggleIconShow={this.toggleIconShow}
        shouldDisplay={this.props.shouldDisplay} />
      {this.props.shouldDisplay(Feature.criteria_groups) &&
        <GroupCriteria dispatch={dispatch}
          group={group} slugs={this.props.slugs}
          editGroupAreaInMap={this.props.editGroupAreaInMap} />}
      <DeleteButton
        className="group-delete-btn"
        dispatch={dispatch}
        uuid={group.uuid}
        onDestroy={history.back}>
        {t("DELETE GROUP")}
      </DeleteButton>
    </ErrorBoundary>;
  }
}

interface GroupSortSelectionProps {
  group: TaggedPointGroup;
  dispatch: Function;
  pointsSelectedByGroup: TaggedPoint[];
}

/** Choose and view group point sort method. */
const GroupSortSelection = (props: GroupSortSelectionProps) =>
  <div className={"group-sort-section"}>
    <label>
      {t("SORT BY")}
    </label>
    {props.group.body.sort_type == "random" &&
      <Help
        text={Content.SORT_DESCRIPTION}
        customIcon={"exclamation-triangle"} />}
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
  shouldDisplay: ShouldDisplay;
  icons: JSX.Element[];
  iconDisplay: boolean;
  toggleIconShow(): void;
}

/** View group point counts and icon list. */
const GroupMemberDisplay = (props: GroupMemberDisplayProps) =>
  <div className="group-member-display">
    <label>
      {t("GROUP MEMBERS ({{count}})", { count: props.icons.length })}
    </label>
    <Help text={`${t("Click plants in map to add or remove.")} ${(
      props.shouldDisplay(Feature.criteria_groups) &&
      props.pointsSelectedByGroup.length != props.group.body.point_ids.length)
      ? t(Content.CRITERIA_SELECTION_COUNT) : ""}`} />
    <i onClick={props.toggleIconShow}
      className={`fa fa-caret-${props.iconDisplay ? "up" : "down"}`}
      title={props.iconDisplay
        ? t("hide icons")
        : t("show icons")} />
    {props.shouldDisplay(Feature.criteria_groups) &&
      <GroupPointCountBreakdown
        manualCount={props.group.body.point_ids.length}
        totalCount={props.pointsSelectedByGroup.length} />}
    {props.iconDisplay &&
      <div className="groups-list-wrapper">
        {props.icons}
      </div>}
  </div>;
