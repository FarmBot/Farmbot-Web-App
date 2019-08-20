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

interface GroupListPanelProps {
  dispatch: Function;
  groups: TaggedPointGroup[];
}

interface State {
  searchTerm: string;
}

function mapStateToProps(props: Everything): GroupListPanelProps {
  const groups =
    findAll<TaggedPointGroup>(props.resources.index, "PointGroup");
  return { groups, dispatch: props.dispatch };
}
/** I wanted this to be a member method of <GroupListPanel/> but testing was
 * too wonky due to @connect(). If anyone knows a way to test this, feel free
 * to do a non-curried solution. -RC*/
export const newUpdater =
  (cb: Function, key: keyof GroupListPanel["state"]) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      cb({ [key]: e.currentTarget.value });
    };

@connect(mapStateToProps)
export class GroupListPanel extends React.Component<GroupListPanelProps, State> {

  state: State = { searchTerm: "" };

  navigate = (id: number) => history.push(`/app/designer/groups/${id}`);

  render() {
    return <DesignerPanel panelName={"groups"} panelColor={"gray"}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Groups}
        linkTo={"/app/designer/plants/select"}
        title={t("Add Group")}>
        <input type="text"
          onChange={newUpdater(this.setState, "searchTerm")}
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
            onClick={() => this.navigate(group.body.id || 0)}
          />)}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
