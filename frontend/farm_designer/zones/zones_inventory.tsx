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
} from "../plants/designer_panel";
import { t } from "../../i18next_wrapper";

export interface ZonesProps {
  dispatch: Function;
}

interface ZonesState {
  searchTerm: string;
}

export const mapStateToProps = (props: Everything): ZonesProps => ({
  dispatch: props.dispatch,
});

export class RawZones extends React.Component<ZonesProps, ZonesState> {
  state: ZonesState = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  render() {
    return <DesignerPanel panelName={"zones-inventory"} panel={Panel.Zones}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Zones}
        linkTo={"/app/designer/zones/add"}
        title={t("Add zone")}>
        <input type="text" onChange={this.update}
          placeholder={t("Search your zones...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"zones-inventory"}>
        <EmptyStateWrapper
          notEmpty={[].length > 0}
          graphic={EmptyStateGraphic.zones}
          title={t("No zones yet.")}
          text={Content.NO_ZONES}
          colorScheme={"zones"}>
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Zones = connect(mapStateToProps)(RawZones);
