import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { t } from "i18next";
import { PlantInventoryItem } from "./plant_inventory_item";
import { Everything } from "../../interfaces";
import { DesignerNavTabs } from "../panel_header";
import { TaggedPlant } from "../map/interfaces";
import { getPlants } from "../state_to_props";

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
    return <div className="panel-container green-panel plant-inventory-panel">
      <DesignerNavTabs />
      <div className="panel-content row">
        <div className="thin-search-wrapper">
          <div className="text-input-wrapper">
            <i className="fa fa-search"></i>
            <input type="text" onChange={this.update}
              placeholder={t("Search your plants...")} />
          </div>
          <div className="plant-panel-content">
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
          </div>
        </div>
      </div>
      <Link to="/app/designer/plants/crop_search">
        <div className="plus-button fb-button green">
          <i className="fa fa-2x fa-plus" />
        </div>
      </Link>
    </div>;
  }
}
