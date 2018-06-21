import * as React from "react";
import * as _ from "lodash";
import * as moment from "moment";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { ImageFlipper } from "./image_flipper";
import { PhotosProps } from "./interfaces";
import { getDevice } from "../../device";
import { Content } from "../../constants";
import { selectImage } from "./actions";
import { safeStringFetch } from "../../util";
import { destroy } from "../../api/crud";

interface MetaInfoProps {
  /** Default conversion is `attr_name ==> Attr Name`.
   *  Setting a label property will over ride it to a differrent value.
   */
  label?: string;
  attr: string;
  // tslint:disable-next-line:no-any
  obj: any; /** Really, it's OK here! See safeStringFetch */
}

function MetaInfo({ obj, attr, label }: MetaInfoProps) {
  const top = label || _.startCase(attr.split("_").join());
  const bottom = safeStringFetch(obj, attr);
  return <div>
    <label>{top}:</label>
    <span>{bottom || "unknown"}</span>
  </div>;
}

export class Photos extends React.Component<PhotosProps, {}> {

  takePhoto = () => {
    const ok = () => success(t(Content.PROCESSING_PHOTO), t("Success"));
    const no = () => error(t("Error taking photo"), t("Error"));
    getDevice().takePhoto().then(ok, no);
  }

  metaDatas() {
    const i = this.props.currentImage;
    if (i) {
      const { meta } = i.body;
      return Object.keys(meta)
        .filter(key => ["x", "y", "z"].includes(key))
        .sort()
        .map((key, index) => {
          return <MetaInfo key={index} attr={key} obj={meta} />;
        });
    } else {
      return <MetaInfo attr={t("image")} obj={{ image: t("No meta data.") }} />;
    }
  }

  destroy = () => {
    const img = this.props.currentImage || this.props.images[0];
    if (img && img.uuid) {
      this.props.dispatch(destroy(img.uuid))
        .then(() => success(t("Image Deleted."), t("Success")))
        .catch(() => error(t("Could not delete image."), t("Error")));
    }
  }

  render() {
    const image = this.props.currentImage;
    const created_at = image
      ? moment(image.body.created_at)
        .utcOffset(this.props.timeOffset)
        .format("MMMM Do, YYYY h:mma")
      : "";
    return <div className="photos">
      <div className="farmware-button">
        <button
          className="fb-button green"
          onClick={this.takePhoto}>
          {t("Take Photo")}
        </button>
        <button
          className="fb-button red"
          onClick={() => this.destroy()}>
          {t("Delete Photo")}
        </button>
      </div>
      <ImageFlipper
        onFlip={id => { this.props.dispatch(selectImage(id)); }}
        currentImage={this.props.currentImage}
        images={this.props.images} />
      <div className="photos-footer">
        {/** Separated from <MetaInfo /> for stylistic purposes. */}
        {image ?
          <div className="image-created-at">
            <label>{t("Created At:")}</label>
            <span>
              {created_at}
            </span>
          </div>
          : ""}
        <div className="image-metadatas">
          {this.metaDatas()}
        </div>
      </div>
    </div>;
  }
}
