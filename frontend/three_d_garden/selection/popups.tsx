import React from "react";
import { ThreeDObjectSelectionLayerProps } from "./props";
import {
  ResolvedLocationObject, ResolvedThreeDObject,
} from "./resolve";
import {
  ObjectPopupControls, ObjectPopupCopyButton, ObjectPopupDeleteButton,
  ObjectPopupHeaderColor, ObjectPopupVisibilityButton,
  PopupObjectLocationRow, PopupSelectedLocationRow,
} from "./popup_controls";
import { t } from "../../i18next_wrapper";
import { DiagnosisSaucer } from "../../devices/connectivity/diagnosis";
import { connectivityData } from "../../devices/connectivity/generate_data";
import { getFwHardwareValue } from
  "../../settings/firmware/firmware_hardware_support";
import { ConnectivityPopupContent } from "./connectivity_popup";
import { ThreeDPopup } from "../controls";

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

const objectShowsLocation = (object: ResolvedThreeDObject) =>
  ![
    "utm",
    "electronics",
    "camera",
    "connectivity",
    "sceneObject",
    "bed",
    "safeHeight",
  ].includes(object.kind);

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
  return <ThreeDPopup
    name={"selected-object-popup"}
    position={props.object.popupPosition}
    visible={props.visible}
    title={
      <span className={"row"}>
        {props.object.name}
        {connectivity &&
            <DiagnosisSaucer {...connectivity.flags}
              className={"three-d-connectivity"} />}
        {coordinates &&
            <span className={"object-popup-title-coordinates"}>
              {` ${coordinates}`}
            </span>}
      </span>}
    headerActions={
      <>
        <ObjectPopupHeaderColor {...props} />
        <ObjectPopupVisibilityButton {...props} />
        <ObjectPopupDeleteButton {...props} />
        <ObjectPopupCopyButton {...props} />
        {props.object.kind != "safeHeight" && <button
          type={"button"}
          className={"fa fa-external-link fb-icon-button invert"}
          title={t("open panel")}
          onClick={() => props.onOpenPanel(props.object.selection)} />}
      </>}
    onClose={props.onClosePopup}>
    {objectShowsLocation(props.object) &&
      <PopupObjectLocationRow {...props} />}
    {popupContent}
  </ThreeDPopup>;
};

interface LocationPopupProps extends ThreeDObjectSelectionLayerProps {
  object: ResolvedLocationObject;
  visible: boolean;
}

export const LocationPopup = (props: LocationPopupProps) => {
  return <ThreeDPopup
    name={"selected-location-popup"}
    position={props.object.popupPosition}
    visible={props.visible}
    title={t("Location")}
    headerActions={
      <button
        type={"button"}
        className={"fa fa-external-link fb-icon-button invert"}
        title={t("open panel")}
        onClick={() => props.onOpenLocationPanel(props.object.selection)} />}
    onClose={props.onClosePopup}>
    <PopupSelectedLocationRow {...props} />
  </ThreeDPopup>;
};
