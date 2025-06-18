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

const movedTime = (designer: DesignerState) => {
  const { threeDRealTime, threeDTimeOffset } = designer;
  return threeDRealTime && threeDTimeOffset != 0;
};

export const get3DTime = (designer: DesignerState) => {
  return moment().add(designer.threeDTimeOffset, "seconds");
};

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
  const { designer } = props;
  return <div
    className={[
      "time-travel-button",
      movedTime(designer) ? "active" : "",
      props.isOpen ? "hover" : "",
    ].join(" ")}
    onClick={props.click}
    title={t("Time Travel")}>
    <img src={TAB_ICON[Panel.Settings]} />
    {designer.threeDRealTime &&
      <p>{formatTime(get3DTime(designer), props.timeSettings)}</p>}
  </div>;
};

export interface TimeTravelContentProps {
  dispatch: Function;
  designer: DesignerState;
  threeDGarden: boolean;
  device: DeviceAccountSettings;
}

export const TimeTravelContent = (props: TimeTravelContentProps) => {
  const realTime = props.designer.threeDRealTime;
  const { dispatch } = props;
  return <div className={"time-travel"}>
    <label>{t("Time Travel")}</label>
    <div>
      <button className={"fb-button gray"}
        title={realTime ? t("daytime") : t("realtime")}
        onClick={() => dispatch({
          type: Actions.TOGGLE_3D_REAL_TIME,
          payload: !realTime,
        })}>
        <i className={[
          "fa",
          realTime
            ? "fa-sun-o"
            : "fa-repeat",
        ].join(" ")} />
      </button>
    </div>
    <div className={"row grid-3-col"}>
      <button className={"fb-button gray"}
        title={t("minus hour")}
        onClick={() => dispatch({
          type: Actions.CHANGE_3D_TIME,
          payload: -3600,
        })}>
        <i className={"fa fa-caret-left"} />
      </button>
      <button className={"fb-button gray"}
        title={t("reset hour")}
        onClick={() => dispatch({
          type: Actions.RESET_3D_TIME,
          payload: 0,
        })}>
        <i className={"fa fa-clock-o"} />
      </button>
      <button className={"fb-button gray"}
        title={t("plus hour")}
        onClick={() => dispatch({
          type: Actions.CHANGE_3D_TIME,
          payload: 3600,
        })}>
        <i className={"fa fa-caret-right"} />
      </button>
    </div>
  </div>;
};
