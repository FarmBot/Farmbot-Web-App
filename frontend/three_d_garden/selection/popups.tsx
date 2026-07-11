import React from "react";
import { Html } from "@react-three/drei";
import { ThreeDObjectSelectionLayerProps } from "./props";
import {
  ResolvedLocationObject, ResolvedThreeDObject,
} from "./resolve";
import {
  ObjectPopupControls, ObjectPopupDeleteButton, ObjectPopupHeaderColor,
  PopupObjectLocationRow, PopupSelectedLocationRow,
} from "./popup_controls";
import { t } from "../../i18next_wrapper";
import { DiagnosisSaucer } from "../../devices/connectivity/diagnosis";
import { connectivityData } from "../../devices/connectivity/generate_data";
import { getFwHardwareValue } from
  "../../settings/firmware/firmware_hardware_support";
import { ConnectivityPopupContent } from "./connectivity_popup";

const stopPopupEvent = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

interface ObjectPopupProps extends ThreeDObjectSelectionLayerProps {
  object: ResolvedThreeDObject;
  visible: boolean;
}

const popupConnectivityData = (props: ObjectPopupProps) => {
  if (props.object.kind != "connectivity"
    || !props.bot
    || !props.deviceAccount) {
    return undefined;
  }
  return connectivityData({
    bot: props.bot,
    device: props.deviceAccount,
    apiFirmwareValue: getFwHardwareValue(props.fbosConfig),
  });
};

export const ObjectPopup = (props: ObjectPopupProps) => {
  const coordinates = props.object.kind == "utm"
    ? `(${Math.round(props.object.locationCoordinate.x)}, `
      + `${Math.round(props.object.locationCoordinate.y)}, `
      + `${Math.round(props.object.locationCoordinate.z)})`
    : undefined;
  const connectivity = popupConnectivityData(props);
  let popupContent = <ObjectPopupControls {...props} />;
  if (props.object.kind == "connectivity") {
    popupContent = connectivity && props.bot
      ? <ConnectivityPopupContent bot={props.bot} data={connectivity} />
      : <></>;
  }
  return <Html
    name={"selected-object-popup"}
    wrapperClass={"three-d-object-popup-wrapper"}
    center={true}
    position={props.object.popupPosition}>
    <div
      className={[
        "three-d-object-popup",
        "grid",
        props.visible ? "visible" : "hidden",
      ].join(" ")}
      onPointerDown={stopPopupEvent}
      onContextMenu={stopPopupEvent}
      onWheel={stopPopupEvent}
      onClick={stopPopupEvent}>
      <div className={"object-popup-header row grid-exp-2"}>
        <h3 className={"row"}>
          {props.object.name}
          {connectivity &&
            <DiagnosisSaucer {...connectivity.flags}
              className={"three-d-connectivity"} />}
          {coordinates &&
            <span className={"object-popup-title-coordinates"}>
              {` ${coordinates}`}
            </span>}
        </h3>
        <div className={"object-popup-button-cluster row no-gap"}>
          <ObjectPopupHeaderColor {...props} />
          <ObjectPopupDeleteButton {...props} />
          <button
            type={"button"}
            className={"fa fa-external-link fb-icon-button invert"}
            title={t("open panel")}
            onClick={() => props.onOpenPanel(props.object.selection)} />
          <button
            type={"button"}
            className={"fa fa-times fb-icon-button invert"}
            title={t("close")}
            onClick={props.onClosePopup} />
        </div>
      </div>
      <div className={"object-popup-content grid"}>
        {props.object.kind != "utm"
          && props.object.kind != "electronics"
          && props.object.kind != "camera"
          && props.object.kind != "connectivity" &&
          <PopupObjectLocationRow {...props} />}
        {popupContent}
      </div>
    </div>
  </Html>;
};

interface LocationPopupProps extends ThreeDObjectSelectionLayerProps {
  object: ResolvedLocationObject;
  visible: boolean;
}

export const LocationPopup = (props: LocationPopupProps) => {
  return <Html
    name={"selected-location-popup"}
    wrapperClass={"three-d-object-popup-wrapper"}
    center={true}
    position={props.object.popupPosition}>
    <div
      className={[
        "three-d-object-popup",
        "grid",
        props.visible ? "visible" : "hidden",
      ].join(" ")}
      onPointerDown={stopPopupEvent}
      onContextMenu={stopPopupEvent}
      onWheel={stopPopupEvent}
      onClick={stopPopupEvent}>
      <div className={"object-popup-header row grid-exp-2"}>
        <h3>{t("Location")}</h3>
        <div className={"object-popup-button-cluster row no-gap"}>
          <button
            type={"button"}
            className={"fa fa-external-link fb-icon-button invert"}
            title={t("open panel")}
            onClick={() => props.onOpenLocationPanel(props.object.selection)} />
          <button
            type={"button"}
            className={"fa fa-times fb-icon-button invert"}
            title={t("close")}
            onClick={props.onClosePopup} />
        </div>
      </div>
      <div className={"object-popup-content grid"}>
        <PopupSelectedLocationRow {...props} />
      </div>
    </div>
  </Html>;
};
