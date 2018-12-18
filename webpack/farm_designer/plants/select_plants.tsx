import * as React from "react";
import { history } from "../../history";
import { t } from "i18next";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { PlantInventoryItem } from "./plant_inventory_item";
import { destroy } from "../../api/crud";
import { unselectPlant } from "../actions";
import { Actions, Content } from "../../constants";
import { TaggedPlant } from "../map/interfaces";
import { getPlants } from "../state_to_props";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "./designer_panel";

export function mapStateToProps(props: Everything) {
  const { selectedPlants } = props.resources.consumers.farm_designer;
  return {
    selected: selectedPlants,
    plants: getPlants(props.resources),
    dispatch: props.dispatch,
  };
}

export interface SelectPlantsProps {
  plants: TaggedPlant[];
  dispatch: Function;
  selected: string[];
}

const YOU_SURE = "Are you sure you want to delete {{length}} plants?";

@connect(mapStateToProps)
export class SelectPlants
  extends React.Component<SelectPlantsProps, {}> {

  componentDidMount() {
    const { dispatch, selected } = this.props;
    if (selected && selected.length == 1) {
      unselectPlant(dispatch)();
    } else {
      dispatch({
        type: Actions.TOGGLE_HOVERED_PLANT, payload: {
          plantUUID: undefined, icon: ""
        }
      });
      dispatch({ type: Actions.HOVER_PLANT_LIST_ITEM, payload: undefined });
    }
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

  ActionButtons = () =>
    <div className="panel-action-buttons">
      <button className="fb-button red"
        onClick={() => this.destroySelected(this.props.selected)}>
        {t("Delete selected")}
      </button>
      <button className="fb-button gray"
        onClick={() => this.props.dispatch({
          type: Actions.SELECT_PLANT,
          payload: this.props.plants.map(p => p.uuid)
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
    </div>;

  render() {
    const { selected, plants, dispatch } = this.props;
    const selectedPlantData = selected ? selected.map(uuid => {
      return plants.filter(p => { return p.uuid == uuid; })[0];
    }) : undefined;

    return <DesignerPanel panelName={"plant-selection"} panelColor={"green"}>
      <DesignerPanelHeader
        panelName={"plant-selection"}
        panelColor={"green"}
        title={t("Select plants")}
        backTo={"/app/designer/plants"}
        description={Content.BOX_SELECT_DESCRIPTION} />

      <this.ActionButtons />

      <DesignerPanelContent panelName={"plant-selection"}>
        {selectedPlantData && selectedPlantData[0] &&
          selectedPlantData.map(p =>
            <PlantInventoryItem
              key={p.uuid}
              tpp={p}
              hovered={false}
              dispatch={dispatch} />)}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
