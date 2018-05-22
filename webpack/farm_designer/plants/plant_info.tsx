import * as React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import { Link } from "react-router";
import { TaggedPlantPointer } from "../../resources/tagged_resources";
import { mapStateToProps, formatPlantInfo } from "./map_state_to_props";
import { PlantInfoBase } from "./plant_info_base";
import { PlantPanel } from "./plant_panel";
import { unselectPlant } from "../actions";

@connect(mapStateToProps)
export class PlantInfo extends PlantInfoBase {

  componentWillUnmount() {
    unselectPlant(this.props.dispatch)();
  }

  default = (plant_info: TaggedPlantPointer) => {
    const info = formatPlantInfo(plant_info);
    const { name, id } = info;
    return <div className="panel-container green-panel" >
      <div className="panel-header green-panel">
        <p className="panel-title">
          <Link to="/app/designer/plants" className="back-arrow">
            <i
              className="fa fa-arrow-left"
              onClick={unselectPlant(this.props.dispatch)} />
          </Link>
          <span className="title">
            {name}
          </span>
          <Link
            to={`/app/designer/plants/` + (id || "BROKEN").toString() + `/edit`}
            className="right-button">
            {t("Edit")}
          </Link>
        </p>
      </div>
      <PlantPanel info={info} dispatch={this.props.dispatch} />
    </div>;
  }

  render() {
    const plant_info = this.plant;
    return plant_info ? this.default(plant_info) : this.fallback();
  }
}
