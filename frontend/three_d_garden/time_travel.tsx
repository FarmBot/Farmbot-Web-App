import React from "react";
import moment from "moment";
import { t } from "../i18next_wrapper";
import { Actions } from "../constants";
import { DesignerState } from "../farm_designer/interfaces";
import { Panel, TAB_ICON } from "../farm_designer/panel_header";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { formatTime } from "../util";
import { TimeSettings } from "../interfaces";

export const latLng = (device: DeviceAccountSettings) => {
  const latitude = parseFloat("" + device.lat);
  const longitude = parseFloat("" + device.lng);
  const valid = isFinite(latitude) && isFinite(longitude);
  return { latitude, longitude, valid };
};

export const get3DTime = (threeDTime: string | undefined) => {
  return threeDTime ? moment(threeDTime, "HH:mm") : moment();
};

const calc3DTime = (threeDTime: string | undefined, offset: number) =>
  get3DTime(threeDTime).add(offset, "hour").format("HH:mm");

export interface TimeTravelTargetProps {
  isOpen: boolean;
  click(): void;
  timeSettings: TimeSettings;
  designer: DesignerState;
  device: DeviceAccountSettings;
  threeDGarden: boolean;
}

export const TimeTravelTarget = (props: TimeTravelTargetProps) => {
  if (!props.threeDGarden || !latLng(props.device).valid) { return <div />; }
  const { threeDTime } = props.designer;
  return <div
    className={[
      "time-travel-button",
      threeDTime ? "active" : "",
      props.isOpen ? "hover" : "",
    ].join(" ")}
    onClick={props.click}
    title={t("Time Travel")}>
    <img src={TAB_ICON[Panel.Settings]} />
    <p>{formatTime(get3DTime(threeDTime), props.timeSettings)}</p>
  </div>;
};

export interface TimeTravelContentProps {
  dispatch: Function;
  designer: DesignerState;
  threeDGarden: boolean;
  device: DeviceAccountSettings;
}

export const TimeTravelContent = (props: TimeTravelContentProps) => {
  const { threeDTime } = props.designer;
  const { dispatch } = props;
  return <div className={"time-travel"}>
    <label>{t("Time Travel")}</label>
    <div className={"row grid-3-col"}>
      <button className={"fb-button gray"}
        title={t("minus hour")}
        onClick={() => dispatch({
          type: Actions.SET_3D_TIME,
          payload: calc3DTime(threeDTime, -1),
        })}>
        <i className={"fa fa-caret-left"} />
      </button>
      <button className={"fb-button gray"}
        title={t("reset hour")}
        onClick={() => dispatch({
          type: Actions.SET_3D_TIME,
          payload: undefined,
        })}>
        <i className={"fa fa-clock-o"} />
      </button>
      <button className={"fb-button gray"}
        title={t("plus hour")}
        onClick={() => dispatch({
          type: Actions.SET_3D_TIME,
          payload: calc3DTime(threeDTime, 1),
        })}>
        <i className={"fa fa-caret-right"} />
      </button>
    </div>
  </div>;
};
