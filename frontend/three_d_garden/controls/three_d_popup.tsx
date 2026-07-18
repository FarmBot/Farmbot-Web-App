import React from "react";
import { Html } from "@react-three/drei";
import { t } from "../../i18next_wrapper";
import { ControlPoint } from "./types";

export const stopThreeDPopupEvent = (
  event: React.SyntheticEvent,
) => {
  event.stopPropagation();
};

export interface ThreeDPopupProps {
  name?: string;
  position: ControlPoint;
  rotation?: ControlPoint;
  title?: React.ReactNode;
  onClose?(): void;
  closeDisabled?: boolean;
  headerActions?: React.ReactNode;
  visible?: boolean;
  className?: string;
  contentClassName?: string;
  wrapperClass?: string;
  center?: boolean;
  distanceFactor?: number;
  children: React.ReactNode;
}

export const ThreeDPopup = (props: ThreeDPopupProps) =>
  <Html
    name={props.name}
    wrapperClass={props.wrapperClass || "three-d-object-popup-wrapper"}
    center={props.center !== false}
    distanceFactor={props.distanceFactor}
    rotation={props.rotation}
    position={props.position}>
    <div
      className={[
        "three-d-object-popup",
        "grid",
        props.className,
        props.visible === false ? "hidden" : "visible",
      ].filter(Boolean).join(" ")}
      onPointerDown={stopThreeDPopupEvent}
      onContextMenu={stopThreeDPopupEvent}
      onWheel={stopThreeDPopupEvent}
      onClick={stopThreeDPopupEvent}>
      {(props.title !== undefined || props.onClose || props.headerActions) &&
        <div className={"object-popup-header row grid-exp-2"}>
          <h3 className={"row"}>{props.title}</h3>
          <div className={"object-popup-button-cluster row no-gap"}>
            {props.headerActions}
            {props.onClose &&
              <button
                type={"button"}
                className={"fa fa-times fb-icon-button invert"}
                title={t("close")}
                disabled={props.closeDisabled}
                onClick={props.onClose} />}
          </div>
        </div>}
      <div className={[
        "object-popup-content",
        "grid",
        props.contentClassName,
      ].filter(Boolean).join(" ")}>
        {props.children}
      </div>
    </div>
  </Html>;
