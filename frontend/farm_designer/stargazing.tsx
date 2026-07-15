import React from "react";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import {
  clampStargazingFov, STARGAZING_MAX_FOV, STARGAZING_MIN_FOV,
} from "./stargazing_constants";

const STARGAZING_KEYBOARD_FOV_STEP = 10;
const STARGAZING_WHEEL_FOV_STEP = 2;

export const setStargazingMode = (payload: boolean) => ({
  type: Actions.SET_3D_STARGAZING_MODE,
  payload,
});

export const setStargazingFov = (payload: number) => ({
  type: Actions.SET_3D_STARGAZING_FOV,
  payload,
});

export interface StargazingControlsProps {
  active: boolean;
  fov: number;
  dispatch: Function;
}

export const StargazingControls = (props: StargazingControlsProps) => {
  const { active, dispatch } = props;
  const fovRef = React.useRef(clampStargazingFov(props.fov));
  const fovPosition = 100 * (
    clampStargazingFov(props.fov) - STARGAZING_MIN_FOV
  ) / (STARGAZING_MAX_FOV - STARGAZING_MIN_FOV);
  const sliderStyle = {
    "--stargazing-fov-position": `${fovPosition}%`,
  } as React.CSSProperties;
  const exit = React.useCallback(() => {
    dispatch(setStargazingMode(false));
  }, [dispatch]);
  const updateFov = React.useCallback((fov: number) => {
    if (Number.isFinite(fov)) {
      const nextFov = clampStargazingFov(fov);
      fovRef.current = nextFov;
      dispatch(setStargazingFov(nextFov));
    }
  }, [dispatch]);
  const setFov = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateFov(Number(event.target.value));
    }, [updateFov]);

  React.useEffect(() => {
    document.body.classList.toggle("stargazing-active", active);
    return () => document.body.classList.remove("stargazing-active");
  }, [active]);

  React.useEffect(() => {
    fovRef.current = clampStargazingFov(props.fov);
  }, [props.fov]);

  React.useEffect(() => {
    if (!active) { return; }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == "Escape") {
        exit();
        return;
      }
      if (event.key != "ArrowUp" && event.key != "ArrowDown") { return; }
      const fovDelta = event.key == "ArrowUp"
        ? -STARGAZING_KEYBOARD_FOV_STEP
        : STARGAZING_KEYBOARD_FOV_STEP;
      event.preventDefault();
      updateFov(fovRef.current + fovDelta);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, exit, updateFov]);

  React.useEffect(() => {
    if (!active) { return; }
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY == 0) { return; }
      event.preventDefault();
      updateFov(
        fovRef.current
        + Math.sign(event.deltaY) * STARGAZING_WHEEL_FOV_STEP,
      );
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [active, updateFov]);

  return <div
    className={`stargazing-controls ${active ? "active" : ""}`}
    aria-hidden={!active}>
    <div className={"stargazing-exit-row"}>
      <span className={"stargazing-exit-key"}>{t("Esc")}</span>
      <button
        className={"stargazing-exit"}
        type={"button"}
        title={t("Exit stargazing")}
        aria-label={t("Exit stargazing")}
        tabIndex={active ? 0 : -1}
        onClick={exit}>
        <i className={"fa fa-times"} />
      </button>
    </div>
    <label className={"stargazing-zoom-control"}>
      <span className={"stargazing-zoom-slider"}>
        <input
          type={"range"}
          min={STARGAZING_MIN_FOV}
          max={STARGAZING_MAX_FOV}
          step={1}
          value={props.fov}
          style={sliderStyle}
          tabIndex={active ? 0 : -1}
          title={`${t("Field of view")}: ${props.fov}°`}
          onChange={setFov} />
      </span>
      <span className={"stargazing-zoom-label"}>{t("Zoom")}</span>
    </label>
  </div>;
};
