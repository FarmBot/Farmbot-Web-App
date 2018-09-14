import * as React from "react";
import { history } from "../../history";
import { t } from "i18next";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { PlantInventoryItem } from "./plant_inventory_item";
import { destroy } from "../../api/crud";
import { BackArrow } from "../../ui/index";
import { unselectPlant } from "../actions";
import { Actions } from "../../constants";
import { TaggedPlant } from "../map/interfaces";
import { getPlants } from "../state_to_props";

export function mapStateToProps(props: Everything) {
  return {
    selected: props
      .resources
      .consumers
      .farm_designer
      .selectedPlants,
    plants: getPlants(props.resources),
    dispatch: props.dispatch,
    currentIcon: props.resources.consumers.farm_designer.hoveredPlant.icon
  };
}

export interface SelectPlantsProps {
  plants: TaggedPlant[];
  dispatch: Function;
  selected: string[];
  currentIcon: string;
}

interface SelectPlantsState {
  stashedUuid: string | undefined;
  stashedIcon: string;
}
const YOU_SURE = "Are you sure you want to delete {{length}} plants?";

@connect(mapStateToProps)
export class SelectPlants
  extends React.Component<SelectPlantsProps, SelectPlantsState> {

  componentDidMount() {
    const { dispatch, selected, currentIcon } = this.props;
    this.setState({
      stashedUuid: selected ? selected[0] : undefined,
      stashedIcon: currentIcon
    });
    unselectPlant(dispatch)();
  }

  componentWillUnmount() {
    this.unstashSelectedPlant();
  }

  unstashSelectedPlant = () => {
    const { stashedUuid, stashedIcon } = this.state;
    this.props.dispatch({ type: Actions.SELECT_PLANT, payload: [stashedUuid] });
    this.props.dispatch({
      type: Actions.TOGGLE_HOVERED_PLANT, payload: {
        plantUUID: stashedUuid, icon: stashedIcon
      }
    });
  }

  destroySelected = (plantUUIDs: string[]) => {
    if (plantUUIDs &&
      confirm(t(YOU_SURE, { length: plantUUIDs.length }))) {
      plantUUIDs.map(uuid => {
        this
          .props
          .dispatch(destroy(uuid, true))
          .then(() => { }, () => { });
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
          <BackArrow onClick={this.unstashSelectedPlant} />
          {t("Select plants")}
        </p>

        <div className="panel-title">
          <button className="fb-button red"
            onClick={() => this.destroySelected(selected)}>
            {t("Delete selected")}
          </button>
          <button className="fb-button gray"
            onClick={() => this.props.dispatch({
              type: Actions.SELECT_PLANT,
              payload: plants.map(p => p.uuid)
            })}>
            {t("Select all")}
          </button>
          <button className="fb-button gray"
            onClick={() => this.props.dispatch({
              type: Actions.SELECT_PLANT,
              payload: undefined
            })}>
            {t("Select none")}
          </button>
        </div>

        <div className="panel-header-description">
          {t("Drag a box around the plants you would like to select. " +
            "Press the back arrow to exit.")}
        </div>

      </div>

      <div className="panel-content">
        <div className="thin-search-wrapper">
          {selectedPlantData && selectedPlantData[0] &&
            selectedPlantData.map(p =>
              <PlantInventoryItem
                key={p.uuid}
                tpp={p}
                hovered={false}
                dispatch={dispatch} />)}
        </div>
      </div>
    </div>;
  }
}
