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

const stopPopupEvent = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

interface ObjectPopupProps extends ThreeDObjectSelectionLayerProps {
  object: ResolvedThreeDObject;
  visible: boolean;
}

export const ObjectPopup = (props: ObjectPopupProps) => {
  const coordinates = props.object.kind == "utm"
    ? `(${Math.round(props.object.locationCoordinate.x)}, `
      + `${Math.round(props.object.locationCoordinate.y)}, `
      + `${Math.round(props.object.locationCoordinate.z)})`
    : undefined;
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
          && props.object.kind != "camera" &&
          <PopupObjectLocationRow {...props} />}
        <ObjectPopupControls {...props} />
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
