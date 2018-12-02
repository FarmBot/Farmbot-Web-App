import * as React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import { mapStateToProps, formatPlantInfo } from "./map_state_to_props";
import { PlantInfoBase } from "./plant_info_base";
import { PlantPanel } from "./plant_panel";
import { TaggedPlant } from "../map/interfaces";
import { DesignerPanel, DesignerPanelHeader } from "./designer_panel";

@connect(mapStateToProps)
export class EditPlantInfo extends PlantInfoBase {

  default = (plant_info: TaggedPlant) => {
    const info = formatPlantInfo(plant_info);
    return <DesignerPanel panelName={"plant"} panelColor={"green"}>
      <DesignerPanelHeader
        panelName={"plant"}
        title={`${t("Edit")} ${info.name}`}
        panelColor={"green"} />
      <PlantPanel
        info={info}
        onDestroy={this.destroy}
        updatePlant={this.updatePlant}
        dispatch={this.props.dispatch}
        inSavedGarden={!!this.props.openedSavedGarden} />
    </DesignerPanel>;
  }

  render() {
    const plant_info = this.plant;
    return plant_info ? this.default(plant_info) : this.fallback();
  }
}
