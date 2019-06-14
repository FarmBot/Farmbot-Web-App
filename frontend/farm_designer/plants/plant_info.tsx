import * as React from "react";
import { connect } from "react-redux";
import { mapStateToProps, formatPlantInfo } from "./map_state_to_props";
import { PlantPanel } from "./plant_panel";
import { unselectPlant } from "../actions";
import { TaggedPlant } from "../map/interfaces";
import { DesignerPanel, DesignerPanelHeader } from "./designer_panel";
import { t } from "../../i18next_wrapper";
import { EditPlantInfoProps, PlantOptions } from "../interfaces";
import { isString, isUndefined } from "lodash";
import { history, getPathArray } from "../../history";
import { destroy, edit, save } from "../../api/crud";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";

@connect(mapStateToProps)
export class PlantInfo extends React.Component<EditPlantInfoProps, {}> {
  get templates() { return isString(this.props.openedSavedGarden); }
  get stringyID() { return getPathArray()[this.templates ? 5 : 4] || ""; }
  get plant() { return this.props.findPlant(this.stringyID); }
  get confirmDelete() {
    const confirmSetting = this.props.getConfigValue(
      "confirm_plant_deletion" as BooleanConfigKey);
    return isUndefined(confirmSetting) ? true : confirmSetting;
  }

  destroy = (plantUUID: string) => {
    this.props.dispatch(destroy(plantUUID, !this.confirmDelete));
  }

  updatePlant = (plantUUID: string, update: PlantOptions) => {
    if (this.plant) {
      this.props.dispatch(edit(this.plant, update));
      this.props.dispatch(save(plantUUID));
    }
  }

  fallback = () => {
    history.push("/app/designer/plants");
    return <span>{t("Redirecting...")}</span>;
  }

  default = (plant_info: TaggedPlant) => {
    const info = formatPlantInfo(plant_info);
    return <DesignerPanel panelName={"plant-info"} panelColor={"green"}>
      <DesignerPanelHeader
        panelName={"plant-info"}
        panelColor={"green"}
        title={`${t("Edit")} ${info.name}`}
        backTo={"/app/designer/plants"}
        onBack={unselectPlant(this.props.dispatch)}>
      </DesignerPanelHeader>
      <PlantPanel
        info={info}
        onDestroy={this.destroy}
        updatePlant={this.updatePlant}
        dispatch={this.props.dispatch}
        timeSettings={this.props.timeSettings}
        inSavedGarden={!!this.props.openedSavedGarden} />
    </DesignerPanel>;
  }

  render() {
    const plant_info = this.plant;
    return plant_info ? this.default(plant_info) : this.fallback();
  }
}
