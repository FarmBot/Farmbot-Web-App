import * as React from "react";
import { history } from "../../history";
import { t } from "i18next";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { TaggedPlantPointer } from "../../resources/tagged_resources";
import { selectAllPlantPointers } from "../../resources/selectors";
import { PlantInventoryItem } from "./plant_inventory_item";
import { destroy } from "../../api/crud";
import { error } from "farmbot-toastr";
import { BackArrow } from "../../ui/index";
import { catchErrors } from "../../util";

export function mapStateToProps(props: Everything) {
  const plants = selectAllPlantPointers(props.resources.index);
  return {
    selected: props
      .resources
      .consumers
      .farm_designer
      .selectedPlants,
    plants,
    dispatch: props.dispatch
  };
}

export interface SelectPlantsProps {
  plants: TaggedPlantPointer[];
  dispatch: Function;
  selected: string[];
}

@connect(mapStateToProps)
export class SelectPlants
  extends React.Component<SelectPlantsProps, {}> {
  componentDidCatch(x: Error, y: React.ErrorInfo) { catchErrors(x, y); }

  destroySelected = (plantUUIDs: string[]) => {
    if (plantUUIDs &&
      confirm(`Are you sure you want to delete ${plantUUIDs.length} plants?`)) {
      plantUUIDs.map(uuid => {
        this.props.dispatch(destroy(uuid, true))
          .catch(() => error(t("Could not delete plant."), t("Error")));
      });
      history.push("/app/designer/plants");
    }
  }

  render() {
    const { selected, plants, dispatch } = this.props;
    const selectedPlantData = selected ? selected.map(uuid => {
      return plants.filter(p => { return p.uuid == uuid; })[0];
    }) : undefined;

    return <div
      className="panel-container green-panel plant-selection-panel">
      <div className="panel-header green-panel">
        <p className="panel-title">
          <BackArrow />
          Select plants
        </p>

        <div className="panel-title">
          <button className="fb-button red"
            onClick={() => this.destroySelected(selected)}>
            {t("Delete selected")}
          </button>
          <button className="fb-button gray"
            onClick={() => this.props.dispatch({
              type: "SELECT_PLANT",
              payload: plants.map(p => p.uuid)
            })}>
            {t("Select all")}
          </button>
          <button className="fb-button gray"
            onClick={() => this.props.dispatch({
              type: "SELECT_PLANT",
              payload: undefined
            })}>
            {t("Select none")}
          </button>
        </div>

        <div className="panel-header-description">
          {"Drag a box around the plants you would like to select. " +
            "Press the back arrow to exit."}
        </div>

      </div>

      <div className="panel-content">
        <div className="thin-search-wrapper">
          {selectedPlantData && selectedPlantData[0] &&
            selectedPlantData.map(p =>
              <PlantInventoryItem
                key={p.uuid}
                tpp={p}
                dispatch={dispatch} />)}
        </div>
      </div>
    </div>;
  }
}
