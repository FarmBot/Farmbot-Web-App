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
import { SearchField } from "../../ui/search_field";
import { SortOptions, PointSortMenu, orderedPoints } from "../sort_options";

export interface WeedsProps {
  weeds: TaggedWeedPointer[];
  dispatch: Function;
  hoveredPoint: string | undefined;
}

interface WeedsState extends SortOptions {
  searchTerm: string;
}

export const mapStateToProps = (props: Everything): WeedsProps => ({
  weeds: selectAllWeedPointers(props.resources.index),
  dispatch: props.dispatch,
  hoveredPoint: props.resources.consumers.farm_designer.hoveredPoint,
});

export class RawWeeds extends React.Component<WeedsProps, WeedsState> {
  state: WeedsState = { searchTerm: "", sortBy: "radius", reverse: true };

  get weeds() {
    return orderedPoints(this.props.weeds, this.state).filter(p =>
      p.body.name.toLowerCase().includes(this.state.searchTerm.toLowerCase()));
  }

  ActiveWeeds = () => {
    const active = this.weeds.filter(p => p.body.plant_stage !== "removed");
    return <div className={"active-weeds"}>
      <div className={"active-weeds-header"}>
        <label>{t("Active")}</label>
      </div>
      {active.length == 0 && <p>{t("No active weeds.")}</p>}
      {active.map(p => <WeedInventoryItem
        key={p.uuid}
        tpp={p}
        hovered={this.props.hoveredPoint === p.uuid}
        dispatch={this.props.dispatch} />)}
    </div>;
  };

  RemovedWeeds = () => {
    const removed = this.weeds.filter(p => p.body.plant_stage === "removed");
    return <div className={"removed-weeds"}>
      <div className={"removed-weeds-header"}>
        <label>{t("Removed")}</label>
      </div>
      {removed.length == 0 && <p>{t("No removed weeds.")}</p>}
      {removed.map(p => <WeedInventoryItem
        key={p.uuid}
        tpp={p}
        hovered={this.props.hoveredPoint === p.uuid}
        dispatch={this.props.dispatch} />)}
    </div>;
  };

  render() {
    return <DesignerPanel panelName={"weeds-inventory"} panel={Panel.Weeds}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Weeds}
        linkTo={"/app/designer/weeds/add"}
        title={t("Add weed")}>
        <SearchField searchTerm={this.state.searchTerm}
          placeholder={t("Search your weeds...")}
          customLeftIcon={<PointSortMenu
            sortOptions={this.state} onChange={u => this.setState(u)} />}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"weeds-inventory"}>
        <EmptyStateWrapper
          notEmpty={this.props.weeds.length > 0}
          graphic={EmptyStateGraphic.weeds}
          title={t("No weeds yet.")}
          text={Content.NO_WEEDS}
          colorScheme={"weeds"}>
          <this.ActiveWeeds />
          <this.RemovedWeeds />
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Weeds = connect(mapStateToProps)(RawWeeds);
