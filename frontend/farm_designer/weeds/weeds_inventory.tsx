import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { DesignerNavTabs, Panel } from "../panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { TaggedWeedPointer } from "farmbot";
import { selectAllWeedPointers } from "../../resources/selectors";
import { WeedInventoryItem } from "./weed_inventory_item";

export interface WeedsProps {
  weeds: TaggedWeedPointer[];
  dispatch: Function;
  hoveredPoint: string | undefined;
}

interface WeedsState {
  searchTerm: string;
}

export const mapStateToProps = (props: Everything): WeedsProps => ({
  weeds: selectAllWeedPointers(props.resources.index),
  dispatch: props.dispatch,
  hoveredPoint: props.resources.consumers.farm_designer.hoveredPoint,
});

export class RawWeeds extends React.Component<WeedsProps, WeedsState> {
  state: WeedsState = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  render() {
    return <DesignerPanel panelName={"weeds-inventory"} panel={Panel.Weeds}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Weeds}
        linkTo={"/app/designer/weeds/add"}
        title={t("Add weed")}>
        <input type="text" onChange={this.update} name="searchTerm"
          placeholder={t("Search your weeds...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"weeds-inventory"}>
        <EmptyStateWrapper
          notEmpty={this.props.weeds.length > 0}
          graphic={EmptyStateGraphic.weeds}
          title={t("No weeds yet.")}
          text={Content.NO_WEEDS}
          colorScheme={"weeds"}>
          {this.props.weeds
            .filter(p => p.body.name.toLowerCase()
              .includes(this.state.searchTerm.toLowerCase()))
            .map(p => <WeedInventoryItem
              key={p.uuid}
              tpp={p}
              hovered={this.props.hoveredPoint === p.uuid}
              dispatch={this.props.dispatch} />)}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Weeds = connect(mapStateToProps)(RawWeeds);
