import * as React from "react";
import { Panel } from "../panel_header";
import { t } from "../../i18next_wrapper";
import {
  DesignerPanel,
  DesignerPanelContent,
  DesignerPanelHeader
} from "../plants/designer_panel";
import { TaggedPointGroup } from "farmbot";
import { DeleteButton } from "../../controls/pin_form_fields";
import { save, edit } from "../../api/crud";
import { Dictionary } from "lodash";
import { OFIcon } from "../../open_farm/cached_crop";
import { TaggedPlant } from "../map/interfaces";
import { PointGroupSortSelector, sortGroupBy } from "./point_group_sort_selector";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { PointGroupItem } from "./point_group_item";

interface GroupDetailActiveProps {
  dispatch: Function;
  group: TaggedPointGroup;
  plants: TaggedPlant[];
}

type State = Dictionary<OFIcon | undefined>;

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

  render() {
    return <DesignerPanel panelName={"groups"} panelColor={"blue"}>
      <DesignerPanelHeader
        onBack={this.saveGroup}
        panelName={Panel.Groups}
        panelColor={"blue"}
        title={t("Edit Group")}
        backTo={"/app/designer/groups"}>
      </DesignerPanelHeader>
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
