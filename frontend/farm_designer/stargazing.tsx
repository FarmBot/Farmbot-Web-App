import React from "react";
import { Actions } from "../constants";
import { findCropIcon, findCropMetadata } from "../crops/metadata";
import { t } from "../i18next_wrapper";
import { ThreeDViewMode } from "./interfaces";
import {
  clampStargazingFov, STARGAZING_MAX_FOV, STARGAZING_MIN_FOV,
} from "./stargazing_constants";
import {
  getStargazingMaxFov, getStargazingZoomUnlockedFraction,
  isSpaceflightUnlocked, SPACEFLIGHT_UNLOCK_COUNT,
  STARGAZING_TOTAL_CONSTELLATIONS, useFoundConstellations,
} from "./stargazing_progress";

const STARGAZING_KEYBOARD_FOV_STEP = 10;
const STARGAZING_WHEEL_FOV_STEP = 2;

const useUnlockPulse = (unlockLevel: number) => {
  const previousUnlockLevel = React.useRef(unlockLevel);
  const [pulse, setPulse] = React.useState(false);
  React.useEffect(() => {
    const newlyUnlocked = unlockLevel > previousUnlockLevel.current;
    previousUnlockLevel.current = unlockLevel;
    if (!newlyUnlocked) { return; }
    // Unlock changes intentionally begin a transient CSS animation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPulse(true);
  }, [unlockLevel]);
  const endPulse = React.useCallback(() => setPulse(false), []);
  return { pulse, endPulse };
};

export const setThreeDViewMode = (payload: ThreeDViewMode) => ({
  type: Actions.SET_3D_VIEW_MODE,
  payload,
});

export const setStargazingMode = (payload: boolean) =>
  setThreeDViewMode(payload ? "stargazing" : "normal");

export const setStargazingFov = (payload: number) => ({
  type: Actions.SET_3D_STARGAZING_FOV,
  payload,
});

export const setSpaceflightMode = (payload: boolean) =>
  setThreeDViewMode(payload ? "spaceflight" : "stargazing");

export interface StargazingControlsProps {
  mode: ThreeDViewMode;
  fov: number;
  dispatch: Function;
}

export interface StargazingHudProps {
  active: boolean;
  foundConstellations: string[];
}

interface StargazingHudLabel {
  name: string;
  left: number;
  top: number;
}

export const StargazingHud = (props: StargazingHudProps) => {
  // eslint-disable-next-line no-null/no-null
  const hudRef = React.useRef<HTMLDivElement>(null);
  const [hoverLabel, setHoverLabel] =
    React.useState<StargazingHudLabel | undefined>(undefined);
  const showHoverLabel = React.useCallback((
    name: string,
    icon: HTMLElement,
  ) => {
    const iconRect = icon.getBoundingClientRect();
    const hudRect = hudRef.current!.getBoundingClientRect();
    setHoverLabel({
      name,
      left: iconRect.left + iconRect.width / 2 - hudRect.left,
      top: iconRect.top - hudRect.top,
    });
  }, []);
  const hideHoverLabel = React.useCallback(
    () => setHoverLabel(undefined),
    [],
  );

  return <div
    ref={hudRef}
    className={`stargazing-hud grid ${props.active ? "active" : ""}`}
    aria-hidden={!props.active}>
    <div className={"stargazing-hud-counter"} aria-live={"polite"}>
      {t("Crop constellations found: {{found}} of {{total}}", {
        found: props.foundConstellations.length,
        total: STARGAZING_TOTAL_CONSTELLATIONS,
      })}
    </div>
    {props.foundConstellations.length > 0 &&
      <div className={"stargazing-hud-icons"}
        role={"list"}
        onScroll={hideHoverLabel}>
        {props.foundConstellations.map(cropSlug => {
          const crop = findCropMetadata(cropSlug);
          return <img
            className={"stargazing-hud-icon"}
            role={"listitem"}
            aria-label={crop.name}
            src={findCropIcon(cropSlug)}
            alt={""}
            tabIndex={props.active ? 0 : -1}
            onPointerEnter={event =>
              showHoverLabel(crop.name, event.currentTarget)}
            onPointerLeave={hideHoverLabel}
            onFocus={event =>
              showHoverLabel(crop.name, event.currentTarget)}
            onBlur={hideHoverLabel}
            key={cropSlug} />;
        })}
      </div>}
    <span
      className={[
        "stargazing-hud-icon-label",
        hoverLabel ? "visible" : "",
      ].join(" ")}
      style={{
        left: hoverLabel?.left,
        top: hoverLabel?.top,
      }}
      aria-hidden={true}>
      {hoverLabel?.name}
    </span>
    <div className={"stargazing-hud-bottom-overlay"} aria-hidden={true} />
  </div>;
};

export const StargazingControls = (props: StargazingControlsProps) => {
  const { dispatch, mode } = props;
  const active = mode != "normal";
  const spaceflight = mode == "spaceflight";
  const foundConstellations = useFoundConstellations();
  const foundCount = foundConstellations.length;
  const zoomUnlockedFraction =
    getStargazingZoomUnlockedFraction(foundCount);
  const maxFov = getStargazingMaxFov(foundCount);
  const spaceflightUnlocked = isSpaceflightUnlocked(foundCount);
  const zoomPulse = useUnlockPulse(zoomUnlockedFraction);
  const spaceflightPulse = useUnlockPulse(Number(spaceflightUnlocked));
  const displayedFov = Math.min(clampStargazingFov(props.fov), maxFov);
  const fovRef = React.useRef(displayedFov);
  const fovPosition = 100 * (
    displayedFov - STARGAZING_MIN_FOV
  ) / (STARGAZING_MAX_FOV - STARGAZING_MIN_FOV);
  const lockThumbClearance = zoomUnlockedFraction > 0 ? 0.7 : 0;
  const sliderStyle = {
    "--stargazing-fov-position": `${fovPosition}%`,
    "--stargazing-lock-start": zoomUnlockedFraction == 0
      ? "0"
      : `${1 + 14 * zoomUnlockedFraction + lockThumbClearance}em`,
  } as React.CSSProperties;
  const exit = React.useCallback(() => {
    dispatch(setStargazingMode(false));
  }, [dispatch]);
  const toggleSpaceflight = React.useCallback(() => {
    if (!spaceflight && !spaceflightUnlocked) { return; }
    dispatch(setSpaceflightMode(!spaceflight));
  }, [dispatch, spaceflight, spaceflightUnlocked]);
  const updateFov = React.useCallback((fov: number) => {
    if (Number.isFinite(fov)) {
      const nextFov = Math.min(clampStargazingFov(fov), maxFov);
      if (nextFov == fovRef.current) { return; }
      fovRef.current = nextFov;
      dispatch(setStargazingFov(nextFov));
    }
  }, [dispatch, maxFov]);
  const setFov = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateFov(Number(event.target.value));
    }, [updateFov]);

  React.useEffect(() => {
    document.body.classList.toggle("stargazing-active", active);
    return () => document.body.classList.remove("stargazing-active");
  }, [active]);

  React.useEffect(() => {
    fovRef.current = displayedFov;
    if (active && displayedFov != props.fov) {
      dispatch(setStargazingFov(displayedFov));
    }
  }, [active, dispatch, displayedFov, props.fov]);

  React.useEffect(() => {
    if (!active) { return; }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == "Escape") {
        exit();
        return;
      }
      if (spaceflight || zoomUnlockedFraction == 0
        || (event.key != "ArrowUp" && event.key != "ArrowDown")) {
        return;
      }
      const fovDelta = event.key == "ArrowUp"
        ? -STARGAZING_KEYBOARD_FOV_STEP
        : STARGAZING_KEYBOARD_FOV_STEP;
      event.preventDefault();
      updateFov(fovRef.current + fovDelta);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, exit, spaceflight, updateFov, zoomUnlockedFraction]);

  React.useEffect(() => {
    if (!active || spaceflight || zoomUnlockedFraction == 0) { return; }
    const handleWheel = (event: WheelEvent) => {
      const target = event.target;
      const scrollingHud = target instanceof Element
        && target.closest(".stargazing-hud-icons");
      if (event.deltaY == 0 || scrollingHud) { return; }
      event.preventDefault();
      updateFov(
        fovRef.current
        + Math.sign(event.deltaY) * STARGAZING_WHEEL_FOV_STEP,
      );
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [active, spaceflight, updateFov, zoomUnlockedFraction]);

  const spaceflightLocked = !spaceflight && !spaceflightUnlocked;
  const getSpaceflightLabel = () => {
    if (spaceflight) { return t("Return to stargazing"); }
    if (spaceflightLocked) {
      return t("Spaceflight locked: find {{remaining}} more constellations", {
        remaining: SPACEFLIGHT_UNLOCK_COUNT - foundCount,
      });
    }
    return t("Spaceflight");
  };
  const spaceflightLabel = getSpaceflightLabel();
  const getSpaceflightIcon = () => {
    if (spaceflight) { return "fa-globe"; }
    if (spaceflightLocked) { return "fa-lock"; }
    return "fa-rocket";
  };
  const spaceflightIcon = getSpaceflightIcon();

  return <>
    <div
      className={[
        "stargazing-controls",
        active ? "active" : "",
        spaceflight ? "spaceflight" : "",
      ].join(" ")}
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
      <button
        className={[
          "stargazing-spaceflight",
          spaceflightPulse.pulse ? "pulse" : "",
        ].join(" ")}
        type={"button"}
        title={spaceflightLabel}
        aria-label={spaceflightLabel}
        aria-pressed={spaceflight}
        disabled={spaceflightLocked}
        tabIndex={active ? 0 : -1}
        onAnimationEnd={spaceflightPulse.endPulse}
        onClick={toggleSpaceflight}>
        <i className={`fa ${spaceflightIcon}`} />
      </button>
      <label className={"stargazing-zoom-control"}>
        <span
          className={[
            "stargazing-zoom-slider",
            zoomPulse.pulse ? "pulse" : "",
          ].join(" ")}
          onAnimationEnd={zoomPulse.endPulse}>
          <input
            type={"range"}
            min={STARGAZING_MIN_FOV}
            max={STARGAZING_MAX_FOV}
            step={0.5}
            value={displayedFov}
            disabled={spaceflight || zoomUnlockedFraction == 0}
            style={sliderStyle}
            tabIndex={active ? 0 : -1}
            title={`${t("Field of view")}: ${displayedFov}°. ${
              t("Maximum unlocked field of view")}: ${maxFov}°`}
            onChange={setFov} />
          {zoomUnlockedFraction < 1 &&
          <span className={[
            "stargazing-zoom-lock",
            zoomUnlockedFraction == 0 ? "fully-locked" : "",
          ].join(" ")} aria-hidden={true}
          style={sliderStyle}>
            <i className={"fa fa-lock"} />
          </span>}
        </span>
        <span className={"stargazing-zoom-label"}>{t("Zoom")}</span>
      </label>
    </div>
    <StargazingHud
      active={active}
      foundConstellations={foundConstellations} />
  </>;
};
