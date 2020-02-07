import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { DesignerNavTabs, Panel } from "../panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import {
  selectAllPointGroups, selectAllActivePoints
} from "../../resources/selectors";
import { GroupInventoryItem } from "../point_groups/group_inventory_item";
import { history } from "../../history";
import { initSaveGetId } from "../../api/crud";

export interface ZonesProps {
  dispatch: Function;
  zones: TaggedPointGroup[];
  allPoints: TaggedPoint[];
}

interface ZonesState {
  searchTerm: string;
}

export const mapStateToProps = (props: Everything): ZonesProps => ({
  dispatch: props.dispatch,
  zones: selectAllPointGroups(props.resources.index),
  allPoints: selectAllActivePoints(props.resources.index),
});

export class RawZones extends React.Component<ZonesProps, ZonesState> {
  state: ZonesState = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  navigate = (id: number) => history.push(`/app/designer/zones/${id}`);

  render() {
    return <DesignerPanel panelName={"zones-inventory"} panel={Panel.Zones}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Zones}
        onClick={() => this.props.dispatch(initSaveGetId("PointGroup", {
          name: t("Untitled Zone"), point_ids: []
        }))
          .then((id: number) => this.navigate(id)).catch(() => { })}
        title={t("Add zone")}>
        <input type="text" onChange={this.update}
          placeholder={t("Search your zones...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"zones-inventory"}>
        <EmptyStateWrapper
          notEmpty={this.props.zones.length > 0}
          graphic={EmptyStateGraphic.zones}
          title={t("No zones yet.")}
          text={Content.NO_ZONES}
          colorScheme={"zones"}>
          {this.props.zones
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

export const Zones = connect(mapStateToProps)(RawZones);
