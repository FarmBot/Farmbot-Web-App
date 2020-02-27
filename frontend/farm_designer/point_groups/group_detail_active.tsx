import * as React from "react";
import { Panel } from "../panel_header";
import { t } from "../../i18next_wrapper";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../designer_panel";
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
  GroupCriteria, GroupPointCountBreakdown, pointsSelectedByGroup
} from "./criteria";
import { Content } from "../../constants";
import { UUID } from "../../resources/interfaces";

export interface GroupDetailActiveProps {
  dispatch: Function;
  group: TaggedPointGroup;
  allPoints: TaggedPoint[];
  shouldDisplay: ShouldDisplay;
  slugs: string[];
  hovered: UUID | undefined;
}

type State = { timerId?: ReturnType<typeof setInterval> };

export class GroupDetailActive
  extends React.Component<GroupDetailActiveProps, State> {
  state: State = {};

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

  render() {
    const { group, dispatch } = this.props;
    return <DesignerPanel panelName={"group-detail"} panel={Panel.Groups}>
      <DesignerPanelHeader
        onBack={this.saveGroup}
        panelName={Panel.Groups}
        panel={Panel.Groups}
        title={t("Edit group")}
        backTo={"/app/designer/groups"} />
      <DesignerPanelContent
        panelName={"groups"}>
        <ErrorBoundary>
          <label>{t("GROUP NAME")}</label>
          <i style={{ float: "right" }}>{this.saved ? "" : "  saving..."}</i>
          <input
            defaultValue={group.body.name}
            onChange={this.update}
            onBlur={this.saveGroup} />
          <div>
            <label>
              {t("SORT BY")}
            </label>
            <Paths
              key={JSON.stringify(this.pointsSelectedByGroup
                .map(p => p.body.id))}
              pathPoints={this.pointsSelectedByGroup}
              dispatch={dispatch}
              group={group} />
            <p>
              {group.body.sort_type == "random" && t(Content.SORT_DESCRIPTION)}
            </p>
          </div>
          <label>
            {t("GROUP MEMBERS ({{count}})", { count: this.icons.length })}
          </label>
          {this.props.shouldDisplay(Feature.criteria_groups) &&
            <GroupPointCountBreakdown
              manualCount={group.body.point_ids.length}
              totalCount={this.pointsSelectedByGroup.length} />}
          <p>{t("Click plants in map to add or remove.")}</p>
          {this.props.shouldDisplay(Feature.criteria_groups) &&
            this.pointsSelectedByGroup.length != group.body.point_ids.length &&
            <p>{t(Content.CRITERIA_SELECTION_COUNT)}</p>}
          <div className="groups-list-wrapper">
            {this.icons}
          </div>
          {this.props.shouldDisplay(Feature.criteria_groups) &&
            <GroupCriteria dispatch={dispatch}
              group={group} slugs={this.props.slugs} />}
          <DeleteButton
            className="group-delete-btn"
            dispatch={dispatch}
            uuid={group.uuid}
            onDestroy={history.back}>
            {t("DELETE GROUP")}
          </DeleteButton>
        </ErrorBoundary>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
