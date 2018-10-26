import * as React from "react";
import { BackArrow } from "../../ui/index";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { t } from "i18next";
import { history, getPathArray } from "../../history";
import { svgToUrl } from "../../open_farm/icons";
import { CropLiveSearchResult } from "../interfaces";
import { findBySlug } from "../search_selectors";
import { setDragIcon } from "../actions";

export function mapStateToProps(props: Everything): AddPlantProps {
  return {
    cropSearchResults: props
      .resources
      .consumers
      .farm_designer
      .cropSearchResults || []
  };
}

export interface AddPlantProps {
  cropSearchResults: CropLiveSearchResult[];
}

@connect(mapStateToProps)
export class AddPlant
  extends React.Component<AddPlantProps, {}> {
  render() {
    const crop = getPathArray()[5];
    const result =
      findBySlug(this.props.cropSearchResults, crop || "PLANT_NOT_FOUND");

    const basePath = "/app/designer/plants/crop_search/";

    const backgroundURL = `linear-gradient(
      rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${result.image})`;

    return <div
      className={"panel-container green-panel add-plant-panel"}>
      <div className="panel-header green-panel"
        style={{ background: backgroundURL }}>
        <p className="panel-title">
          <BackArrow /> {result.crop.name}
          <a className="right-button"
            onClick={() => history.push(basePath + crop)}>
            {t("Done")}
          </a>
        </p>
        <div className="panel-header-description">
          <img className="crop-drag-info-image"
            src={svgToUrl(result.crop.svg_icon)}
            alt={t("plant icon")}
            width={100}
            height={100}
            onDragStart={setDragIcon(result.crop.svg_icon)} />
          <b>{t("Drag and drop")}</b> {t("the icon onto the map or ")}
          <b>{t("CLICK anywhere within the grid")}</b> {t(`to add the plant
          to the map. You can add the plant as many times as you need to
          before pressing DONE to finish.`)}
        </div>
      </div>
    </div>;
  }
}
