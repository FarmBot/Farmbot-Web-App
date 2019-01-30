import * as React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import { mapStateToProps, formatPlantInfo } from "./map_state_to_props";
import { PlantInfoBase } from "./plant_info_base";
import { PlantPanel } from "./plant_panel";
import { unselectPlant } from "../actions";
import { Link } from "../../link";
import { TaggedPlant } from "../map/interfaces";
import { DesignerPanel, DesignerPanelHeader } from "./designer_panel";

@connect(mapStateToProps)
export class PlantInfo extends PlantInfoBase {

  default = (plant_info: TaggedPlant) => {
    const info = formatPlantInfo(plant_info);
    const { name, id } = info;
    const plantId = (id || "BROKEN").toString();
    return <DesignerPanel panelName={"plant-info"} panelColor={"green"}>
      <DesignerPanelHeader
        panelName={"plant-info"}
        panelColor={"green"}
        title={name}
        backTo={"/app/designer/plants"}
        onBack={unselectPlant(this.props.dispatch)}>
        <Link
          to={`/app/designer/${this.plantCategory}/${plantId}/edit`}
          title={t("Edit this plant")}
          className="right-button">
          {t("Edit")}
        </Link>
      </DesignerPanelHeader>
      <PlantPanel
        info={info}
        dispatch={this.props.dispatch}
        inSavedGarden={!!this.props.openedSavedGarden} />
    </DesignerPanel>;
  }

  render() {
    const plant_info = this.plant;
    return plant_info ? this.default(plant_info) : this.fallback();
  }
}
