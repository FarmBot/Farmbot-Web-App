import React from "react";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import { t } from "../i18next_wrapper";
import {
  DesignerPanel, DesignerPanelTop, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import { useNavigate } from "react-router";
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

export function mapStateToProps(props: Everything): GroupListPanelProps {
  return {
    groups: selectAllPointGroups(props.resources.index),
    dispatch: props.dispatch,
    allPoints: selectAllActivePoints(props.resources.index),
  };
}

export const RawGroupListPanel = (props: GroupListPanelProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const navigate = useNavigate();
  const navigateById = (id: number | undefined) => () => {
    navigate(Path.groups(id));
  };

  return <DesignerPanel panelName={"groups"} panel={Panel.Groups}>
    <DesignerPanelTop
      panel={Panel.Groups}
      onClick={() => props.dispatch(createGroup({ pointUuids: [], navigate }))}
      title={t("Add group")}>
      <SearchField nameKey={"groups"}
        searchTerm={searchTerm}
        placeholder={t("Search your groups...")}
        onChange={setSearchTerm} />
    </DesignerPanelTop>
    <DesignerPanelContent panelName={"groups"}>
      <EmptyStateWrapper
        notEmpty={props.groups.length > 0}
        title={t("No groups yet.")}
        text={t(Content.NO_GROUPS)}
        colorScheme="groups"
        graphic={EmptyStateGraphic.groups}>
        {props.groups
          .filter(p => p.body.name.toLowerCase()
            .includes(searchTerm.toLowerCase()))
          .map(group => <GroupInventoryItem
            key={group.uuid}
            group={group}
            allPoints={props.allPoints}
            hovered={false}
            dispatch={props.dispatch}
            onClick={navigateById(group.body.id)}
          />)}
      </EmptyStateWrapper>
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const GroupListPanel = connect(mapStateToProps)(RawGroupListPanel);
// eslint-disable-next-line import/no-default-export
export default GroupListPanel;
