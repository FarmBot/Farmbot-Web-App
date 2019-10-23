import * as React from "react";
import { history } from "../../history";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { PlantInventoryItem } from "./plant_inventory_item";
import { destroy } from "../../api/crud";
import { unselectPlant, selectPlant, toggleHoveredPlant } from "../actions";
import { Actions, Content } from "../../constants";
import { TaggedPlant } from "../map/interfaces";
import { getPlants } from "../state_to_props";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "./designer_panel";
import { t } from "../../i18next_wrapper";
import { createGroup } from "../point_groups/actions";

export function mapStateToProps(props: Everything) {
  return {
    selected: props.resources.consumers.farm_designer.selectedPlants,
    plants: getPlants(props.resources),
    dispatch: props.dispatch,
  };
}

export interface SelectPlantsProps {
  plants: TaggedPlant[];
  dispatch: Function;
  selected: string[] | undefined;
}

export class RawSelectPlants extends React.Component<SelectPlantsProps, {}> {
  componentDidMount() {
    const { dispatch, selected } = this.props;
    if (selected && selected.length == 1) {
      unselectPlant(dispatch)();
    } else {
      dispatch(toggleHoveredPlant(undefined, ""));
      dispatch({ type: Actions.HOVER_PLANT_LIST_ITEM, payload: undefined });
    }
  }

  destroySelected = (plantUUIDs: string[] | undefined) => {
    if (plantUUIDs && plantUUIDs.length > 0 &&
      confirm(t("Are you sure you want to delete {{length}} plants?",
        { length: plantUUIDs.length }))) {
      plantUUIDs.map(uuid => {
        this
          .props
          .dispatch(destroy(uuid, true))
          .then(() => { }, () => { });
      });
      history.push("/app/designer/plants");
    }
  }

  selectedNotUndef = (input?: string[] | undefined) => {
    if (input !== undefined) {
      return input;
    } else {
      return [];
    }
  }

  ActionButtons = () =>
    <div className="panel-action-buttons">
      <div className="buttonrow">
        <button className="fb-button gray"
          onClick={() => this.props.dispatch(selectPlant(undefined))}>
          {t("Select none")}
        </button>
        <button className="fb-button gray"
          onClick={() => this.props
            .dispatch(selectPlant(this.props.plants.map(p => p.uuid)))}>
          {t("Select all")}
        </button>
      </div>
      <label>{t("SELECTION ACTIONS")}</label>
      <div className="buttonrow">
        <button className="fb-button red"
          onClick={() => this.destroySelected(this.props.selected)}>
          {t("Delete")}
        </button>
        <button className="fb-button dark-blue"
          onClick={() => this.props.dispatch(createGroup({
            points: this.selectedNotUndef(this.props.selected)
          }))}>
          {t("Create group")}
        </button>
      </div>
    </div>;

  render() {
    const { selected, plants, dispatch } = this.props;
    const selectedPlantData = selected ? selected.map(uuid => {
      return plants.filter(p => { return p.uuid == uuid; })[0];
    }) : undefined;

    return <DesignerPanel panelName={"plant-selection"} panelColor={"gray"}>
      <DesignerPanelHeader
        panelName={"plant-selection"}
        panelColor={"gray"}
        blackText={true}
        title={t("{{length}} plants selected",
          { length: this.selectedNotUndef(selected).length })}
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

export const SelectPlants = connect(mapStateToProps)(RawSelectPlants);
