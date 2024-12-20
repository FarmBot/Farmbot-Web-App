import React from "react";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Content } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import {
  selectAllPointGroups, selectAllActivePoints,
} from "../resources/selectors";
import { GroupInventoryItem } from "../point_groups/group_inventory_item";
import { initSaveGetId } from "../api/crud";
import { SearchField } from "../ui/search_field";
import { Path } from "../internal_urls";
import { useNavigate } from "react-router";

export interface ZonesProps {
  dispatch: Function;
  zones: TaggedPointGroup[];
  allPoints: TaggedPoint[];
}

export const mapStateToProps = (props: Everything): ZonesProps => ({
  dispatch: props.dispatch,
  zones: selectAllPointGroups(props.resources.index),
  allPoints: selectAllActivePoints(props.resources.index),
});

export const RawZones = (props: ZonesProps) => {
  const navigate = useNavigate();
  const navigateById = (id: number) => { navigate(Path.zones(id)); };
  const [searchTerm, setSearchTerm] = React.useState("");
  return <DesignerPanel panelName={"zones-inventory"} panel={Panel.Zones}>
    <DesignerPanelTop
      panel={Panel.Zones}
      onClick={() => props.dispatch(initSaveGetId("PointGroup", {
        name: t("Untitled Zone"), point_ids: []
      }))
        .then((id: number) => navigateById(id)).catch(() => { })}
      title={t("Add zone")}>
      <SearchField nameKey={"zones"}
        searchTerm={searchTerm}
        placeholder={t("Search your zones...")}
        onChange={setSearchTerm} />
    </DesignerPanelTop>
    <DesignerPanelContent panelName={"zones-inventory"}>
      <EmptyStateWrapper
        notEmpty={props.zones.length > 0}
        graphic={EmptyStateGraphic.zones}
        title={t("No zones yet.")}
        text={Content.NO_ZONES}
        colorScheme={"zones"}>
        {props.zones
          .filter(p =>
            p.body.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(group => <GroupInventoryItem
            key={group.uuid}
            group={group}
            allPoints={props.allPoints}
            hovered={false}
            dispatch={props.dispatch}
            onClick={() => navigateById(group.body.id || 0)}
          />)}
      </EmptyStateWrapper>
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const Zones = connect(mapStateToProps)(RawZones);
// eslint-disable-next-line import/no-default-export
export default Zones;
