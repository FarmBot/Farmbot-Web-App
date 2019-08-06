import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { Panel, DesignerNavTabs } from "../panel_header";
import { t } from "../../i18next_wrapper";
import { DesignerPanel, DesignerPanelTop, DesignerPanelContent } from "../plants/designer_panel";
import { findAll } from "../../resources/find_all";
import { TaggedPointGroup } from "farmbot";

export interface PlantInventoryProps {
  dispatch: Function;
  groups: TaggedPointGroup[];
}

interface State {
  searchTerm: string;
}

function mapStateToProps(props: Everything): PlantInventoryProps {
  const groups =
    findAll<TaggedPointGroup>(props.resources.index, "PointGroup");
  return { groups, dispatch: props.dispatch };
}

interface GroupInventoryItemProps {
  group: TaggedPointGroup;
  hovered: boolean;
  dispatch: Function;
}

function GroupInventoryItem(props: GroupInventoryItemProps) {
  return <div
    className={`plant-search-item ${props.hovered ? "hovered" : ""}`}>
    <span className="plant-search-item-name">
      {props.group.body.name}
    </span>
    <i className="plant-search-item-age">
      {t("{{count}} items", { count: props.group.body.point_ids.length })}
    </i>
  </div>;
}

@connect(mapStateToProps)
export class GroupListPanel extends React.Component<PlantInventoryProps, State> {

  state: State = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    console.log(currentTarget.value);
  };

  render() {
    return <DesignerPanel panelName={"groups"} panelColor={"gray"}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Groups}
        linkTo={"/app/designer/plants/select"}
        title={t("Add Group")}>
        <input type="text"
          onChange={this.update}
          placeholder={t("Search your groups...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"groups"}>
        {this
          .props
          .groups
          .filter(p => p.body.name.toLowerCase().includes(this.state.searchTerm.toLowerCase()))
          .map(group => <GroupInventoryItem
            key={group.uuid}
            group={group}
            hovered={false}
            dispatch={this.props.dispatch} />)}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
