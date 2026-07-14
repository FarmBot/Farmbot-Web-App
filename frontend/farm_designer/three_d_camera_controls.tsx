import React from "react";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import { DesignerState } from "./interfaces";

export interface ThreeDCameraControlsProps {
  designer: DesignerState;
  dispatch: Function;
}

export const effectiveThreeDPerspective = (
  designer: DesignerState,
) => designer.threeDPerspective ?? true;

export const ThreeDCameraControls = (props: ThreeDCameraControlsProps) => {
  const perspective = effectiveThreeDPerspective(
    props.designer,
  );
  return <div className={"three-d-camera-controls"}>
    <button
      type={"button"}
      className={[
        "three-d-perspective-control",
        perspective ? "active" : "",
      ].join(" ")}
      title={t("PERSPECTIVE")}
      aria-pressed={perspective}
      onClick={() => props.dispatch({
        type: Actions.SET_3D_PERSPECTIVE,
        payload: !perspective,
      })}>
      {t("PERSPECTIVE")}
    </button>
  </div>;
};
