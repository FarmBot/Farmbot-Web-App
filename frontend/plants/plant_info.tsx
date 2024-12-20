import React from "react";
import { connect } from "react-redux";
import { mapStateToProps, formatPlantInfo } from "./map_state_to_props";
import { PlantPanel } from "./plant_panel";
import { unselectPlant } from "../farm_designer/map/actions";
import { TaggedPlant } from "../farm_designer/map/interfaces";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { EditPlantInfoProps, PlantOptions } from "../farm_designer/interfaces";
import { isFinite } from "lodash";
import { Navigate } from "react-router";
import { destroy, edit, save } from "../api/crud";
import { BooleanSetting } from "../session_keys";
import { Panel } from "../farm_designer/panel_header";
import { Path } from "../internal_urls";
import { validGoButtonAxes } from "../farm_designer/move_to";

export type UpdatePlant = (uuid: string, update: PlantOptions) => void;

export class RawPlantInfo extends React.Component<EditPlantInfoProps, {}> {
  get templates() { return isFinite(this.props.openedSavedGarden); }
  get stringyID() {
    return Path.getSlug((this.templates
      ? Path.plantTemplates
      : Path.plants)());
  }
  get plant() { return this.props.findPlant(this.stringyID); }
  get confirmDelete() {
    const confirmSetting = this.props.getConfigValue(
      BooleanSetting.confirm_plant_deletion);
    return confirmSetting ?? true;
  }

  destroy = (plantUUID: string) => () => {
    this.props.dispatch(destroy(plantUUID, !this.confirmDelete));
  };

  updatePlant = (plantUUID: string, update: PlantOptions) => {
    if (this.plant) {
      this.props.dispatch(edit(this.plant, update));
      this.props.dispatch(save(plantUUID));
    }
  };

  fallback = () => {
    const plantsPath = Path.plants();
    const templatePath = Path.plantTemplates();
    return <DesignerPanel panelName={"plant-info"} panel={Panel.Plants}>
      {(Path.startsWith(plantsPath) || Path.startsWith(templatePath))
        && !Path.startsWith(Path.cropSearch()) &&
        <Navigate to={plantsPath} />}
      <DesignerPanelHeader
        panelName={"plant-info"}
        panel={Panel.Plants}
        title={`${t("Edit")}`}
        backTo={plantsPath}
        onBack={unselectPlant(this.props.dispatch)} />
      <DesignerPanelContent panelName={"plants"}>
        <span>{t("Redirecting")}...</span>
      </DesignerPanelContent>
    </DesignerPanel>;
  };

  default = (plant: TaggedPlant) => {
    const info = formatPlantInfo(plant);
    return <DesignerPanel panelName={"plant-info"} panel={Panel.Plants}>
      <DesignerPanelHeader
        panelName={"plant-info"}
        panel={Panel.Plants}
        title={`${t("Edit")} ${info.name}`}
        specialStatus={plant.specialStatus}
        onSave={() => plant.uuid &&
          this.props.dispatch(save(plant.uuid))}
        backTo={Path.plants()}
        onBack={unselectPlant(this.props.dispatch)}>
        <div className={"panel-header-icon-group"}>
          <i title={t("delete")}
            className={"fa fa-trash fb-icon-button invert"}
            onClick={this.destroy(info.uuid)} />
        </div>
      </DesignerPanelHeader>
      <PlantPanel
        info={info}
        updatePlant={this.updatePlant}
        dispatch={this.props.dispatch}
        timeSettings={this.props.timeSettings}
        botOnline={this.props.botOnline}
        arduinoBusy={this.props.arduinoBusy}
        currentBotLocation={this.props.currentBotLocation}
        movementState={this.props.movementState}
        defaultAxes={validGoButtonAxes(this.props.getConfigValue)}
        soilHeightPoints={this.props.soilHeightPoints}
        farmwareEnvs={this.props.farmwareEnvs}
        inSavedGarden={!!this.props.openedSavedGarden}
        sourceFbosConfig={this.props.sourceFbosConfig}
        botSize={this.props.botSize}
        curves={this.props.curves}
        plants={this.props.plants} />
    </DesignerPanel>;
  };

  render() {
    return this.plant ? this.default(this.plant) : this.fallback();
  }
}

export const PlantInfo = connect(mapStateToProps)(RawPlantInfo);
// eslint-disable-next-line import/no-default-export
export default PlantInfo;
