import React from "react";
import { t } from "../../i18next_wrapper";
import { getDevice } from "../../device";
import { commandErr } from "../../devices/actions";
import { cameraBtnProps } from "../../photos/capture_settings/camera_selection";
import { TakePhotoButtonProps } from "./interfaces";

export const TakePhotoButton = (props: TakePhotoButtonProps) => {
  const camDisabled = cameraBtnProps(props.env);
  return <button
    className={
      `fa fa-camera arrow-button fb-button ${camDisabled.class}`}
    disabled={props.disabled}
    title={camDisabled.title || t("Take a photo")}
    onClick={camDisabled.click ||
      (() => getDevice().takePhoto().catch(commandErr("Photo")))} />;
};
