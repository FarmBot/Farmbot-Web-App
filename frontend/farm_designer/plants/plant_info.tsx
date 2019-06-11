import * as React from "react";
import { connect } from "react-redux";
import { mapStateToProps, formatPlantInfo } from "./map_state_to_props";
import { PlantInfoBase } from "./plant_info_base";
import { PlantPanel } from "./plant_panel";
import { unselectPlant } from "../actions";
import { TaggedPlant } from "../map/interfaces";
import { DesignerPanel, DesignerPanelHeader } from "./designer_panel";
import { t } from "../../i18next_wrapper";

@connect(mapStateToProps)
export class PlantInfo extends PlantInfoBase {

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
