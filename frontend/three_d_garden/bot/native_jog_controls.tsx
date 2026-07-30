import React from "react";
import { McuParams, Xyz } from "farmbot";
import { isEqual, isNumber } from "lodash";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Object3D, Vector3 } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { Config, PositionConfig } from "../config";
import { Group } from "../components";
import {
  axisConstraint, ControlArrow, ControlDragEvent, ControlHandle, ControlLabel,
  ControlPoint, ControlSphere, noControlRaycast, stopThreeDPopupEvent,
  ThreeDPopup,
} from "../controls";
import {
  BotPositionSnapshotStore, useBotPositionSnapshot,
} from "./position_spring";
import {
  changeStepSize, findAxisLength, findHome, moveAbsolute, moveRelative,
  moveToHome, setHome,
} from "../../devices/actions";
import { t } from "../../i18next_wrapper";
import { ToggleButton } from "../../ui";
import { BooleanSetting } from "../../session_keys";
import { toggleWebAppBool } from "../../config_storage/actions";
import { DeviceSetting } from "../../constants";
import { BotLocationData, BotPosition } from "../../devices/interfaces";
import {
  disabledAxisMap,
} from "../../settings/hardware_settings/axis_tracking_status";
import { sourceFwConfigValue } from
  "../../settings/source_config_value";
import { setAxisLength } from "../../controls/move/bot_position_rows";
import { setMovementState } from
  "../../connectivity/log_handlers";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { Path } from "../../internal_urls";
import { getBotVersion } from "./bot_versions";
import { calculateAxialLengths } from
  "../../controls/move/direction_axes_props";
import { MovementState } from "../../interfaces";
import { movementPercentRemaining } from "../../farm_designer/move_to";
import { Highlight } from "../elements";
import { SECTION_CONTROL_ACTIVE_COLOR } from "../section_controls";
import {
  NativeJogGhost, NativeJogUtmShadow,
} from "./native_jog_ghost";
import { get3DPositionFunc, zZero } from "../helpers";

export const NATIVE_JOG_ARROW_LENGTH = 100;
export const NATIVE_JOG_Y_ARROW_LENGTH = NATIVE_JOG_ARROW_LENGTH * 1.5;
const NATIVE_JOG_ARROW_WIDTH = 12;
const NATIVE_JOG_MIN_RENDERED_ARROW_LENGTH = 1;
const NATIVE_JOG_SPHERE_RADIUS = 20;
const NATIVE_JOG_DRAG_LABEL_OFFSET = 100;
export const NATIVE_JOG_DRAG_SNAP_THRESHOLD = 5;
const NATIVE_JOG_COLOR = "gray";
const NATIVE_JOG_HOVER_COLOR = "lightgray";
const NATIVE_JOG_BED_OFFSET = 100;
const NATIVE_JOG_BEAM_Z_OFFSET = 200;
const NATIVE_JOG_POPUP_Z_OFFSET = 50;
export const NATIVE_JOG_SHADOW_Z_OFFSET = 10;
const NATIVE_JOG_CROSSHAIR_Z_OFFSET = 6;
const NATIVE_JOG_RENDER_OPTIONS = {
  depthTest: true,
  depthWrite: true,
  renderOrder: 0,
} as const;
export const NATIVE_JOG_STEP_CHOICES = [1, 10, 100, 1000];

export type NativeJogDirection = -1 | 1;

export interface NativeJogSelection {
  name: string;
}

export interface NativeJogEncoderVisibility {
  raw: boolean;
  scaled: boolean;
}

export type NativeJogEncoderData = Pick<BotLocationData,
  "load" | "raw_encoders" | "scaled_encoders">;

export interface NativeJogAxisActionsContext {
  arduinoBusy: boolean;
  botPosition: BotPosition;
  botOnline: boolean;
  dispatch: Function;
  firmwareSettings: McuParams;
  locked: boolean;
  movementState?: MovementState;
  stepSize?: number;
}

type NativeJogConfig = Pick<Config,
  "beamLength" | "bedLengthOuter" | "bedWidthOuter" | "bedXOffset" |
  "bedYOffset" | "botSizeX" | "botSizeY" | "botSizeZ" |
  "columnLength" | "kitVersion" | "mirrorX" | "mirrorY" |
  "negativeZ" | "safeHeight" | "controlsOverlay" | "zGantryOffset">;

export const getNativeJogControlPositions = (
  config: NativeJogConfig,
) => {
  const version = getBotVersion(config.kitVersion);
  const beamControlX = -39;
  const beamControlZ = config.columnLength + NATIVE_JOG_BEAM_Z_OFFSET;
  const crossSlidePosition: ControlPoint = [
    -12.5,
    version.number == "v1.9" ? 45 : 5,
    config.columnLength + (version.number == "v1.9" ? 97 : 105),
  ];
  return {
    x: [
      [0, -config.bedYOffset - NATIVE_JOG_BED_OFFSET, 0],
      [
        0,
        config.bedWidthOuter - config.bedYOffset + NATIVE_JOG_BED_OFFSET,
        0,
      ],
    ] as [ControlPoint, ControlPoint],
    y: [
      beamControlX - crossSlidePosition[0],
      -crossSlidePosition[1],
      beamControlZ - crossSlidePosition[2],
    ] as ControlPoint,
    z: [60, 0, 220] as ControlPoint,
  };
};

const axisPoint = (
  axis: Xyz,
  distance: number,
): ControlPoint =>
  [
    axis == "x" ? distance : 0,
    axis == "y" ? distance : 0,
    axis == "z" ? distance : 0,
  ];

const controlPointSum = (
  first: ControlPoint,
  second: ControlPoint,
): ControlPoint =>
  [
    first[0] + second[0],
    first[1] + second[1],
    first[2] + second[2],
  ];

export const getNativeJogRenderDirection = (
  config: NativeJogConfig,
  axis: Xyz,
  deviceDirection: NativeJogDirection,
): NativeJogDirection => {
  const reversed = {
    x: config.mirrorX,
    y: config.mirrorY,
    z: !config.negativeZ,
  }[axis];
  return (reversed ? -deviceDirection : deviceDirection) as
    NativeJogDirection;
};

export const getNativeJogDragDistance = (
  config: NativeJogConfig,
  axis: Xyz,
  delta: ControlPoint,
) => {
  const sceneDistance = delta[{ x: 0, y: 1, z: 2 }[axis]];
  const distance = Math.round(sceneDistance * getNativeJogRenderDirection(
    config,
    axis,
    1,
  ));
  return Math.abs(distance) <= NATIVE_JOG_DRAG_SNAP_THRESHOLD ? 0 : distance;
};

export const getNativeJogDragPreviewPositions = (
  config: NativeJogConfig,
  axis: Xyz,
  deviceDistance: number,
) => {
  const renderDistance = deviceDistance * getNativeJogRenderDirection(
    config,
    axis,
    1,
  );
  const control = axisPoint(axis, renderDistance);
  const labelOffset: ControlPoint = axis == "z"
    ? [NATIVE_JOG_DRAG_LABEL_OFFSET, 0, 0]
    : [0, 0, NATIVE_JOG_DRAG_LABEL_OFFSET];
  return { control, label: controlPointSum(control, labelOffset) };
};

export const nativeJogMovementAvailable = (
  context: NativeJogAxisActionsContext | undefined,
) =>
  !!context && context.botOnline &&
  !context.arduinoBusy && !context.locked;

export const getNativeJogAbsoluteDestination = (
  position: BotPosition,
  axis: Xyz,
  target: number,
): PositionConfig | undefined => {
  const destination = { ...position, [axis]: target };
  return Number.isFinite(destination.x) &&
    Number.isFinite(destination.y) &&
    Number.isFinite(destination.z)
    ? destination as PositionConfig
    : undefined;
};

export const getNativeJogDevicePosition = (
  config: NativeJogConfig,
  position: PositionConfig,
): PositionConfig => ({
  x: config.mirrorX ? config.botSizeX - position.x : position.x,
  y: config.mirrorY ? config.botSizeY - position.y : position.y,
  z: position.z,
});

export const getNativeJogStepSize = (stepSize: number | undefined) =>
  isNumber(stepSize) && Number.isFinite(stepSize) && stepSize > 0
    ? stepSize
    : 100;

const nativeJogAxisLength = (
  context: NativeJogAxisActionsContext,
  axis: Xyz,
) => calculateAxialLengths({
  firmwareSettings: context.firmwareSettings,
})[axis];

const nativeJogAxisNegativeOnly = (
  context: NativeJogAxisActionsContext,
  axis: Xyz,
) => ({
  x: !!context.firmwareSettings.movement_home_up_x,
  y: !!context.firmwareSettings.movement_home_up_y,
  z: !!context.firmwareSettings.movement_home_up_z,
})[axis];

export const nativeJogMaxPosition = (
  context: NativeJogAxisActionsContext,
  axis: Xyz,
  configuredAxisLength: number,
) => {
  return nativeJogAxisNegativeOnly(context, axis)
    ? -configuredAxisLength
    : configuredAxisLength;
};

const configuredNativeJogAxisLength = (
  config: NativeJogConfig,
  axis: Xyz,
) => ({
  x: config.botSizeX,
  y: config.botSizeY,
  z: config.botSizeZ,
})[axis];

const nativeJogAxisBounds = (
  config: NativeJogConfig,
  context: NativeJogAxisActionsContext,
  axis: Xyz,
) => {
  const firmwareLength = nativeJogAxisLength(context, axis);
  const configuredLength = configuredNativeJogAxisLength(config, axis);
  const length = firmwareLength > 0 ? firmwareLength : configuredLength;
  return nativeJogAxisNegativeOnly(context, axis)
    ? { minimum: -length, maximum: 0 }
    : { minimum: 0, maximum: length };
};

const nativeJogDefaultArrowLength = (axis: Xyz) =>
  axis == "y" ? NATIVE_JOG_Y_ARROW_LENGTH : NATIVE_JOG_ARROW_LENGTH;

export const getNativeJogArrowLength = (
  config: NativeJogConfig,
  context: NativeJogAxisActionsContext | undefined,
  axis: Xyz,
  position: number,
  direction: NativeJogDirection,
) => {
  const defaultLength = nativeJogDefaultArrowLength(axis);
  if (!context || !Number.isFinite(position)) { return defaultLength; }
  const { minimum, maximum } = nativeJogAxisBounds(
    config,
    context,
    axis,
  );
  const availableDistance = direction < 0
    ? position - minimum
    : maximum - position;
  return Math.max(0, Math.min(defaultLength, availableDistance));
};

const nativeJogPositionAtBound = (
  config: NativeJogConfig,
  context: NativeJogAxisActionsContext | undefined,
  axis: Xyz,
  position: number,
) =>
  getNativeJogArrowLength(config, context, axis, position, -1) == 0 ||
  getNativeJogArrowLength(config, context, axis, position, 1) == 0;

export interface NativeJogDragResult {
  boundDirection?: NativeJogDirection;
  distance: number;
}

export const clampNativeJogDragDistance = (
  config: NativeJogConfig,
  context: NativeJogAxisActionsContext,
  axis: Xyz,
  requestedDistance: number,
): NativeJogDragResult => {
  const position = context.botPosition[axis];
  if (!isNumber(position)) {
    return { distance: requestedDistance };
  }
  const { minimum, maximum } = nativeJogAxisBounds(
    config,
    context,
    axis,
  );
  const negativeDistance = minimum - position;
  const positiveDistance = maximum - position;
  const distance = Math.max(
    negativeDistance,
    Math.min(positiveDistance, requestedDistance),
  );
  let direction: NativeJogDirection | undefined;
  if (requestedDistance < 0) {
    direction = -1;
  } else if (requestedDistance > 0) {
    direction = 1;
  }
  const boundDirection = direction &&
    distance == (direction < 0 ? negativeDistance : positiveDistance)
    ? direction
    : undefined;
  return { distance, boundDirection };
};

export const nativeJogDirectionDisabled = (
  context: NativeJogAxisActionsContext,
  axis: Xyz,
  direction: NativeJogDirection,
  resolvedPosition = context.botPosition[axis],
  configuredAxisLength = 0,
) => {
  if (!isNumber(resolvedPosition)) { return false; }
  const negativeOnly = nativeJogAxisNegativeOnly(context, axis);
  const movingTowardHome = negativeOnly ? direction > 0 : direction < 0;
  const movingTowardMax = negativeOnly ? direction < 0 : direction > 0;
  const atHome = resolvedPosition == 0;
  const firmwareAxisLength = nativeJogAxisLength(context, axis);
  const axisLength = firmwareAxisLength > 0
    ? firmwareAxisLength
    : configuredAxisLength;
  const atMax = axisLength > 0 &&
    Math.abs(resolvedPosition) >= axisLength;
  return atHome && movingTowardHome || atMax && movingTowardMax;
};

const relativeMove = (
  axis: Xyz,
  distance: number,
  onError?: () => void,
) => {
  const move = {
    x: axis == "x" ? distance : 0,
    y: axis == "y" ? distance : 0,
    z: axis == "z" ? distance : 0,
  };
  return onError
    ? moveRelative(move, onError)
    : moveRelative(move);
};

const encoderValue = (value: number | undefined) =>
  isNumber(value) ? value.toLocaleString() : "---";

interface NativeJogMoreOptionsPopupProps {
  axis: Xyz;
  context: NativeJogAxisActionsContext;
  encoderVisibility?: NativeJogEncoderVisibility;
  navigate?(path: string): void;
}

export const NativeJogMoreOptions = (
  props: NativeJogMoreOptionsPopupProps,
) => {
  const movementAvailable = nativeJogMovementAvailable(props.context);
  const hardwareDisabled =
    disabledAxisMap(props.context.firmwareSettings)[props.axis];
  const toggle = (setting: "raw_encoders" | "scaled_encoders") =>
    props.context.dispatch(toggleWebAppBool(BooleanSetting[setting]));
  const sourceFwConfig = sourceFwConfigValue(
    undefined,
    props.context.firmwareSettings,
  );
  const openSettings = () => {
    props.context.dispatch(setPanelOpen(true));
    props.navigate?.(Path.settings("axes"));
  };
  return <div className={"native-jog-more-options"}>
    <div className={"native-jog-encoder-settings"}>
      <fieldset>
        <label>{t(DeviceSetting.displayScaledEncoderPosition)}</label>
        <ToggleButton
          title={t("toggle scaled encoder display")}
          toggleAction={() => toggle("scaled_encoders")}
          toggleValue={!!props.encoderVisibility?.scaled} />
      </fieldset>
      <fieldset>
        <label>{t(DeviceSetting.displayRawEncoderPosition)}</label>
        <ToggleButton
          title={t("toggle raw encoder display")}
          toggleAction={() => toggle("raw_encoders")}
          toggleValue={!!props.encoderVisibility?.raw} />
      </fieldset>
    </div>
    <div className={"native-jog-more-option-actions"}>
      <button
        type={"button"}
        className={"fb-button yellow"}
        disabled={!movementAvailable}
        onClick={() => void setHome(props.axis)}>
        {t("SET HOME")}
      </button>
      <button
        type={"button"}
        className={"fb-button yellow"}
        disabled={!movementAvailable || hardwareDisabled}
        onClick={() => void findAxisLength(props.axis)}>
        {t("FIND LENGTH")}
      </button>
      <button
        type={"button"}
        className={"fb-button yellow"}
        disabled={!movementAvailable}
        onClick={setAxisLength({
          axis: props.axis,
          dispatch: props.context.dispatch,
          botPosition: props.context.botPosition,
          sourceFwConfig,
        })}>
        {t("SET LENGTH")}
      </button>
    </div>
    <a href={Path.settings("axes")} onClick={event => {
      event.preventDefault();
      openSettings();
    }}>
      <i className={"fa fa-external-link"} />
      {t("Settings")}
    </a>
  </div>;
};

type NativeJogAction =
  "find-home" | "go" | "home" | "max" | "negative" | "positive" |
  "safe";

interface NativeJogProgressProps {
  active: boolean;
  axis: Xyz;
  distance: number;
  progress: number | undefined;
}

export const nativeJogProgressStyle = (
  axis: Xyz,
  distance: number,
  progress: number,
): React.CSSProperties => axis == "z"
  ? {
    height: `${progress}%`,
    bottom: distance >= 0 ? 0 : undefined,
    top: distance < 0 ? 0 : undefined,
    left: 0,
  }
  : {
    width: `${progress}%`,
    left: distance >= 0 ? 0 : undefined,
    right: distance < 0 ? 0 : undefined,
    top: 0,
  };

export const nativeJogActionProgressDistance = (
  axis: Xyz,
  action: NativeJogAction,
  movementDistance: number,
) => {
  if (action == "home" || action == "find-home") {
    return axis == "z" ? 1 : -1;
  }
  if (action == "max") { return 1; }
  return movementDistance;
};

const NativeJogProgress = (props: NativeJogProgressProps) =>
  props.active && isNumber(props.progress)
    ? <div className={"movement-progress"}
      style={nativeJogProgressStyle(
        props.axis,
        props.distance,
        props.progress,
      )} />
    : undefined;

interface NativeJogActionButtonsProps {
  activeAction: NativeJogAction | undefined;
  absoluteMovementAvailable: boolean;
  axis: Xyz;
  axisPosition: number;
  config: NativeJogConfig;
  context: NativeJogAxisActionsContext;
  movementAvailable: boolean;
  previewMovement(distance: number | undefined): void;
  progress: number | undefined;
  runMovement(
    action: NativeJogAction,
    distance: number,
    command: (onError: () => void) => unknown,
  ): void;
  stepSize: number;
}

// eslint-disable-next-line complexity
const NativeJogActionButtons = (props: NativeJogActionButtonsProps) => {
  const axisLabel = props.axis.toUpperCase();
  const negativeArrow = props.axis == "z" ? "down" : "left";
  const positiveArrow = props.axis == "z" ? "up" : "right";
  const hardwareDisabled =
    disabledAxisMap(props.context.firmwareSettings)[props.axis];
  const current = props.context.botPosition;
  const axisPosition = props.axisPosition;
  const atHome = axisPosition == 0;
  const configuredAxisLength =
    configuredNativeJogAxisLength(props.config, props.axis);
  const maxPosition = nativeJogMaxPosition(
    props.context,
    props.axis,
    configuredAxisLength,
  );
  const atMax = isNumber(axisPosition) && axisPosition == maxPosition;
  const safePosition = props.config.safeHeight;
  const atSafe = isNumber(axisPosition) && axisPosition == safePosition;
  const homeDisabled = !props.movementAvailable || atHome;
  const findHomeDisabled = !props.movementAvailable || hardwareDisabled;
  const negativeDisabled = !props.movementAvailable ||
    nativeJogDirectionDisabled(
      props.context,
      props.axis,
      -1,
      axisPosition,
      configuredAxisLength,
    );
  const positiveDisabled = !props.movementAvailable ||
    nativeJogDirectionDisabled(
      props.context,
      props.axis,
      1,
      axisPosition,
      configuredAxisLength,
    );
  const maxDisabled = !props.absoluteMovementAvailable ||
    atMax || maxPosition == 0;
  const safeDisabled = !props.absoluteMovementAvailable || atSafe;
  const moveHome = () => {
    if (!props.movementAvailable) { return; }
    props.runMovement("home", isNumber(axisPosition) ? -axisPosition : 0,
      onError => moveToHome(props.axis, onError));
  };
  const findAxisHome = () => {
    if (!props.movementAvailable || hardwareDisabled) { return; }
    props.runMovement("find-home",
      isNumber(axisPosition) ? -axisPosition : 0,
      onError => findHome(props.axis, onError));
  };
  const jog = (direction: NativeJogDirection) => {
    if (!props.movementAvailable) { return; }
    const distance = direction * props.stepSize;
    props.runMovement(direction < 0 ? "negative" : "positive", distance,
      onError => relativeMove(
        props.axis,
        direction * props.stepSize,
        onError,
      ));
  };
  const moveToAxisPosition = (
    action: "max" | "safe",
    targetPosition: number,
  ) => {
    const destination = getNativeJogAbsoluteDestination(
      current,
      props.axis,
      targetPosition,
    );
    if (!destination) { return; }
    props.runMovement(action, targetPosition - axisPosition,
      onError => moveAbsolute(destination, onError));
  };
  const progress = (
    action: NativeJogAction,
    distance: number,
  ) =>
    <NativeJogProgress
      active={props.activeAction == action}
      axis={props.axis}
      distance={nativeJogActionProgressDistance(
        props.axis,
        action,
        distance,
      )}
      progress={props.progress} />;
  const previewEvents = (distance: number, disabled: boolean) => ({
    onPointerEnter: () => props.previewMovement(
      disabled ? undefined : distance,
    ),
    onPointerLeave: () => props.previewMovement(undefined),
    onFocus: () => props.previewMovement(disabled ? undefined : distance),
    onBlur: () => props.previewMovement(undefined),
  });
  let safeArrow = "minus";
  if (safePosition > axisPosition) {
    safeArrow = "up";
  } else if (safePosition < axisPosition) {
    safeArrow = "down";
  }
  const safeIcon = safeArrow == "minus"
    ? "fa-minus"
    : `fa-arrow-${safeArrow}`;
  return <div className={"native-jog-popup-actions"}>
    <button
      type={"button"}
      className={[
        "home-button arrow-button fb-button gray",
        "native-jog-home-button",
        "native-jog-progress-button",
      ].join(" ")}
      disabled={homeDisabled}
      aria-label={t("Move Home {{axis}}", { axis: axisLabel })}
      title={t("Move Home {{axis}}", { axis: axisLabel })}
      onClick={moveHome}
      {...previewEvents(-axisPosition, homeDisabled)}>
      <div className={"fa-stack"}>
        <i className={"fa fa-home fa-stack-2x"} />
        <i className={`fa fa-arrow-${props.axis == "z" ? "up" : "left"} fa-stack-1x`} />
      </div>
      {progress("home", -axisPosition)}
    </button>
    <button
      type={"button"}
      className={[
        "home-button arrow-button fb-button gray",
        "native-jog-find-home-button",
        "native-jog-progress-button",
      ].join(" ")}
      disabled={findHomeDisabled}
      aria-label={t("Find Home {{axis}}", { axis: axisLabel })}
      title={t("Find Home {{axis}}", { axis: axisLabel })}
      onClick={findAxisHome}
      {...previewEvents(-axisPosition, findHomeDisabled)}>
      <div className={"fa-stack"}>
        <i className={"fa fa-home fa-stack-2x"} />
        <i className={"fa fa-search fa-stack-1x"} />
      </div>
      {progress("find-home", -axisPosition)}
    </button>
    <button
      type={"button"}
      className={[
        "fb-button gray arrow-button fa fa-2x",
        "native-jog-negative-button",
        "native-jog-progress-button",
        `fa-arrow-${negativeArrow}`,
      ].join(" ")}
      disabled={negativeDisabled}
      aria-label={t("Jog -{{axis}}", { axis: axisLabel })}
      title={t("Jog -{{axis}}", { axis: axisLabel })}
      onClick={() => jog(-1)}
      {...previewEvents(-props.stepSize, negativeDisabled)}>
      <p>{`-${axisLabel}`}</p>
      {progress("negative", -props.stepSize)}
    </button>
    <button
      type={"button"}
      className={[
        "fb-button gray arrow-button fa fa-2x",
        "native-jog-positive-button",
        "native-jog-progress-button",
        `fa-arrow-${positiveArrow}`,
      ].join(" ")}
      disabled={positiveDisabled}
      aria-label={t("Jog +{{axis}}", { axis: axisLabel })}
      title={t("Jog +{{axis}}", { axis: axisLabel })}
      onClick={() => jog(1)}
      {...previewEvents(props.stepSize, positiveDisabled)}>
      <p>{`+${axisLabel}`}</p>
      {progress("positive", props.stepSize)}
    </button>
    {props.axis != "z"
      ? <button
        type={"button"}
        className={[
          "fb-button gray arrow-button fa fa-2x fa-arrow-right",
          "native-jog-limit-button",
          "native-jog-progress-button",
        ].join(" ")}
        disabled={maxDisabled}
        aria-label={t("Move to Max {{axis}}", { axis: axisLabel })}
        title={t("Move to Max {{axis}}", { axis: axisLabel })}
        onClick={() => moveToAxisPosition("max", maxPosition)}
        {...previewEvents(maxPosition - axisPosition, maxDisabled)}>
        <p>{t("Max")}</p>
        {progress("max", maxPosition - axisPosition)}
      </button>
      : <button
        type={"button"}
        className={[
          "fb-button gray arrow-button fa fa-2x",
          "native-jog-limit-button",
          safeIcon,
          "native-jog-progress-button",
        ].join(" ")}
        disabled={safeDisabled}
        aria-label={t("Move to Safe Height")}
        title={t("Move to Safe Height")}
        onClick={() => moveToAxisPosition("safe", safePosition)}
        {...previewEvents(safePosition - axisPosition, safeDisabled)}>
        <p>{t("Safe")}</p>
        {progress("safe", safePosition - axisPosition)}
      </button>}
  </div>;
};

interface NativeJogStepSizeSelectorProps {
  context: NativeJogAxisActionsContext;
  stepSize: number;
}

export const NativeJogStepSizeSelector = (
  props: NativeJogStepSizeSelectorProps,
) => {
  const select = (stepSize: number) =>
    props.context.dispatch(changeStepSize(stepSize));
  const disabled = !props.context.botOnline || props.context.locked;
  return <div className={"move-amount-wrapper native-jog-step-selector"}>
    {NATIVE_JOG_STEP_CHOICES.map((choice, index) =>
      <button
        key={choice}
        type={"button"}
        disabled={disabled}
        title={t("{{ amount }}mm", { amount: choice })}
        className={[
          "move-amount no-radius fb-button",
          index == 0 ? "leftmost" : "",
          index == NATIVE_JOG_STEP_CHOICES.length - 1 ? "rightmost" : "",
          props.stepSize == choice
            ? "move-amount-selected"
            : "",
        ].filter(Boolean).join(" ")}
        onClick={() => select(choice)}>
        {choice}
      </button>)}
  </div>;
};

interface NativeJogEncoderReadingsProps {
  axis: Xyz;
  encoderData: NativeJogEncoderData | undefined;
  visibility: NativeJogEncoderVisibility | undefined;
}

const NativeJogEncoderReadings = (
  props: NativeJogEncoderReadingsProps,
) => {
  if (!props.visibility?.scaled && !props.visibility?.raw) {
    return undefined;
  }
  const scaledEncoder = props.encoderData?.scaled_encoders[props.axis];
  const rawEncoder = props.encoderData?.raw_encoders[props.axis];
  return <div className={"native-jog-encoder-readings"}>
    {props.visibility.scaled &&
      <div className={"native-jog-encoder-reading"}>
        <label>{t(DeviceSetting.displayScaledEncoderPosition)}</label>
        <output>{encoderValue(scaledEncoder)}</output>
      </div>}
    {props.visibility.raw &&
      <div className={"native-jog-encoder-reading"}>
        <label>{t(DeviceSetting.displayRawEncoderPosition)}</label>
        <output>{encoderValue(rawEncoder)}</output>
      </div>}
  </div>;
};

interface NativeJogPopupProps {
  axis: Xyz;
  config: NativeJogConfig;
  context: NativeJogAxisActionsContext;
  encoderData?: NativeJogEncoderData;
  encoderVisibility?: NativeJogEncoderVisibility;
  navigate?(path: string): void;
  onClose(): void;
  onPreview(distance: number | undefined, pending?: boolean): void;
  positionStore: BotPositionSnapshotStore;
}

// eslint-disable-next-line complexity
export const NativeJogPopup = (props: NativeJogPopupProps) => {
  const onPreview = props.onPreview;
  const renderedPosition = useBotPositionSnapshot(props.positionStore);
  const renderedDevicePosition = getNativeJogDevicePosition(
    props.config,
    renderedPosition,
  );
  const axisPosition = props.context.botPosition[props.axis];
  const currentAxisPosition = isNumber(axisPosition)
    ? axisPosition
    : renderedDevicePosition[props.axis];
  const [target, setTarget] = React.useState("");
  const [targetFocused, setTargetFocused] = React.useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = React.useState(false);
  const [activeMovement, setActiveMovement] = React.useState<{
    action: NativeJogAction;
    movementState: MovementState;
  }>();
  const wasBusy = React.useRef(props.context.arduinoBusy);
  React.useEffect(() => {
    if (wasBusy.current && !props.context.arduinoBusy) {
      setActiveMovement(undefined);
    }
    wasBusy.current = props.context.arduinoBusy;
  }, [props.context.arduinoBusy]);
  const title = <>
    {props.axis.toUpperCase()}:{" "}
    <span className={"native-jog-coordinate"}>
      {Math.round(currentAxisPosition)}
    </span>
  </>;
  const movementAvailable = nativeJogMovementAvailable(props.context);
  const absoluteMovementAvailable = movementAvailable &&
    !!getNativeJogAbsoluteDestination(
      props.context.botPosition,
      props.axis,
      0,
    );
  const targetCoordinate = parseFloat(target);
  const targetValid = Number.isFinite(targetCoordinate) &&
    absoluteMovementAvailable;
  React.useEffect(() => {
    if (!movementAvailable) {
      onPreview(undefined);
    }
  }, [movementAvailable, onPreview]);
  React.useEffect(() => {
    if (!targetFocused) { return; }
    onPreview(targetValid
      ? targetCoordinate - currentAxisPosition
      : undefined);
  }, [
    currentAxisPosition,
    onPreview,
    targetCoordinate,
    targetFocused,
    targetValid,
  ]);
  React.useEffect(() =>
    () => onPreview(undefined), [onPreview]);
  const progressValue = props.context.movementState
    ? movementPercentRemaining(
      props.context.botPosition,
      props.context.movementState,
    )
    : undefined;
  const progress = props.context.arduinoBusy &&
    isNumber(progressValue) && Number.isFinite(progressValue)
    ? progressValue
    : undefined;
  const activeAction = activeMovement &&
    isEqual(activeMovement.movementState, props.context.movementState)
    ? activeMovement.action
    : undefined;
  const goDistance = activeMovement?.movementState.distance[props.axis]
    ?? targetCoordinate - currentAxisPosition;
  const runMovement = (
    action: NativeJogAction,
    distance: number,
    command: (onError: () => void) => unknown,
  ) => {
    if (!movementAvailable) { return; }
    const movementDistance = clampNativeJogDragDistance(
      props.config,
      props.context,
      props.axis,
      distance,
    ).distance;
    onPreview(movementDistance, true);
    const movementState: MovementState = {
      start: props.context.botPosition,
      distance: {
        x: 0,
        y: 0,
        z: 0,
        [props.axis]: movementDistance,
      },
    };
    props.context.dispatch(setMovementState(movementState));
    setActiveMovement({ action, movementState });
    const cancelMovement = () => {
      onPreview(undefined, true);
      setActiveMovement(undefined);
    };
    try {
      Promise.resolve(command(cancelMovement)).catch(cancelMovement);
    } catch {
      cancelMovement();
    }
  };
  const go = () => {
    if (!targetValid) { return; }
    const destination = getNativeJogAbsoluteDestination(
      props.context.botPosition,
      props.axis,
      targetCoordinate,
    );
    if (!destination) { return; }
    runMovement("go", targetCoordinate - currentAxisPosition,
      onError => moveAbsolute(destination, onError));
  };
  const stepSize = getNativeJogStepSize(props.context.stepSize);
  return <ThreeDPopup
    name={`bot-jog-${props.axis}-popup`}
    position={[0, 0, NATIVE_JOG_POPUP_Z_OFFSET]}
    title={moreOptionsOpen ? t("More options") : title}
    headerActions={moreOptionsOpen
      ? <button
        type={"button"}
        className={"fa fa-arrow-left fb-icon-button invert"}
        title={t("back")}
        onPointerDown={stopThreeDPopupEvent}
        onPointerUp={stopThreeDPopupEvent}
        onClick={event => {
          stopThreeDPopupEvent(event);
          setMoreOptionsOpen(false);
        }} />
      : <button
        type={"button"}
        className={"fa fa-cog fb-icon-button invert"}
        title={t("More options")}
        onPointerDown={stopThreeDPopupEvent}
        onPointerUp={stopThreeDPopupEvent}
        onClick={event => {
          stopThreeDPopupEvent(event);
          setMoreOptionsOpen(true);
        }} />}
    onClose={props.onClose}>
    {moreOptionsOpen
      ? <NativeJogMoreOptions
        axis={props.axis}
        context={props.context}
        encoderVisibility={props.encoderVisibility}
        navigate={props.navigate} />
      : <>
        <div className={"native-jog-control-grid"}>
          <NativeJogStepSizeSelector
            context={props.context}
            stepSize={stepSize} />
          <NativeJogActionButtons
            activeAction={activeAction}
            absoluteMovementAvailable={absoluteMovementAvailable}
            axis={props.axis}
            axisPosition={currentAxisPosition}
            config={props.config}
            context={props.context}
            movementAvailable={movementAvailable}
            previewMovement={onPreview}
            progress={progress}
            runMovement={runMovement}
            stepSize={stepSize} />
          <div className={"native-jog-position-row"}>
            <input
              id={`native-jog-${props.axis}-target`}
              type={"number"}
              aria-label={t("{{axis}} axis position", {
                axis: props.axis.toUpperCase(),
              })}
              disabled={!movementAvailable}
              placeholder={""}
              value={target}
              onFocus={() => setTargetFocused(true)}
              onBlur={() => {
                setTargetFocused(false);
                onPreview(undefined);
              }}
              onChange={event => setTarget(event.currentTarget.value)} />
            <button
              type={"button"}
              className={[
                "fb-button green",
                "native-jog-go-button",
                "native-jog-progress-button",
              ].join(" ")}
              disabled={!targetValid}
              onClick={go}
              onPointerEnter={() => onPreview(targetValid
                ? targetCoordinate - currentAxisPosition
                : undefined)}
              onPointerLeave={() => onPreview(undefined)}
              onFocus={() => onPreview(targetValid
                ? targetCoordinate - currentAxisPosition
                : undefined)}
              onBlur={() => onPreview(undefined)}>
              <span>{t("GO")}</span>
              <NativeJogProgress
                active={activeAction == "go"}
                axis={props.axis}
                distance={nativeJogActionProgressDistance(
                  props.axis,
                  "go",
                  goDistance,
                )}
                progress={progress} />
            </button>
          </div>
        </div>
        <NativeJogEncoderReadings
          axis={props.axis}
          encoderData={props.encoderData}
          visibility={props.encoderVisibility} />
      </>}
  </ThreeDPopup>;
};

interface NativeJogArrowProps {
  axis: Xyz;
  config: NativeJogConfig;
  deviceDirection: NativeJogDirection;
  enabled: boolean;
  hovered: boolean;
  length: number;
  name: string;
}

const NativeJogArrow = (props: NativeJogArrowProps) => {
  const renderedLength = Math.max(
    props.length,
    NATIVE_JOG_MIN_RENDERED_ARROW_LENGTH,
  );
  return <ControlArrow
    name={`${props.name}-${props.deviceDirection == 1 ? "plus" : "minus"}-arrow`}
    start={[0, 0, 0]}
    end={axisPoint(
      props.axis,
      getNativeJogRenderDirection(
        props.config,
        props.axis,
        props.deviceDirection,
      ) * renderedLength,
    )}
    heads={"end"}
    width={NATIVE_JOG_ARROW_WIDTH}
    color={NATIVE_JOG_COLOR}
    hoverColor={NATIVE_JOG_HOVER_COLOR}
    hovered={props.hovered}
    enabled={props.enabled}
    {...NATIVE_JOG_RENDER_OPTIONS} />;
};

export const NATIVE_JOG_GUIDE_COLOR = "orange";

interface NativeJogGuideLineProps {
  axis: Xyz;
  start: ControlPoint;
  target: ControlPoint;
  utmRef?: React.RefObject<Object3D | undefined>;
}

const NativeJogGuideLine = (props: NativeJogGuideLineProps) => {
  // eslint-disable-next-line no-null/no-null
  const lineRef = React.useRef<Line2>(null);
  const start = React.useRef(new Vector3(...props.start));
  useFrame(() => {
    props.utmRef?.current?.getWorldPosition?.(start.current);
    lineRef.current?.geometry.setPositions([
      start.current.x,
      start.current.y,
      start.current.z,
      ...props.target,
    ]);
  });
  return <Line
    ref={lineRef}
    name={`native-jog-${props.axis}-guide-line`}
    points={[props.start, props.target]}
    color={NATIVE_JOG_GUIDE_COLOR}
    lineWidth={3}
    depthTest={false}
    renderOrder={1}
    raycast={noControlRaycast} />;
};

type NativeJogGetZ = (x: number, y: number) => number;

export const getNativeJogUtmShadowPosition = (
  config: NativeJogConfig,
  getZ: NativeJogGetZ,
  gardenPosition: Pick<PositionConfig, "x" | "y">,
): ControlPoint => {
  const world = get3DPositionFunc(config)(gardenPosition);
  return [
    world.x,
    world.y,
    zZero(config) + getZ(gardenPosition.x, gardenPosition.y) +
      NATIVE_JOG_SHADOW_Z_OFFSET,
  ];
};

interface NativeJogTargetCrosshairsProps {
  config: NativeJogConfig;
  getZ: NativeJogGetZ;
  name: string;
  position: Pick<PositionConfig, "x" | "y">;
}

const NativeJogTargetCrosshairs = (
  props: NativeJogTargetCrosshairsProps,
) => {
  const get3DPosition = get3DPositionFunc(props.config);
  const zero = get3DPosition({ x: 0, y: 0 });
  const extents = get3DPosition({
    x: props.config.botSizeX,
    y: props.config.botSizeY,
  });
  const target = get3DPosition(props.position);
  const z = zZero(props.config) +
    props.getZ(props.position.x, props.position.y) +
    NATIVE_JOG_CROSSHAIR_Z_OFFSET;
  return <Group name={`${props.name}-target-crosshairs`}>
    <Line
      name={`${props.name}-target-x-crosshair`}
      points={[
        [Math.min(zero.x, extents.x), target.y, z],
        [Math.max(zero.x, extents.x), target.y, z],
      ]}
      color={"white"}
      transparent={true}
      opacity={0.75}
      lineWidth={1.5}
      raycast={noControlRaycast} />
    <Line
      name={`${props.name}-target-y-crosshair`}
      points={[
        [target.x, Math.min(zero.y, extents.y), z],
        [target.x, Math.max(zero.y, extents.y), z],
      ]}
      color={"white"}
      transparent={true}
      opacity={0.75}
      lineWidth={1.5}
      raycast={noControlRaycast} />
  </Group>;
};

export interface NativeJogCurrentUtmShadowProps {
  config: NativeJogConfig;
  getZ: NativeJogGetZ;
  positionStore: BotPositionSnapshotStore;
}

export const NativeJogCurrentUtmShadow = (
  props: NativeJogCurrentUtmShadowProps,
) => {
  // eslint-disable-next-line no-null/no-null
  const positionRef = React.useRef<Object3D>(null);
  const getPosition = React.useCallback(() => {
    const gardenPosition = getNativeJogDevicePosition(
      props.config,
      props.positionStore.getSnapshot(),
    );
    return getNativeJogUtmShadowPosition(
      props.config,
      props.getZ,
      gardenPosition,
    );
  }, [props.config, props.getZ, props.positionStore]);
  const initialPosition = getPosition();
  useFrame(() => positionRef.current?.position.set(...getPosition()));
  return <Group
    ref={positionRef}
    name={"native-jog-current-utm-position"}
    position={initialPosition}>
    <NativeJogUtmShadow
      name={"native-jog-current-utm"}
      position={[0, 0, 0]} />
  </Group>;
};

export interface NativeJogWorldPreviewProps {
  axis: Xyz;
  axisActions?: NativeJogAxisActionsContext;
  config: NativeJogConfig;
  getZ: NativeJogGetZ;
  ghost?: React.ReactNode;
  name: string;
  preview: NativeJogDragPreview;
  utmRef?: React.RefObject<Object3D | undefined>;
}

export const NativeJogWorldPreview = (
  props: NativeJogWorldPreviewProps,
) => {
  if (!props.preview.world) { return undefined; }
  const offset = getNativeJogDragPreviewPositions(
    props.config,
    props.axis,
    props.preview.distance,
  ).control;
  const targetUtm = controlPointSum(
    props.preview.world.utmPosition,
    offset,
  );
  const targetGardenPosition = {
    ...props.preview.world.gardenPosition,
    [props.axis]: props.preview.start + props.preview.distance,
  };
  const targetAxisPosition =
    props.preview.start + props.preview.distance;
  const arrowLength = (direction: NativeJogDirection) =>
    props.preview.boundDirection == direction && !props.axisActions
      ? 0
      : getNativeJogArrowLength(
        props.config,
        props.axisActions,
        props.axis,
        targetAxisPosition,
        direction,
      );
  const negativeArrowLength = arrowLength(-1);
  const positiveArrowLength = arrowLength(1);
  return <Group name={`${props.name}-world-preview`}>
    <NativeJogGuideLine
      axis={props.axis}
      start={props.preview.world.utmPosition}
      target={targetUtm}
      utmRef={props.utmRef} />
    {props.preview.pending &&
      props.preview.world.controlPositions.map((position, index) =>
        <Group
          key={index}
          name={`${props.name}-world-control-${index}`}
          position={controlPointSum(position, offset)}>
          <ControlSphere
            name={`${props.name}-world-sphere-${index}`}
            radius={NATIVE_JOG_SPHERE_RADIUS}
            color={NATIVE_JOG_COLOR}
            hoverColor={NATIVE_JOG_HOVER_COLOR}
            enabled={false}
            {...NATIVE_JOG_RENDER_OPTIONS} />
          <NativeJogArrow
            axis={props.axis}
            config={props.config}
            deviceDirection={-1}
            enabled={false}
            hovered={false}
            length={negativeArrowLength}
            name={`${props.name}-world-${index}`} />
          <NativeJogArrow
            axis={props.axis}
            config={props.config}
            deviceDirection={1}
            enabled={false}
            hovered={false}
            length={positiveArrowLength}
            name={`${props.name}-world-${index}`} />
        </Group>)}
    <NativeJogGhost name={props.name} position={targetUtm}>
      {props.ghost}
    </NativeJogGhost>
    <NativeJogTargetCrosshairs
      config={props.config}
      getZ={props.getZ}
      name={props.name}
      position={targetGardenPosition} />
    <NativeJogUtmShadow
      name={`${props.name}-target-utm`}
      position={getNativeJogUtmShadowPosition(
        props.config,
        props.getZ,
        targetGardenPosition,
      )} />
  </Group>;
};

export interface NativeJogControlPairProps {
  axis: Xyz;
  axisActions?: NativeJogAxisActionsContext;
  config: NativeJogConfig;
  encoderData?: NativeJogEncoderData;
  encoderVisibility?: NativeJogEncoderVisibility;
  name: string;
  navigate?(path: string): void;
  onClose(): void;
  onSelect(): void;
  position: ControlPoint;
  positionStore: BotPositionSnapshotStore;
  previewState?: NativeJogPreviewState;
  managePreviewLifecycle?: boolean;
  ghost?: React.ReactNode;
  ghostPosition?: ControlPoint;
  selected?: boolean;
}

export interface NativeJogDragPreview {
  boundDirection?: NativeJogDirection;
  distance: number;
  dragging?: boolean;
  dragVisitedInterior?: boolean;
  dragVisitedUnsnapped?: boolean;
  pending: boolean;
  sawBusy: boolean;
  start: number;
  world?: {
    controlPositions: ControlPoint[];
    gardenPosition: PositionConfig;
    utmPosition: ControlPoint;
  };
}

export interface NativeJogPreviewState {
  preview: NativeJogDragPreview | undefined;
  setPreview: React.Dispatch<
    React.SetStateAction<NativeJogDragPreview | undefined>
  >;
  world?(): NonNullable<NativeJogDragPreview["world"]>;
}

const nativeJogDragReleaseResult = (
  releaseResult: NativeJogDragResult,
  preview: NativeJogDragPreview | undefined,
): NativeJogDragResult =>
  preview?.dragging && preview.boundDirection
    ? {
      boundDirection: preview.boundDirection,
      distance: preview.distance,
    }
    : releaseResult;

interface NativeJogPreviewLifecycleProps {
  actionsAvailable: boolean;
  arduinoBusy: boolean | undefined;
  botOnline: boolean | undefined;
  clearPreview(): void;
  dragPreview: NativeJogDragPreview | undefined;
  enabled: boolean;
  locked: boolean | undefined;
  reportedAxisPosition: number | undefined;
  setDragPreview: React.Dispatch<
    React.SetStateAction<NativeJogDragPreview | undefined>
  >;
}

const useNativeJogPreviewLifecycle = (
  props: NativeJogPreviewLifecycleProps,
) => {
  const {
    actionsAvailable, arduinoBusy, botOnline, clearPreview, dragPreview,
    enabled, locked, reportedAxisPosition, setDragPreview,
  } = props;
  // eslint-disable-next-line complexity
  React.useEffect(() => {
    if (!enabled || !dragPreview?.pending) { return; }
    const target = dragPreview.start + dragPreview.distance;
    const reportedAtTarget = isNumber(reportedAxisPosition) &&
      Math.abs(target - reportedAxisPosition) < 1;
    if (!actionsAvailable || locked || !botOnline || reportedAtTarget) {
      // Movement status is an external device lifecycle signal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      clearPreview();
      return;
    }
    if (arduinoBusy && !dragPreview.sawBusy) {
      // Movement status is an external device lifecycle signal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDragPreview(current => current
        ? { ...current, sawBusy: true }
        : current);
    } else if (!arduinoBusy && dragPreview.sawBusy) {
      // Movement status is an external device lifecycle signal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      clearPreview();
    }
  }, [
    actionsAvailable,
    arduinoBusy,
    botOnline,
    clearPreview,
    dragPreview,
    enabled,
    locked,
    reportedAxisPosition,
    setDragPreview,
  ]);
};

export const NativeJogControlPair = (
  props: NativeJogControlPairProps,
) => { // eslint-disable-line complexity
  const enabled = !!props.axisActions;
  const movementAvailable = nativeJogMovementAvailable(props.axisActions);
  const [localPreview, setLocalPreview] =
    React.useState<NativeJogDragPreview | undefined>();
  const dragPreview = props.previewState
    ? props.previewState.preview
    : localPreview;
  const setDragPreview = props.previewState?.setPreview || setLocalPreview;
  const renderedPosition = props.positionStore.getSnapshot();
  const renderedDevicePosition = getNativeJogDevicePosition(
    props.config,
    renderedPosition,
  );
  const previewContext = React.useRef({
    axisActions: props.axisActions,
    config: props.config,
    renderedDevicePosition,
    world: props.previewState?.world,
  });
  React.useLayoutEffect(() => {
    previewContext.current = {
      axisActions: props.axisActions,
      config: props.config,
      renderedDevicePosition,
      world: props.previewState?.world,
    };
  }, [
    props.axisActions,
    props.config,
    props.previewState?.world,
    renderedDevicePosition,
  ]);
  const previewControlled = !!props.previewState;
  const previewDistance = dragPreview?.distance;
  const clearPreview = React.useCallback(() => {
    setDragPreview(undefined);
  }, [setDragPreview]);
  const previewMovement = React.useCallback((
    distance: number | undefined,
    pending = false,
  ) => {
    if (!previewControlled) { return; }
    setDragPreview(current => {
      if (current?.pending && !pending) { return current; }
      const context = previewContext.current;
      const axisActions = context.axisActions;
      if (!isNumber(distance) || !axisActions ||
        !nativeJogMovementAvailable(axisActions)) {
        return undefined;
      }
      const reportedPosition =
        axisActions.botPosition[props.axis];
      const fallback = context.renderedDevicePosition[props.axis];
      const start = isNumber(reportedPosition)
        ? reportedPosition
        : fallback;
      const clampingContext = isNumber(reportedPosition)
        ? axisActions
        : {
          ...axisActions,
          botPosition: {
            ...axisActions.botPosition,
            [props.axis]: start,
          },
        };
      const result = clampNativeJogDragDistance(
        context.config,
        clampingContext,
        props.axis,
        distance,
      );
      return {
        ...result,
        dragging: false,
        dragVisitedInterior: false,
        dragVisitedUnsnapped: false,
        pending,
        sawBusy: false,
        start,
        world: current?.world || context.world?.(),
      };
    });
  }, [previewControlled, props.axis, setDragPreview]);
  const arduinoBusy = props.axisActions?.arduinoBusy;
  const botOnline = props.axisActions?.botOnline;
  const locked = props.axisActions?.locked;
  const reportedAxisPosition =
    props.axisActions?.botPosition[props.axis];
  useNativeJogPreviewLifecycle({
    actionsAvailable: !!props.axisActions,
    arduinoBusy,
    botOnline,
    clearPreview,
    dragPreview,
    enabled: props.managePreviewLifecycle !== false,
    locked,
    reportedAxisPosition,
    setDragPreview,
  });
  const distanceFromEvent = (event: ControlDragEvent) =>
    getNativeJogDragDistance(props.config, props.axis, [
      event.delta.x,
      event.delta.y,
      event.delta.z,
    ]);
  const dragResult = (event: ControlDragEvent) => {
    const axisActions = props.axisActions!;
    const reportedPosition = axisActions.botPosition[props.axis];
    const clampingContext = isNumber(reportedPosition)
      ? axisActions
      : {
        ...axisActions,
        botPosition: {
          ...axisActions.botPosition,
          [props.axis]: renderedDevicePosition[props.axis],
        },
      };
    return clampNativeJogDragDistance(
      props.config,
      clampingContext,
      props.axis,
      distanceFromEvent(event),
    );
  };
  const startDrag = () => {
    const start = props.axisActions?.botPosition[props.axis];
    const fallback = renderedDevicePosition[props.axis];
    const startPosition = isNumber(start) ? start : fallback;
    setDragPreview({
      distance: 0,
      dragging: true,
      dragVisitedInterior: !nativeJogPositionAtBound(
        props.config,
        props.axisActions,
        props.axis,
        startPosition,
      ),
      dragVisitedUnsnapped: false,
      pending: false,
      sawBusy: false,
      start: startPosition,
      world: props.previewState?.world?.(),
    });
  };
  const updateDrag = (event: ControlDragEvent) => {
    const result = dragResult(event);
    setDragPreview(current => {
      const start = current?.start ?? renderedDevicePosition[props.axis];
      const target = start + result.distance;
      const startedInInterior = !nativeJogPositionAtBound(
        props.config,
        props.axisActions,
        props.axis,
        start,
      );
      const targetInInterior = !nativeJogPositionAtBound(
        props.config,
        props.axisActions,
        props.axis,
        target,
      );
      return {
        ...result,
        dragging: true,
        dragVisitedInterior: !!current?.dragVisitedInterior ||
          startedInInterior || targetInInterior,
        dragVisitedUnsnapped: !!current?.dragVisitedUnsnapped ||
          result.distance != 0,
        pending: false,
        sawBusy: false,
        start,
        world: current?.world || props.previewState?.world?.(),
      };
    });
  };
  const endDrag = (event: ControlDragEvent) => {
    const axisActions = props.axisActions!;
    const result = nativeJogDragReleaseResult(
      dragResult(event),
      dragPreview,
    );
    const distance = result.distance;
    if (!nativeJogMovementAvailable(axisActions) || distance == 0 ||
      nativeJogDirectionDisabled(
        axisActions,
        props.axis,
        distance < 0 ? -1 : 1,
      )) {
      clearPreview();
      return;
    }
    const start = dragPreview?.start ??
      renderedDevicePosition[props.axis];
    setDragPreview({
      ...result,
      dragging: false,
      dragVisitedInterior: dragPreview?.dragVisitedInterior,
      dragVisitedUnsnapped: dragPreview?.dragVisitedUnsnapped,
      pending: true,
      sawBusy: axisActions.arduinoBusy,
      start,
      world: dragPreview?.world || props.previewState?.world?.(),
    });
    axisActions.dispatch(setMovementState({
      start: axisActions.botPosition,
      distance: { x: 0, y: 0, z: 0, [props.axis]: distance },
    }));
    relativeMove(props.axis, distance, clearPreview);
  };
  const preview = isNumber(previewDistance)
    ? getNativeJogDragPreviewPositions(
      props.config,
      props.axis,
      previewDistance,
    )
    : undefined;
  const previewCoordinate = dragPreview
    ? Math.round(dragPreview.start + dragPreview.distance)
    : 0;
  const snapped = previewDistance == 0;
  const controlPosition: ControlPoint = preview?.control || [0, 0, 0];
  const ghostPosition = controlPointSum(
    props.ghostPosition || [0, 0, 0],
    controlPosition,
  );
  const reportedPosition = props.axisActions?.botPosition[props.axis];
  const fallbackAxisPosition = isNumber(reportedPosition)
    ? reportedPosition
    : renderedDevicePosition[props.axis];
  const controlAxisPosition = dragPreview
    ? dragPreview.start + dragPreview.distance
    : fallbackAxisPosition;
  const negativeArrowLength = getNativeJogArrowLength(
    props.config,
    props.axisActions,
    props.axis,
    controlAxisPosition,
    -1,
  );
  const positiveArrowLength = getNativeJogArrowLength(
    props.config,
    props.axisActions,
    props.axis,
    controlAxisPosition,
    1,
  );
  const atBound = negativeArrowLength == 0 || positiveArrowLength == 0;
  const activeDragAtBound = !!dragPreview?.dragging &&
    !!dragPreview.dragVisitedInterior && atBound;
  const returnedToSnap = !!dragPreview?.dragging &&
    !!dragPreview.dragVisitedUnsnapped && snapped;
  const idleControlColor = returnedToSnap
    ? SECTION_CONTROL_ACTIVE_COLOR
    : NATIVE_JOG_COLOR;
  const idleControlHoverColor = returnedToSnap
    ? SECTION_CONTROL_ACTIVE_COLOR
    : NATIVE_JOG_HOVER_COLOR;
  const controlColor = activeDragAtBound ? "red" : idleControlColor;
  const controlHoverColor = activeDragAtBound
    ? "red"
    : idleControlHoverColor;
  const showLocalPreview = !props.previewState || !dragPreview?.pending;
  if (!props.config.controlsOverlay) { return undefined; }
  return <Group name={props.name} position={props.position}>
    <Highlight highlightName={"jog-controls"}>
      <ControlHandle
        name={`${props.name}-control`}
        enabled={enabled}
        commitLastDragOnPointerUp={true}
        constraint={movementAvailable && !dragPreview?.pending
          ? event => axisConstraint(props.axis, [
            event.point.x,
            event.point.y,
            event.point.z,
          ])
          : undefined}
        onDragStart={movementAvailable && !dragPreview?.pending
          ? startDrag
          : undefined}
        onDrag={movementAvailable && !dragPreview?.pending
          ? updateDrag
          : undefined}
        onDragEnd={movementAvailable && !dragPreview?.pending
          ? endDrag
          : undefined}
        onDragCancel={clearPreview}
        onActivate={props.onSelect}>
        {state => <>
          <Group
            name={`${props.name}-drag-control`}
            visible={showLocalPreview}
            position={controlPosition}>
            <ControlSphere
              name={`${props.name}-sphere`}
              radius={NATIVE_JOG_SPHERE_RADIUS}
              color={controlColor}
              hoverColor={controlHoverColor}
              hovered={state.hovered || state.dragging}
              active={props.selected}
              enabled={enabled}
              {...NATIVE_JOG_RENDER_OPTIONS} />
            <NativeJogArrow
              axis={props.axis}
              config={props.config}
              deviceDirection={-1}
              enabled={enabled}
              hovered={state.hovered || state.dragging}
              length={negativeArrowLength}
              name={props.name} />
            <NativeJogArrow
              axis={props.axis}
              config={props.config}
              deviceDirection={1}
              enabled={enabled}
              hovered={state.hovered || state.dragging}
              length={positiveArrowLength}
              name={props.name} />
          </Group>
          {preview && showLocalPreview &&
            <ControlLabel
              name={`${props.name}-drag-label`}
              position={preview.label}
              enabled={false}
              depthTest={false}
              depthWrite={false}
              renderOrder={1}>
              {previewCoordinate}
            </ControlLabel>}
        </>}
      </ControlHandle>
    </Highlight>
    {preview && !props.previewState && <NativeJogGhost
      name={props.name}
      position={ghostPosition}>
      {props.ghost}
    </NativeJogGhost>}
    {props.selected && props.axisActions &&
      <NativeJogPopup
        axis={props.axis}
        config={props.config}
        context={props.axisActions}
        encoderData={props.encoderData}
        encoderVisibility={props.encoderVisibility}
        navigate={props.navigate}
        onClose={props.onClose}
        onPreview={previewMovement}
        positionStore={props.positionStore} />}
  </Group>;
};
