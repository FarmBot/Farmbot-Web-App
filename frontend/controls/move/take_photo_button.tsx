import React from "react";
import { takePhoto } from "../../devices/actions";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../../photos/capture_settings/camera_selection";
import { Popover } from "../../ui";
import { TakePhotoButtonProps } from "./interfaces";

export const TakePhotoButton = (props: TakePhotoButtonProps) => {
  const camDisabled = cameraBtnProps(props.env, props.botOnline);
  const job = props.imageJobs[0];
  const downloadPercent = job?.unit == "percent" ? job.percent : 0;
  const taken = props.logs
    .filter(log => !log.body.id && log.body.message == "Taking photo");
  const [clicked, setClicked] = React.useState(false);
  const clickedPercent = clicked ? 25 : 0;
  const takenPercent = taken.length > 0 ? 25 : 0;
  const percent = clickedPercent + takenPercent + (downloadPercent || 0) / 2;
  const sendCommand = () => {
    takePhoto();
    setClicked(true);
    setTimeout(() => setClicked(false), 3000);
  };
  return <button
    className={[
      percent ? "in-progress" : "fa fa-camera",
      "arrow-button fb-button",
      camDisabled.class,
    ].join(" ")}
    title={camDisabled.title || t("Take a photo")}
    onClick={camDisabled.click || sendCommand}>
    {!props.botOnline &&
      <Popover
        popoverClassName={"help camera-message"}
        target={<i />}
        content={<div className={"help-text-content"}>
          {t(camDisabled.title)}
        </div>} />}
    {clicked &&
      <div className={"progress-percent"}
        style={{
          background: `conic-gradient(#434343 ${percent}%, #ccc ${percent}%)`,
        }}>
        <p>{percent}%</p>
      </div>}
  </button>;
};
