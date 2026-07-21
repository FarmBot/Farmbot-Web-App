import React from "react";
import {
  Actions, CAMERA_FOLLOW_PERSPECTIVE_REQUIRED,
} from "../constants";
import { t } from "../i18next_wrapper";
import { DesignerState } from "./interfaces";
import { Panel, TAB_ICON } from "./panel_header";
import { info } from "../toast/toast";

export interface ThreeDCameraControlsProps {
  designer: DesignerState;
  dispatch: Function;
}

export const effectiveThreeDPerspective = (
  designer: Pick<DesignerState, "threeDPerspective">,
) => designer.threeDPerspective ?? true;

const perspectiveShortcutTargetIsEditable = (
  target: EventTarget | null,
) => target instanceof Element
  && !!target.closest("input, textarea, select, [contenteditable]");

const commandPaletteIsOpen = () =>
  !!document.querySelector(".command-palette-dialog[open]");

export const ThreeDCameraControls = (props: ThreeDCameraControlsProps) => {
  const dispatch = props.dispatch;
  const perspective = effectiveThreeDPerspective(
    props.designer,
  );
  const cameraFollow = props.designer.threeDCameraFollow;
  const label = perspective
    ? t("PERSPECTIVE ON")
    : t("PERSPECTIVE OFF");
  const perspectiveChangeAllowed =
    props.designer.threeDViewMode == "normal" && !cameraFollow;
  React.useEffect(() => {
    if (!perspectiveChangeAllowed) { return; }
    const togglePerspectiveOnP = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() != "p"
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
        || event.repeat
        || perspectiveShortcutTargetIsEditable(event.target)
        || commandPaletteIsOpen()) {
        return;
      }
      event.preventDefault();
      dispatch({
        type: Actions.SET_3D_PERSPECTIVE,
        payload: !perspective,
      });
    };
    window.addEventListener("keydown", togglePerspectiveOnP);
    return () => window.removeEventListener("keydown", togglePerspectiveOnP);
  }, [dispatch, perspective, perspectiveChangeAllowed]);
  return <div className={"three-d-camera-controls"}>
    <button
      type={"button"}
      className={[
        "three-d-camera-follow-control",
        cameraFollow ? "active" : "",
      ].join(" ")}
      title={cameraFollow
        ? t("STOP FOLLOWING CAMERA VIEW")
        : t("FOLLOW CAMERA VIEW")}
      aria-label={cameraFollow
        ? t("STOP FOLLOWING CAMERA VIEW")
        : t("FOLLOW CAMERA VIEW")}
      aria-pressed={cameraFollow}
      onClick={() => props.dispatch({
        type: Actions.SET_3D_CAMERA_FOLLOW,
        payload: !cameraFollow,
      })}>
      {cameraFollow
        ? <i className={"fa fa-times"} />
        : <img src={TAB_ICON[Panel.Photos]} alt={""} />}
    </button>
    <button
      type={"button"}
      className={[
        "three-d-perspective-control",
        perspective ? "active" : "",
      ].join(" ")}
      title={label}
      aria-pressed={perspective}
      aria-keyshortcuts={"p"}
      onClick={() => cameraFollow
        ? info(t(CAMERA_FOLLOW_PERSPECTIVE_REQUIRED))
        : props.dispatch({
          type: Actions.SET_3D_PERSPECTIVE,
          payload: !perspective,
        })}>
      {label}
    </button>
  </div>;
};
