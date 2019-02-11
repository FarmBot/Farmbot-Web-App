import * as React from "react";
import moment from "moment";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { ImageFlipper } from "./image_flipper";
import { PhotosProps, PhotoButtonsProps } from "./interfaces";
import { getDevice } from "../../device";
import { Content } from "../../constants";
import { selectImage } from "./actions";
import { safeStringFetch } from "../../util";
import { destroy } from "../../api/crud";
import {
  downloadProgress
} from "../../devices/components/fbos_settings/os_update_button";
import { TaggedImage } from "farmbot";
import { startCase } from "lodash";
import { MustBeOnline } from "../../devices/must_be_online";

interface MetaInfoProps {
  /** Default conversion is `attr_name ==> Attr Name`.
   *  Setting a label property will over ride it to a different value.
   */
  label?: string;
  attr: string;
  // tslint:disable-next-line:no-any
  obj: any; /** Really, it's OK here! See safeStringFetch */
}

function MetaInfo({ obj, attr, label }: MetaInfoProps) {
  const top = label || startCase(attr.split("_").join());
  const bottom = safeStringFetch(obj, attr);
  return <div>
    <label>{top}:</label>
    <span>{bottom || t("unknown")}</span>
  </div>;
}

const PhotoMetaData = ({ image }: { image: TaggedImage | undefined }) =>
  <div className="image-metadata">
    {image
      ? Object.keys(image.body.meta)
        .filter(key => ["x", "y", "z"].includes(key))
        .sort()
        .map((key, index) =>
          <MetaInfo key={index} attr={key} obj={image.body.meta} />)
      : <MetaInfo
        label={t("Image")}
        attr={"image"}
        obj={{ image: t("No meta data.") }} />}
  </div>;

const PhotoButtons = (props: PhotoButtonsProps) => {
  const imageUploadJobProgress = downloadProgress(props.imageJobs[0]);
  return <div className="farmware-button">
    <MustBeOnline
      syncStatus={props.syncStatus}
      networkState={props.botToMqttStatus}
      hideBanner={true}
      lockOpen={process.env.NODE_ENV !== "production"}>
      <button
        className="fb-button green"
        onClick={props.takePhoto}>
        {t("Take Photo")}
      </button>
    </MustBeOnline>
    <button
      className="fb-button red"
      onClick={props.deletePhoto}>
      {t("Delete Photo")}
    </button>
    <p>
      {imageUploadJobProgress &&
        `${t("uploading photo")}...${imageUploadJobProgress}`}
    </p>
  </div>;
};

export const PhotoFooter = ({ image, timeOffset }: {
  image: TaggedImage | undefined,
  timeOffset: number
}) => {
  const created_at = image
    ? moment(image.body.created_at)
      .utcOffset(timeOffset)
      .format("MMMM Do, YYYY h:mma")
    : "";
  return <div className="photos-footer">
    {/** Separated from <MetaInfo /> for stylistic purposes. */}
    {image ?
      <div className="image-created-at">
        <label>{t("Created At:")}</label>
        <span>
          {created_at}
        </span>
      </div>
      : ""}
    <PhotoMetaData image={image} />
  </div>;
};

export class Photos extends React.Component<PhotosProps, {}> {

  takePhoto = () => {
    const ok = () => success(t(Content.PROCESSING_PHOTO), t("Success"));
    const no = () => error(t("Error taking photo"), t("Error"));
    getDevice().takePhoto().then(ok, no);
  }

  deletePhoto = () => {
    const img = this.props.currentImage || this.props.images[0];
    if (img && img.uuid) {
      this.props.dispatch(destroy(img.uuid))
        .then(() => success(t("Image Deleted."), t("Success")))
        .catch(() => error(t("Could not delete image."), t("Error")));
    }
  }

  render() {
    return <div className="photos">
      <PhotoButtons
        syncStatus={this.props.syncStatus}
        botToMqttStatus={this.props.botToMqttStatus}
        takePhoto={this.takePhoto}
        deletePhoto={this.deletePhoto}
        imageJobs={this.props.imageJobs} />
      <ImageFlipper
        onFlip={id => this.props.dispatch(selectImage(id))}
        currentImage={this.props.currentImage}
        images={this.props.images} />
      <PhotoFooter
        image={this.props.currentImage}
        timeOffset={this.props.timeOffset} />
    </div>;
  }
}
