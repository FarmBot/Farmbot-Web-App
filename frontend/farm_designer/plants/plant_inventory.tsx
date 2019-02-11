import * as React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import { PlantInventoryItem } from "./plant_inventory_item";
import { Everything } from "../../interfaces";
import { DesignerNavTabs } from "../panel_header";
import { Link } from "../../link";
import { getPlants } from "../state_to_props";
import { TaggedPlant } from "../map/interfaces";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop
} from "./designer_panel";

interface Props {
  plants: TaggedPlant[];
  dispatch: Function;
  hoveredPlantListItem?: string | undefined;
}

interface State {
  searchTerm: string;
}

function mapStateToProps(props: Everything): Props {
  const { hoveredPlantListItem } = props.resources.consumers.farm_designer;
  return {
    plants: getPlants(props.resources),
    dispatch: props.dispatch,
    hoveredPlantListItem,
  };
}

@connect(mapStateToProps)
export class Plants extends React.Component<Props, State> {

  state: State = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  render() {
    return <DesignerPanel panelName={"plant-inventory"} panelColor={"green"}>
      <DesignerNavTabs />
      <DesignerPanelTop>
        <input type="text" onChange={this.update}
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
            .map(p => {
              const hovered = this.props.hoveredPlantListItem === p.uuid;
              return <PlantInventoryItem
                key={p.uuid}
                tpp={p}
                hovered={hovered}
                dispatch={this.props.dispatch} />;
            })}
        </EmptyStateWrapper>
      </DesignerPanelContent>
      <Link to="/app/designer/plants/crop_search">
        <div className="plus-button fb-button green">
          <i className="fa fa-2x fa-plus" title={t("Add plant")} />
        </div>
      </Link>
    </DesignerPanel>;
  }
}
