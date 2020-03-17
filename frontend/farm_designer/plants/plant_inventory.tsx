import * as React from "react";
import { connect } from "react-redux";
import { PlantInventoryItem } from "./plant_inventory_item";
import { Everything } from "../../interfaces";
import { Panel, DesignerNavTabs } from "../panel_header";
import { getPlants } from "../state_to_props";
import { TaggedPlant } from "../map/interfaces";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../designer_panel";
import { t } from "../../i18next_wrapper";

export interface PlantInventoryProps {
  plants: TaggedPlant[];
  dispatch: Function;
  hoveredPlantListItem?: string | undefined;
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

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) =>
    this.setState({ searchTerm: currentTarget.value })

  render() {
    return <DesignerPanel panelName={"plant-inventory"} panel={Panel.Plants}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Plants}
        linkTo={"/app/designer/plants/crop_search"}
        title={t("Add plant")}>
        <input type="text" onChange={this.update} name="searchTerm"
          placeholder={t("Search your plants...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"plant"}>
        <EmptyStateWrapper
          notEmpty={this.props.plants.length > 0}
          graphic={EmptyStateGraphic.plants}
          title={t("Get growing!")}
          text={Content.NO_PLANTS}
          colorScheme={"plants"}>
          {this.props.plants
            .filter(p => p.body.name.toLowerCase()
              .includes(this.state.searchTerm.toLowerCase()))
            .map(p => <PlantInventoryItem
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
