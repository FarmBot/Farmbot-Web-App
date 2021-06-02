import React from "react";
import { connect } from "react-redux";
import { PlantInventoryItem } from "./plant_inventory_item";
import { Everything } from "../interfaces";
import { Panel, DesignerNavTabs } from "../farm_designer/panel_header";
import { getPlants } from "../farm_designer/state_to_props";
import { TaggedPlant } from "../farm_designer/map/interfaces";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { SearchField } from "../ui/search_field";
import { push } from "../history";
import { cropSearchUrl } from "./crop_catalog";

export interface PlantInventoryProps {
  plants: TaggedPlant[];
  dispatch: Function;
  hoveredPlantListItem: string | undefined;
}

interface State {
  searchTerm: string;
}

export function mapStateToProps(props: Everything): PlantInventoryProps {
  const { hoveredPlantListItem } = props.resources.consumers.farm_designer;
  return {
    plants: getPlants(props.resources),
    dispatch: props.dispatch,
    hoveredPlantListItem,
  };
}

export class RawPlants extends React.Component<PlantInventoryProps, State> {
  state: State = { searchTerm: "" };

  get noResult() {
    return <p>{`${t("Do you want to")} `}
      <a onClick={() => {
        this.props.dispatch({
          type: Actions.SEARCH_QUERY_CHANGE,
          payload: this.state.searchTerm,
        });
        push(cropSearchUrl());
      }}>
        {t("search all crops?")}
      </a>
    </p>;
  }

  render() {
    const filteredPlants = this.props.plants
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    const noSearchResults = this.state.searchTerm && filteredPlants.length == 0;
    return <DesignerPanel panelName={"plant-inventory"} panel={Panel.Plants}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Plants}
        linkTo={cropSearchUrl()}
        title={t("Add plant")}>
        <SearchField searchTerm={this.state.searchTerm}
          placeholder={t("Search your plants...")}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"plant"}>
        <EmptyStateWrapper
          notEmpty={this.props.plants.length > 0 && !noSearchResults}
          graphic={noSearchResults
            ? EmptyStateGraphic.no_crop_results
            : EmptyStateGraphic.plants}
          title={noSearchResults
            ? t("No results in your garden")
            : t("Get growing!")}
          text={noSearchResults ? undefined : Content.NO_PLANTS}
          textElement={noSearchResults ? this.noResult : undefined}
          colorScheme={"plants"}>
          {filteredPlants.map(p =>
            <PlantInventoryItem
              key={p.uuid}
              plant={p}
              hovered={this.props.hoveredPlantListItem === p.uuid}
              dispatch={this.props.dispatch} />)}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const Plants = connect(mapStateToProps)(RawPlants);
