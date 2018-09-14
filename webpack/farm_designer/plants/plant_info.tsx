import * as React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import { mapStateToProps, formatPlantInfo } from "./map_state_to_props";
import { PlantInfoBase } from "./plant_info_base";
import { PlantPanel } from "./plant_panel";
import { unselectPlant } from "../actions";
import { Link } from "../../link";
import { TaggedPlant } from "../map/interfaces";

@connect(mapStateToProps)
export class PlantInfo extends PlantInfoBase {

  default = (plant_info: TaggedPlant) => {
    const info = formatPlantInfo(plant_info);
    const { name, id } = info;
    const plantId = (id || "BROKEN").toString();
    return <div className="panel-container green-panel" >
      <div className="panel-header green-panel">
        <p className="panel-title">
          <Link
            to={`/app/designer/${this.plantCategory}`}
            className="back-arrow">
            <i
              className="fa fa-arrow-left"
              onClick={unselectPlant(this.props.dispatch)} />
          </Link>
          <span className="title">
            {name}
          </span>
          <Link
            to={`/app/designer/${this.plantCategory}/${plantId}/edit`}
            className="right-button">
            {t("Edit")}
          </Link>
        </p>
      </div>
      <PlantPanel
        info={info}
        dispatch={this.props.dispatch}
        inSavedGarden={!!this.props.openedSavedGarden} />
    </div>;
  }

  render() {
    const plant_info = this.plant;
    return plant_info ? this.default(plant_info) : this.fallback();
  }
}
