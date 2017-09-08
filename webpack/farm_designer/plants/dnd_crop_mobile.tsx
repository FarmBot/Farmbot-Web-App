import * as React from "react";
import * as _ from "lodash";
import { BackArrow } from "../../ui";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { t } from "i18next";
import { history } from "../../history";
import { DEFAULT_ICON, svgToUrl } from "../../open_farm/index";
import {
  CropInfoProps,
  DNDCropMobileState,
  DraggableEvent,
  CropCatalogProps
} from "../interfaces";
import { findBySlug } from "../search_selectors";
import { OFSearch } from "../util";

export function mapStateToProps(props: Everything): CropCatalogProps {
  return {
    OFSearch,
    cropSearchQuery: props.resources.consumers.farm_designer.cropSearchQuery,
    dispatch: Function,
    cropSearchResults: props
      .resources
      .consumers
      .farm_designer
      .cropSearchResults || []
  };
}

@connect(mapStateToProps)
/** DND => "drag and drop" */
export class DNDCropMobile
  extends React.Component<CropInfoProps, DNDCropMobileState> {
  constructor() {
    super();
    this.state = { isDragging: false };
  }

  handleDragStart(e: DraggableEvent) {
    const img = document.createElement("img");
    img.src = DEFAULT_ICON;

    // Because of Android and MS Edge.
    _.get(e, "dataTransfer.setDragImage", _.noop)(img, 50, 50);
  }

  toggleDesignerView() {
    this.setState({ isDragging: !this.state.isDragging });
  }

  render() {
    const crop = history.getCurrentLocation().pathname.split("/")[5];
    const result =
      findBySlug(this.props.cropSearchResults, crop || "PLANT_NOT_FOUND");

    const basePath = "/app/designer/plants/crop_search/";

    const backgroundURL = `linear-gradient(
      rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${result.image})`;

    return <div className={`panel-container green-panel
    dnd-crop-mobile-panel is-dragging-${this.state.isDragging}`}>
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
            alt={t("plant icon")}
            width={100}
            height={100}
            draggable={true}
            src={svgToUrl(result.crop.svg_icon)}
            onTouchStart={this.toggleDesignerView.bind(this)}
            onTouchEnd={this.toggleDesignerView.bind(this)}
            onTouchMove={this.handleDragStart.bind(this)} />
          <b>{t("Drag and drop")}</b> {t("the icon onto the map or ")}
          <b>{t("CLICK anywhere within the grid")}</b> {t(`to add the plant
          to the map. You can add the plant as many times as you need to
          before pressing DONE to finish.`)}
        </div>
      </div>
    </div>;
  }
}
