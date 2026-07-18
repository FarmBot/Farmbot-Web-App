import React from "react";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import { DesignerState } from "./interfaces";

export interface ThreeDCameraControlsProps {
  designer: DesignerState;
  dispatch: Function;
}

export const effectiveThreeDPerspective = (
  designer: Pick<DesignerState, "threeDPerspective">,
) => designer.threeDPerspective ?? true;

export const ThreeDCameraControls = (props: ThreeDCameraControlsProps) => {
  const perspective = effectiveThreeDPerspective(
    props.designer,
  );
  const label = perspective
    ? t("PERSPECTIVE ON")
    : t("PERSPECTIVE OFF");
  return <div className={"three-d-camera-controls"}>
    <button
      type={"button"}
      className={[
        "three-d-perspective-control",
        perspective ? "active" : "",
      ].join(" ")}
      title={label}
      aria-pressed={perspective}
      onClick={() => props.dispatch({
        type: Actions.SET_3D_PERSPECTIVE,
        payload: !perspective,
      })}>
      {label}
    </button>
  </div>;
};
