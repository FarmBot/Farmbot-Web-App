import React from "react";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { Panel, DesignerNavTabs } from "../farm_designer/panel_header";
import { t } from "../i18next_wrapper";
import {
  DesignerPanel, DesignerPanelTop, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import { push } from "../history";
import { GroupInventoryItem } from "./group_inventory_item";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Content } from "../constants";
import {
  selectAllActivePoints, selectAllPointGroups,
} from "../resources/selectors";
import { createGroup } from "./actions";
import { SearchField } from "../ui/search_field";
import { Path } from "../internal_urls";

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
    groups: selectAllPointGroups(props.resources.index),
    dispatch: props.dispatch,
    allPoints: selectAllActivePoints(props.resources.index),
  };
}

export class RawGroupListPanel
  extends React.Component<GroupListPanelProps, State> {
  state: State = { searchTerm: "" };

  navigate = (id: number | undefined) => () => push(Path.groups(id));

  render() {
    return <DesignerPanel panelName={"groups"} panel={Panel.Groups}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Groups}
        onClick={() => this.props.dispatch(createGroup({ pointUuids: [] }))}
        title={t("Add group")}>
        <SearchField searchTerm={this.state.searchTerm}
          placeholder={t("Search your groups...")}
          onChange={searchTerm => this.setState({ searchTerm })} />
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
              onClick={this.navigate(group.body.id)}
            />)}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const GroupListPanel = connect(mapStateToProps)(RawGroupListPanel);
