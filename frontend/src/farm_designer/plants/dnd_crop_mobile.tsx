import * as React from "react";
import * as _ from "lodash";
import { BackArrow } from "../../ui";
import { Everything } from "../../interfaces";
import { connect } from "react-redux";
import { t } from "i18next";
import { isMobile } from "../../util";
import { history } from "../../history";
import { DEFAULT_ICON } from "../../open_farm/index";
import {
  CropInfoProps,
  DNDCropMobileState,
  DraggableEvent
} from "../interfaces";
import { findBySlug } from "../search_selectors";

@connect((state: Everything) => state)
/** DND => "drag and drop" */
export class DNDCropMobile
  extends React.Component<CropInfoProps, DNDCropMobileState> {
  constructor() {
    super();
    this.state = { isDragging: false };
  }

  handleDragStart(e: DraggableEvent) {
    // TODO: Take suggestions from the community about user preference
    let img = document.createElement("img");
    // Stub until we figure out dynamic drag images
    img.src = DEFAULT_ICON;

    // Because of Android and MS Edge.
    _.get(e, "dataTransfer.setDragImage", _.noop)(img, 50, 50);
  }

  toggleDesignerView() {
    this.setState({ isDragging: !this.state.isDragging });
  }

  render() {
    let crop = history.getCurrentLocation().pathname.split("/")[5];

    let result =
      findBySlug(this.props.cropSearchResults,
        crop || "PLANT_NOT_FOUND");

    /** rgba arguments are a more mobile-friendly way apply filters */
    let backgroundURL = isMobile() ? `linear-gradient(
      rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${result.image})` : "";

    return <div className={`panel-container green-panel
    dnd-crop-mobile-panel is-dragging-${this.state.isDragging}`}>
      <div className="panel-header green-panel"
        style={{ background: backgroundURL }}>
        <p className="panel-title">
          <BackArrow /> {result.crop.name}
          <a className="right-button"
            onClick={() => { }}>
            {t("Save and finish")}
          </a>
        </p>
        <div className="panel-header-description">
          <img alt={t("plant icon")}
            draggable={true}
            src={DEFAULT_ICON}
            onTouchStart={this.toggleDesignerView.bind(this)}
            onTouchEnd={this.toggleDesignerView.bind(this)}
            onTouchMove={this.handleDragStart.bind(this)} />
          <b>{t("Drag and drop")}</b> {t(`the icon onto the map. You can add
          multiple plants and make adjustments as many times as you need to
          before you save and finish.`)}
        </div>
      </div>
      <div className="panel-content">
        <div className="object-list">
          <label>
            {t("Crop Info")}
          </label>
          <ul>
            {
              _(result.crop)
                .omit(["slug", "processing_pictures", "description"])
                .pairs()
                .map((pair: string, i: number) => {
                  let key = pair[0];
                  let value = pair[1];
                  return <li key={i}>
                    <strong>
                      {_.startCase(key) + ": "}
                    </strong>
                    {value || "Not set"}
                  </li>;
                }).value()
            }
          </ul>
        </div>
      </div>
    </div>;
  }
}
