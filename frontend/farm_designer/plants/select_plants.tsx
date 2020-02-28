import * as React from "react";
import { history } from "../../history";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { PlantInventoryItem } from "./plant_inventory_item";
import { destroy } from "../../api/crud";
import { unselectPlant, selectPlant, setHoveredPlant } from "../map/actions";
import { Actions, Content } from "../../constants";
import { TaggedPlant } from "../map/interfaces";
import { getPlants } from "../state_to_props";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { createGroup } from "../point_groups/actions";
import { PanelColor } from "../panel_header";
import { error } from "../../toast/toast";
import { PlantStatusBulkUpdate } from "./edit_plant_status";

export const mapStateToProps = (props: Everything): SelectPlantsProps => ({
  selected: props.resources.consumers.farm_designer.selectedPlants,
  plants: getPlants(props.resources),
  dispatch: props.dispatch,
  gardenOpen: props.resources.consumers.farm_designer.openedSavedGarden,
});

export interface SelectPlantsProps {
  plants: TaggedPlant[];
  dispatch: Function;
  selected: string[] | undefined;
  gardenOpen: string | undefined;
}

export class RawSelectPlants extends React.Component<SelectPlantsProps, {}> {
  componentDidMount() {
    const { dispatch, selected } = this.props;
    if (selected && selected.length == 1) {
      unselectPlant(dispatch)();
    } else {
      dispatch(setHoveredPlant(undefined));
      dispatch({ type: Actions.HOVER_PLANT_LIST_ITEM, payload: undefined });
    }
  }

  get selected() { return this.props.selected || []; }

  destroySelected = (plantUUIDs: string[] | undefined) => {
    if (plantUUIDs && plantUUIDs.length > 0 &&
      confirm(t("Are you sure you want to delete {{length}} plants?",
        { length: plantUUIDs.length }))) {
      plantUUIDs.map(uuid => {
        this.props.dispatch(destroy(uuid, true))
          .then(() => { }, () => { });
      });
      history.push("/app/designer/plants");
    }
  }

  ActionButtons = () =>
    <div className="panel-action-buttons">
      <div className="button-row">
        <button className="fb-button gray"
          title={t("Select none")}
          onClick={() => this.props.dispatch(selectPlant(undefined))}>
          {t("Select none")}
        </button>
        <button className="fb-button gray"
          title={t("Select all")}
          onClick={() => this.props
            .dispatch(selectPlant(this.props.plants.map(p => p.uuid)))}>
          {t("Select all")}
        </button>
      </div>
      <label>{t("SELECTION ACTIONS")}</label>
      <div className="button-row">
        <button className="fb-button red"
          title={t("Delete")}
          onClick={() => this.destroySelected(this.props.selected)}>
          {t("Delete")}
        </button>
        <button className="fb-button dark-blue"
          title={t("Create group")}
          onClick={() => !this.props.gardenOpen
            ? this.props.dispatch(createGroup({ pointUuids: this.selected }))
            : error(t(Content.ERROR_PLANT_TEMPLATE_GROUP))}>
          {t("Create group")}
        </button>
        <PlantStatusBulkUpdate
          plants={this.props.plants}
          selected={this.selected}
          dispatch={this.props.dispatch} />
      </div>
    </div>;

  render() {
    const { plants, dispatch } = this.props;
    const selectedPlantData =
      this.selected.map(uuid => plants.filter(p => p.uuid == uuid)[0]);

    return <DesignerPanel panelName={"plant-selection"}
      panelColor={PanelColor.lightGray}>
      <DesignerPanelHeader
        panelName={"plant-selection"}
        panelColor={PanelColor.lightGray}
        blackText={true}
        title={t("{{length}} plants selected",
          { length: this.selected.length })}
        backTo={"/app/designer/plants"}
        onBack={unselectPlant(dispatch)}
        description={Content.BOX_SELECT_DESCRIPTION} />
      <this.ActionButtons />

      <DesignerPanelContent panelName={"plant-selection"}>
        {selectedPlantData && selectedPlantData[0] &&
          selectedPlantData.map(p =>
            <PlantInventoryItem
              key={p.uuid}
              plant={p}
              hovered={false}
              dispatch={dispatch} />)}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const SelectPlants = connect(mapStateToProps)(RawSelectPlants);
