import * as React from "react";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { Widget, WidgetHeader, WidgetBody } from "../ui/index";
import { ImageFlipper } from "../images/index";
import { PhotosProps } from "./interfaces";
import { devices } from "../device";
import { ToolTips } from "../constants";
import { selectImage } from "../images/actions";

export class Photos extends React.Component<PhotosProps, void> {

  takePhoto = () => {
    let ok = () => success(t("Processing now. Refresh page to see result."));
    let no = () => error("Error taking photo");
    devices.current.takePhoto().then(ok, no);
  }

  render() {
    return <Widget className="photos-widget">
      <WidgetHeader helpText={ToolTips.PHOTOS} title={"Photos"}>
        <button
          className="fb-button gray"
          onClick={this.takePhoto}
        >
          {t("Take Photo")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        <ImageFlipper
          onFlip={(id) => { this.props.dispatch(selectImage(id)) }}
          currentImage={this.props.currentImage}
          images={this.props.images} />
      </WidgetBody>
    </Widget>
  }
}
