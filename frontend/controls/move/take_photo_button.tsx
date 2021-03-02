import React from "react";
import { takePhoto } from "../../devices/actions";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../../photos/capture_settings/camera_selection";
import { TakePhotoButtonProps } from "./interfaces";

export const TakePhotoButton = (props: TakePhotoButtonProps) => {
  const camDisabled = cameraBtnProps(props.env);
  return <button
    className={
      `fa fa-camera arrow-button fb-button ${camDisabled.class}`}
    disabled={props.disabled}
    title={camDisabled.title || t("Take a photo")}
    onClick={camDisabled.click || takePhoto} />;
};
