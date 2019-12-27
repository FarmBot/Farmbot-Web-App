import * as React from "react";
import { Panel } from "../panel_header";
import { t } from "../../i18next_wrapper";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../designer_panel";
import { TaggedPointGroup } from "farmbot";
import { DeleteButton } from "../../ui/delete_button";
import { save, edit } from "../../api/crud";
import { TaggedPlant } from "../map/interfaces";
import { PointGroupSortSelector, sortGroupBy } from "./point_group_sort_selector";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { PointGroupItem } from "./point_group_item";
import { Paths } from "./paths";
import { DevSettings } from "../../account/dev/dev_support";

interface GroupDetailActiveProps {
  dispatch: Function;
  group: TaggedPointGroup;
  plants: TaggedPlant[];
}

type State = { timerId?: ReturnType<typeof setInterval> };

export class GroupDetailActive
  extends React.Component<GroupDetailActiveProps, State> {
  state: State = {};

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.dispatch(edit(this.props.group, { name: currentTarget.value }));
  };

  get icons() {
    const plants = sortGroupBy(this.props.group.body.sort_type,
      this.props.plants);

    return plants.map(point => {
      return <PointGroupItem
        key={point.uuid}
        hovered={false}
        group={this.props.group}
        plant={point}
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
    return <DesignerPanel panelName={"group-detail"} panel={Panel.Groups}>
      <DesignerPanelHeader
        onBack={this.saveGroup}
        panelName={Panel.Groups}
        panel={Panel.Groups}
        title={t("Edit Group")}
        backTo={"/app/designer/groups"} />
      <DesignerPanelContent
        panelName={"groups"}>
        <label>{t("GROUP NAME")}{this.saved ? "" : "*"}</label>
        <input
          defaultValue={this.props.group.body.name}
          onChange={this.update}
          onBlur={this.saveGroup} />
        <PointGroupSortSelector
          value={this.props.group.body.sort_type}
          onChange={this.changeSortType} />
        <label>
          {t("GROUP MEMBERS ({{count}})", { count: this.icons.length })}
        </label>
        <p>
          {t("Click plants in map to add or remove.")}
        </p>
        <div className="groups-list-wrapper">
          {this.icons}
        </div>
        {DevSettings.futureFeaturesEnabled() &&
          <Paths
            points={this.props.plants}
            dispatch={this.props.dispatch}
            group={this.props.group} />}
        <DeleteButton
          className="groups-delete-btn"
          dispatch={this.props.dispatch}
          uuid={this.props.group.uuid}
          onDestroy={history.back}>
          {t("DELETE GROUP")}
        </DeleteButton>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
