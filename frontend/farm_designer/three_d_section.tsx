import React from "react";
import { Actions } from "../constants";
import { t } from "../i18next_wrapper";
import { BlurableInput, ToggleButton } from "../ui";
import { BotPosition } from "../devices/interfaces";
import { AxisNumberProperty } from "../farm_designer/map/interfaces";
import { DesignerState, ThreeDDesignerState } from "../farm_designer/interfaces";
import { BugsButton } from "../farm_designer/map/easter_eggs/bugs";

export const SECTION_STEP = 1;
export const SECTION_WIDTH_MIN = 1;

export const sectionCenterMax = (axisLength: number): number =>
  Math.max(0, Math.floor(axisLength / SECTION_STEP) * SECTION_STEP);

export const sectionWidthMax = (axisLength: number): number =>
  Math.max(SECTION_WIDTH_MIN, sectionCenterMax(axisLength * 2));

export const normalizeSectionValue = (
  value: number,
  min: number,
  max: number,
): number => {
  const rounded = Math.round(value / SECTION_STEP) * SECTION_STEP;
  return Math.max(min, Math.min(max, rounded));
};

export const manualSectionCenter = (
  designer: ThreeDDesignerState,
  gardenSize: AxisNumberProperty,
): number => {
  const axis = designer.threeDSectionAxis;
  const max = sectionCenterMax(gardenSize[axis]);
  const stored = designer.threeDSectionCenter[axis];
  return normalizeSectionValue(
    stored === undefined ? gardenSize[axis] / 2 : stored,
    0,
    max,
  );
};

export const effectiveSectionCenter = (
  designer: ThreeDDesignerState,
  gardenSize: AxisNumberProperty,
  botPosition: BotPosition | undefined,
): number => {
  const manual = manualSectionCenter(designer, gardenSize);
  if (!designer.threeDSectionFollowBot) { return manual; }
  const axis = designer.threeDSectionAxis;
  const position = botPosition?.[axis];
  return position === undefined
    ? manual
    : Math.max(0, Math.min(gardenSize[axis], position));
};

export const toggleSectionAxis = (
  designer: ThreeDDesignerState,
  gardenSize: AxisNumberProperty,
  dispatch: Function,
) => {
  const nextAxis = designer.threeDSectionAxis == "x" ? "y" : "x";
  dispatch({
    type: Actions.SET_3D_SECTION_AXIS,
    payload: nextAxis,
  });
  const nextWidth = normalizeSectionValue(
    designer.threeDSectionWidth,
    SECTION_WIDTH_MIN,
    sectionWidthMax(gardenSize[nextAxis]),
  );
  if (nextWidth != designer.threeDSectionWidth) {
    dispatch({
      type: Actions.SET_3D_SECTION_WIDTH,
      payload: nextWidth,
    });
  }
};

interface SectionValueControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange(value: number): void;
}

export const SectionValueControl = (props: SectionValueControlProps) => {
  const setValue = (value: number) =>
    props.onChange(normalizeSectionValue(value, props.min, props.max));
  return <div className={[
    "three-d-section-value info-box",
    props.disabled ? "disabled" : "",
  ].join(" ")}>
    <label>{t(props.label)}</label>
    <div className={"three-d-section-input"}>
      <BlurableInput
        type={"number"}
        value={props.value}
        disabled={props.disabled}
        onCommit={e => {
          const value = parseFloat(e.currentTarget.value);
          isFinite(value) && setValue(value);
        }} />
      <div className={"three-d-section-carets"}>
        <button
          type={"button"}
          title={t("increase {{label}}", { label: props.label })}
          disabled={props.disabled || props.value >= props.max}
          onClick={() => setValue(props.value + SECTION_STEP)}>
          <i className={"fa fa-caret-up"} />
        </button>
        <button
          type={"button"}
          title={t("decrease {{label}}", { label: props.label })}
          disabled={props.disabled || props.value <= props.min}
          onClick={() => setValue(props.value - SECTION_STEP)}>
          <i className={"fa fa-caret-down"} />
        </button>
      </div>
    </div>
    <input
      className={"three-d-section-slider"}
      type={"range"}
      aria-label={t("{{label}} slider", { label: props.label })}
      min={props.min}
      max={props.max}
      step={SECTION_STEP}
      value={props.value}
      disabled={props.disabled}
      onChange={e => setValue(parseFloat(e.currentTarget.value))} />
  </div>;
};

export interface ThreeDSectionSettingsProps {
  designer: DesignerState;
  dispatch: Function;
  gardenSize: AxisNumberProperty;
}

export const ThreeDSectionSettings = (
  props: ThreeDSectionSettingsProps,
) => {
  const { designer, dispatch, gardenSize } = props;
  const axis = designer.threeDSectionAxis;
  const center = manualSectionCenter(designer, gardenSize);
  const centerMax = sectionCenterMax(gardenSize[axis]);
  const widthMax = sectionWidthMax(gardenSize[axis]);
  return <div className={"three-d-section-settings"}>
    <div className={"three-d-section-toggles grid"}>
      <div className={"three-d-section-view row grid-exp-1"}>
        <label>{t("AXIS")}</label>
        <ToggleButton
          title={t("AXIS")}
          toggleValue={axis == "x"}
          customText={{ textTrue: "X", textFalse: "Y" }}
          toggleAction={() => toggleSectionAxis(
            designer,
            gardenSize,
            dispatch,
          )} />
      </div>
      <div className={"three-d-section-follow row grid-exp-1"}>
        <label>{t("FOLLOW BOT")}</label>
        <ToggleButton
          title={t("FOLLOW BOT")}
          toggleValue={designer.threeDSectionFollowBot}
          toggleAction={() => dispatch({
            type: Actions.SET_3D_SECTION_FOLLOW_BOT,
            payload: !designer.threeDSectionFollowBot,
          })} />
      </div>
      <div className={"three-d-section-clip-all row grid-exp-1"}>
        <label>{t("CLIP ALL")}</label>
        <ToggleButton
          title={t("CLIP ALL")}
          toggleValue={designer.threeDSectionClipAll}
          toggleAction={() => dispatch({
            type: Actions.SET_3D_SECTION_CLIP_ALL,
            payload: !designer.threeDSectionClipAll,
          })} />
      </div>
    </div>
    <SectionValueControl
      label={"WIDTH"}
      value={designer.threeDSectionWidth}
      min={SECTION_WIDTH_MIN}
      max={widthMax}
      onChange={value => dispatch({
        type: Actions.SET_3D_SECTION_WIDTH,
        payload: value,
      })} />
    <SectionValueControl
      label={"CENTER"}
      value={center}
      min={0}
      max={centerMax}
      disabled={designer.threeDSectionFollowBot}
      onChange={value => dispatch({
        type: Actions.SET_3D_SECTION_CENTER,
        payload: { ...designer.threeDSectionCenter, [axis]: value },
      })} />
    <BugsButton />
  </div>;
};
