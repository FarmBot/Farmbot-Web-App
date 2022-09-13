import { round } from "lodash";
import React from "react";
import { takePhoto } from "../../devices/actions";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../../photos/capture_settings/camera_selection";
import { Popover } from "../../ui";
import { greaterThanTime, recentMsgLog } from "../../wizard/checks";
import { TakePhotoButtonProps } from "./interfaces";

interface TakePhotoButtonState {
  clickedAt: number | undefined;
}

export class TakePhotoButton
  extends React.Component<TakePhotoButtonProps, TakePhotoButtonState> {
  state: TakePhotoButtonState = {
    clickedAt: undefined,
  };

  get now() { return new Date().getTime() / 1000; }

  render() {
    const { logs, botOnline, imageJobs, env } = this.props;
    const { clickedAt } = this.state;
    const camDisabled = cameraBtnProps(env, botOnline);
    const job = imageJobs.filter(x => greaterThanTime(x.updated_at, clickedAt))[0];
    const downloadPercent = job?.unit == "percent" ? job.percent : 0;
    const photoTaken = recentMsgLog(logs, clickedAt, ["Taking photo"]);
    const done = recentMsgLog(logs, clickedAt, ["Uploaded image:"]);
    const clickedPercent = clickedAt ? 25 : 0;
    const takenPercent = photoTaken ? 25 : 0;
    const percent = clickedPercent + takenPercent + round(downloadPercent / 2);
    const sendCommand = () => {
      this.setState({ clickedAt: this.now });
      takePhoto();
    };
    const recentlyClicked = clickedAt && (this.now - clickedAt) < 15;
    const inProgress = recentlyClicked && !done && botOnline;
    return <button
      className={[
        inProgress ? "in-progress" : "fa fa-camera",
        "arrow-button fb-button",
        camDisabled.class,
      ].join(" ")}
      title={camDisabled.title || t("Take a photo")}
      onClick={camDisabled.click || sendCommand}>
      {!botOnline &&
        <Popover
          popoverClassName={"help camera-message"}
          target={<i />}
          content={<div className={"help-text-content"}>
            {t(camDisabled.title)}
          </div>} />}
      {inProgress &&
        <div className={"progress-percent"}
          style={{
            background: `conic-gradient(#434343 ${percent}%, #ccc ${percent}%)`,
          }}>
          <p>{percent}%</p>
        </div>}
    </button>;
  }
}
