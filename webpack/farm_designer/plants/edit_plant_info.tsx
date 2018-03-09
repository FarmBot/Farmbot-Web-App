import * as React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import { BackArrow } from "../../ui/index";
import { TaggedPlantPointer } from "../../resources/tagged_resources";
import { mapStateToProps, formatPlantInfo } from "./map_state_to_props";
import { PlantInfoBase } from "./plant_info_base";
import { PlantPanel } from "./plant_panel";
import { catchErrors } from "../../util";

@connect(mapStateToProps)
export class EditPlantInfo extends PlantInfoBase {
  componentDidCatch(x: Error, y: React.ErrorInfo) { catchErrors(x, y); }

  default = (plant_info: TaggedPlantPointer) => {
    const info = formatPlantInfo(plant_info);
    return <div className="panel-container green-panel" >
      <div className="panel-header green-panel">
        <p className="panel-title">
          <BackArrow />
          <span className="title">
            {t("Edit")} {info.name}
          </span>
        </p>
      </div>
      <PlantPanel
        info={info}
        onDestroy={this.destroy}
        updatePlant={this.updatePlant} />
    </div>;
  }

  render() {
    const plant_info = this.plant;
    return plant_info ? this.default(plant_info) : this.fallback();
  }
}
