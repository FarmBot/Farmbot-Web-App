import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { Panel, DesignerNavTabs } from "../panel_header";
import { t } from "../../i18next_wrapper";
import {
  DesignerPanel, DesignerPanelTop, DesignerPanelContent,
} from "../designer_panel";
import { findAll } from "../../resources/find_all";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import { history } from "../../history";
import { GroupInventoryItem } from "./group_inventory_item";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import { selectAllActivePoints } from "../../resources/selectors";
import { createGroup } from "./actions";

export interface GroupListPanelProps {
  dispatch: Function;
  groups: TaggedPointGroup[];
  allPoints: TaggedPoint[];
}

interface State {
  searchTerm: string;
}

export function mapStateToProps(props: Everything): GroupListPanelProps {
  return {
    groups: findAll<TaggedPointGroup>(props.resources.index, "PointGroup"),
    dispatch: props.dispatch,
    allPoints: selectAllActivePoints(props.resources.index)
  };
}

export class RawGroupListPanel
  extends React.Component<GroupListPanelProps, State> {
  state: State = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  navigate = (id: number) => history.push(`/app/designer/groups/${id}`);

  render() {
    return <DesignerPanel panelName={"groups"} panel={Panel.Groups}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Groups}
        onClick={() => this.props.dispatch(createGroup({ pointUuids: [] }))}
        title={t("Add group")}>
        <input type="text"
          name="searchTerm"
          onChange={this.update}
          placeholder={t("Search your groups...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"groups"}>
        <EmptyStateWrapper
          notEmpty={this.props.groups.length > 0}
          title={t("No groups yet.")}
          text={t(Content.NO_GROUPS)}
          colorScheme="groups"
          graphic={EmptyStateGraphic.groups}>
          {this.props.groups
            .filter(p => p.body.name.toLowerCase()
              .includes(this.state.searchTerm.toLowerCase()))
            .map(group => <GroupInventoryItem
              key={group.uuid}
              group={group}
              allPoints={this.props.allPoints}
              hovered={false}
              dispatch={this.props.dispatch}
              onClick={() => this.navigate(group.body.id || 0)}
            />)}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const GroupListPanel = connect(mapStateToProps)(RawGroupListPanel);
