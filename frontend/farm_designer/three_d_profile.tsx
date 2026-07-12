import React from "react";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import { BlurableInput, ToggleButton } from "../ui";
import { BotPosition } from "../devices/interfaces";
import { AxisNumberProperty } from "./map/interfaces";
import { DesignerState } from "./interfaces";

export const PROFILE_STEP = 1;
export const PROFILE_WIDTH_MIN = 50;
export const PROFILE_WIDTH_MAX = 1000;

export const profileCenterMax = (axisLength: number): number =>
  Math.max(0, Math.floor(axisLength / PROFILE_STEP) * PROFILE_STEP);

export const normalizeProfileValue = (
  value: number,
  min: number,
  max: number,
): number => {
  const rounded = Math.round(value / PROFILE_STEP) * PROFILE_STEP;
  return Math.max(min, Math.min(max, rounded));
};

export const manualProfileCenter = (
  designer: DesignerState,
  gardenSize: AxisNumberProperty,
): number => {
  const axis = designer.threeDProfileAxis;
  const max = profileCenterMax(gardenSize[axis]);
  const stored = designer.threeDProfileCenter[axis];
  return normalizeProfileValue(
    stored === undefined ? gardenSize[axis] / 2 : stored,
    0,
    max,
  );
};

export const effectiveProfileCenter = (
  designer: DesignerState,
  gardenSize: AxisNumberProperty,
  botPosition: BotPosition | undefined,
): number => {
  const manual = manualProfileCenter(designer, gardenSize);
  if (!designer.threeDProfileFollowBot) { return manual; }
  const axis = designer.threeDProfileAxis;
  const position = botPosition?.[axis];
  return position === undefined
    ? manual
    : Math.max(0, Math.min(gardenSize[axis], position));
};

interface ProfileValueControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange(value: number): void;
}

export const ProfileValueControl = (props: ProfileValueControlProps) => {
  const setValue = (value: number) =>
    props.onChange(normalizeProfileValue(value, props.min, props.max));
  return <div className={[
    "three-d-profile-value",
    props.disabled ? "disabled" : "",
  ].join(" ")}>
    <label>{t(props.label)}</label>
    <div className={"three-d-profile-input"}>
      <BlurableInput
        type={"number"}
        value={props.value}
        disabled={props.disabled}
        onCommit={e => {
          const value = parseFloat(e.currentTarget.value);
          isFinite(value) && setValue(value);
        }} />
      <div className={"three-d-profile-carets"}>
        <button
          type={"button"}
          title={t("increase {{label}}", { label: props.label })}
          disabled={props.disabled || props.value >= props.max}
          onClick={() => setValue(props.value + PROFILE_STEP)}>
          <i className={"fa fa-caret-up"} />
        </button>
        <button
          type={"button"}
          title={t("decrease {{label}}", { label: props.label })}
          disabled={props.disabled || props.value <= props.min}
          onClick={() => setValue(props.value - PROFILE_STEP)}>
          <i className={"fa fa-caret-down"} />
        </button>
      </div>
    </div>
    <input
      className={"three-d-profile-slider"}
      type={"range"}
      aria-label={t("{{label}} slider", { label: props.label })}
      min={props.min}
      max={props.max}
      step={PROFILE_STEP}
      value={props.value}
      disabled={props.disabled}
      onChange={e => setValue(parseFloat(e.currentTarget.value))} />
  </div>;
};

export interface ThreeDProfileHUDProps {
  designer: DesignerState;
  dispatch: Function;
  gardenSize: AxisNumberProperty;
}

export const ThreeDProfileHUD = (props: ThreeDProfileHUDProps) => {
  const { designer, dispatch, gardenSize } = props;
  const axis = designer.threeDProfileAxis;
  const center = manualProfileCenter(designer, gardenSize);
  const centerMax = profileCenterMax(gardenSize[axis]);
  return <div
    className={[
      "three-d-profile-indicator",
      designer.threeDProfileOpen ? "open" : "closed",
    ].join(" ")}
    aria-hidden={!designer.threeDProfileOpen}>
    <div className={"three-d-profile-toggles grid"}>
      <div className={"three-d-profile-view row grid-2-col"}>
        <label>{t("AXIS")}</label>
        <ToggleButton
          title={t("AXIS")}
          toggleValue={axis == "x"}
          customText={{ textTrue: "X", textFalse: "Y" }}
          toggleAction={() => dispatch({
            type: Actions.SET_3D_PROFILE_AXIS,
            payload: axis == "x" ? "y" : "x",
          })} />
      </div>
      <div className={"three-d-profile-follow row grid-2-col"}>
        <label>{t("FOLLOW")}</label>
        <ToggleButton
          title={t("FOLLOW")}
          toggleValue={designer.threeDProfileFollowBot}
          toggleAction={() => dispatch({
            type: Actions.SET_3D_PROFILE_FOLLOW_BOT,
            payload: !designer.threeDProfileFollowBot,
          })} />
      </div>
    </div>
    <ProfileValueControl
      label={"WIDTH"}
      value={designer.threeDProfileWidth}
      min={PROFILE_WIDTH_MIN}
      max={PROFILE_WIDTH_MAX}
      onChange={value => dispatch({
        type: Actions.SET_3D_PROFILE_WIDTH,
        payload: value,
      })} />
    <ProfileValueControl
      label={"CENTER"}
      value={center}
      min={0}
      max={centerMax}
      disabled={designer.threeDProfileFollowBot}
      onChange={value => dispatch({
        type: Actions.SET_3D_PROFILE_CENTER,
        payload: { ...designer.threeDProfileCenter, [axis]: value },
      })} />
  </div>;
};
