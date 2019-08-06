import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { Panel, DesignerNavTabs } from "../panel_header";
import { t } from "../../i18next_wrapper";
import { DesignerPanel, DesignerPanelTop, DesignerPanelContent } from "../plants/designer_panel";
import { findAll } from "../../resources/find_all";
import { TaggedPointGroup } from "farmbot";
import { history } from "../../history";
import { GroupInventoryItem } from "./group_inventory_item";

interface PlantInventoryProps {
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
            dispatch={this.props.dispatch}
            onClick={() => history.push(`/app/designer/groups/${group.body.id || 0}`)}
          />)}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
