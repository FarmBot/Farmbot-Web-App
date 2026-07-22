import React from "react";
import { McuParams, Xyz } from "farmbot";
import { isEqual, isNumber } from "lodash";
import { Config, PositionConfig } from "../config";
import { Group } from "../components";
import {
  ControlArrow, ControlHandle, ControlPoint, ControlSphere,
  stopThreeDPopupEvent, ThreeDPopup,
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
import { Link } from "../../link";
import { calculateAxialLengths } from
  "../../controls/move/direction_axes_props";
import { MovementState } from "../../interfaces";
import { movementPercentRemaining } from "../../farm_designer/move_to";
import { Highlight } from "../elements";

export const NATIVE_JOG_ARROW_LENGTH = 100;
const NATIVE_JOG_ARROW_WIDTH = 12;
const NATIVE_JOG_SPHERE_RADIUS = 20;
const NATIVE_JOG_COLOR = "gray";
const NATIVE_JOG_HOVER_COLOR = "lightgray";
const NATIVE_JOG_BED_OFFSET = 100;
const NATIVE_JOG_BEAM_INSET = 100;
const NATIVE_JOG_BEAM_Z_OFFSET = 200;
const NATIVE_JOG_RENDER_OPTIONS = {
  depthTest: true,
  depthWrite: true,
  renderOrder: 0,
} as const;
export const NATIVE_JOG_STEP_CHOICES = [1, 10, 100, 1000];
export const NATIVE_JOG_CUSTOM_STEP_STORAGE_KEY =
  "nativeJogCustomStepSize";

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
  "beamLength" | "bedWidthOuter" | "bedYOffset" | "botSizeX" |
  "botSizeY" | "columnLength" | "kitVersion" | "mirrorX" |
  "mirrorY" | "negativeZ" | "safeHeight">;

export const getNativeJogControlPositions = (
  config: NativeJogConfig,
) => {
  const beamEndOffset = getBotVersion(config.kitVersion).beamEndOffset;
  const beamControlX = -39;
  const beamControlZ = config.columnLength + NATIVE_JOG_BEAM_Z_OFFSET;
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
      [beamControlX, -beamEndOffset + NATIVE_JOG_BEAM_INSET, beamControlZ],
      [
        beamControlX,
        config.beamLength - beamEndOffset - NATIVE_JOG_BEAM_INSET,
        beamControlZ,
      ],
    ] as [ControlPoint, ControlPoint],
    z: [60, 0, 300] as ControlPoint,
  };
};

const axisPoint = (
  axis: Xyz,
  distance: number,
): ControlPoint => [
  axis == "x" ? distance : 0,
  axis == "y" ? distance : 0,
  axis == "z" ? distance : 0,
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

export const nativeJogMovementAvailable = (
  context: NativeJogAxisActionsContext | undefined,
) => !!context && context.botOnline &&
  !context.arduinoBusy && !context.locked;

const validCommandPosition = (
  position: BotPosition,
): PositionConfig | undefined =>
  isNumber(position.x) && isNumber(position.y) && isNumber(position.z)
    ? { x: position.x, y: position.y, z: position.z }
    : undefined;

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

const nativeJogStopAtHome = (
  context: NativeJogAxisActionsContext,
  axis: Xyz,
) => ({
  x: !!context.firmwareSettings.movement_stop_at_home_x,
  y: !!context.firmwareSettings.movement_stop_at_home_y,
  z: !!context.firmwareSettings.movement_stop_at_home_z,
})[axis];

const nativeJogStopAtMax = (
  context: NativeJogAxisActionsContext,
  axis: Xyz,
) => ({
  x: !!context.firmwareSettings.movement_stop_at_max_x,
  y: !!context.firmwareSettings.movement_stop_at_max_y,
  z: !!context.firmwareSettings.movement_stop_at_max_z,
})[axis];

export const nativeJogMaxPosition = (
  context: NativeJogAxisActionsContext,
  axis: Xyz,
) => {
  const length = nativeJogAxisLength(context, axis);
  return nativeJogAxisNegativeOnly(context, axis) ? -length : length;
};

export const nativeJogDirectionDisabled = (
  context: NativeJogAxisActionsContext,
  axis: Xyz,
  direction: NativeJogDirection,
) => {
  const position = context.botPosition[axis];
  if (!isNumber(position)) { return false; }
  const negativeOnly = nativeJogAxisNegativeOnly(context, axis);
  const movingTowardHome = negativeOnly ? direction > 0 : direction < 0;
  const movingTowardMax = negativeOnly ? direction < 0 : direction > 0;
  const atHome = position == 0;
  const length = nativeJogAxisLength(context, axis);
  const atMax = length > 0 && Math.abs(position) >= length;
  return nativeJogStopAtHome(context, axis) && atHome && movingTowardHome
    || nativeJogStopAtMax(context, axis) && atMax && movingTowardMax;
};

const relativeMove = (axis: Xyz, distance: number) =>
  moveRelative({
    x: axis == "x" ? distance : 0,
    y: axis == "y" ? distance : 0,
    z: axis == "z" ? distance : 0,
  });

const encoderValue = (value: number | undefined) =>
  isNumber(value) ? value.toLocaleString() : "---";

interface NativeJogMoreOptionsPopupProps {
  axis: Xyz;
  context: NativeJogAxisActionsContext;
  encoderVisibility?: NativeJogEncoderVisibility;
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
        className={"fb-button gray"}
        disabled={!movementAvailable}
        onClick={() => void setHome(props.axis)}>
        {t("SET HOME")}
      </button>
      <button
        type={"button"}
        className={"fb-button gray"}
        disabled={!movementAvailable || hardwareDisabled}
        onClick={() => void findAxisLength(props.axis)}>
        {t("FIND LENGTH")}
      </button>
      <button
        type={"button"}
        className={"fb-button gray"}
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
    <Link to={Path.settings("axes")} onClick={openSettings}>
      <i className={"fa fa-external-link"} />
      {t("Settings")}
    </Link>
  </div>;
};

type NativeJogAction =
  "find-home" | "go" | "home" | "max" | "negative" | "positive" |
  "safe";

interface NativeJogProgressProps {
  active: boolean;
  progress: number | undefined;
}

const NativeJogProgress = (props: NativeJogProgressProps) =>
  props.active && isNumber(props.progress)
    ? <div className={"movement-progress"}
      style={{ width: `${props.progress}%`, top: 0, left: 0 }} />
    : <i />;

interface NativeJogActionButtonsProps {
  activeAction: NativeJogAction | undefined;
  axis: Xyz;
  commandPosition: PositionConfig | undefined;
  config: NativeJogConfig;
  context: NativeJogAxisActionsContext;
  movementAvailable: boolean;
  progress: number | undefined;
  runMovement(
    action: NativeJogAction,
    distance: number,
    command: () => unknown,
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
  const axisPosition = current[props.axis];
  const atHome = axisPosition == 0;
  const maxPosition = nativeJogMaxPosition(props.context, props.axis);
  const atMax = isNumber(axisPosition) && axisPosition == maxPosition;
  const safePosition = props.config.safeHeight;
  const atSafe = isNumber(axisPosition) && axisPosition == safePosition;
  const moveHome = () => {
    if (!props.movementAvailable) { return; }
    props.runMovement("home", isNumber(axisPosition) ? -axisPosition : 0,
      () => moveToHome(props.axis));
  };
  const findAxisHome = () => {
    if (!props.movementAvailable || hardwareDisabled) { return; }
    props.runMovement("find-home",
      isNumber(axisPosition) ? -axisPosition : 0,
      () => findHome(props.axis));
  };
  const jog = (direction: NativeJogDirection) => {
    if (!props.movementAvailable) { return; }
    const distance = direction * props.stepSize;
    props.runMovement(direction < 0 ? "negative" : "positive", distance,
      () => relativeMove(props.axis, direction * props.stepSize));
  };
  const moveToAxisPosition = (
    action: "max" | "safe",
    targetPosition: number,
  ) => {
    const currentPosition = props.commandPosition![props.axis];
    const target = {
      ...props.commandPosition!,
      [props.axis]: targetPosition,
    };
    props.runMovement(action, targetPosition - currentPosition,
      () => moveAbsolute(target));
  };
  const progress = (action: NativeJogAction) =>
    <NativeJogProgress
      active={props.activeAction == action}
      progress={props.progress} />;
  const safeArrow = !isNumber(axisPosition) || safePosition >= axisPosition
    ? "up"
    : "down";
  return <div className={"native-jog-popup-actions"}>
    <button
      type={"button"}
      className={[
        "home-button arrow-button fb-button gray",
        "native-jog-progress-button",
      ].join(" ")}
      disabled={!props.movementAvailable || atHome}
      aria-label={t("Move Home {{axis}}", { axis: axisLabel })}
      title={t("Move Home {{axis}}", { axis: axisLabel })}
      onClick={moveHome}>
      <div className={"fa-stack"}>
        <i className={"fa fa-home fa-stack-2x"} />
        <i className={`fa fa-arrow-${
          props.axis == "z" ? "up" : "left"} fa-stack-1x`} />
      </div>
      {progress("home")}
    </button>
    <button
      type={"button"}
      className={[
        "home-button arrow-button fb-button gray",
        "native-jog-progress-button",
      ].join(" ")}
      disabled={!props.movementAvailable || hardwareDisabled || atHome}
      aria-label={t("Find Home {{axis}}", { axis: axisLabel })}
      title={t("Find Home {{axis}}", { axis: axisLabel })}
      onClick={findAxisHome}>
      <div className={"fa-stack"}>
        <i className={"fa fa-home fa-stack-2x"} />
        <i className={"fa fa-search fa-stack-1x"} />
      </div>
      {progress("find-home")}
    </button>
    <button
      type={"button"}
      className={[
        "fb-button gray arrow-button fa fa-2x",
        "native-jog-progress-button",
        `fa-arrow-${negativeArrow}`,
      ].join(" ")}
      disabled={!props.movementAvailable ||
        nativeJogDirectionDisabled(props.context, props.axis, -1)}
      aria-label={t("Jog -{{axis}}", { axis: axisLabel })}
      title={t("Jog -{{axis}}", { axis: axisLabel })}
      onClick={() => jog(-1)}>
      <p>{`-${axisLabel}`}</p>
      {progress("negative")}
    </button>
    <button
      type={"button"}
      className={[
        "fb-button gray arrow-button fa fa-2x",
        "native-jog-progress-button",
        `fa-arrow-${positiveArrow}`,
      ].join(" ")}
      disabled={!props.movementAvailable ||
        nativeJogDirectionDisabled(props.context, props.axis, 1)}
      aria-label={t("Jog +{{axis}}", { axis: axisLabel })}
      title={t("Jog +{{axis}}", { axis: axisLabel })}
      onClick={() => jog(1)}>
      <p>{`+${axisLabel}`}</p>
      {progress("positive")}
    </button>
    {props.axis != "z"
      ? <button
        type={"button"}
        className={[
          "fb-button gray arrow-button fa fa-2x fa-arrow-right",
          "native-jog-progress-button",
        ].join(" ")}
        disabled={!props.movementAvailable || atMax || maxPosition == 0
          || !props.commandPosition}
        aria-label={t("Move to Max {{axis}}", { axis: axisLabel })}
        title={t("Move to Max {{axis}}", { axis: axisLabel })}
        onClick={() => moveToAxisPosition("max", maxPosition)}>
        <p>{t("Max")}</p>
        {progress("max")}
      </button>
      : <button
        type={"button"}
        className={[
          "fb-button gray arrow-button fa fa-2x",
          `fa-arrow-${safeArrow}`,
          "native-jog-progress-button",
        ].join(" ")}
        disabled={!props.movementAvailable || atSafe || !props.commandPosition}
        aria-label={t("Move to Safe Height")}
        title={t("Move to Safe Height")}
        onClick={() => moveToAxisPosition("safe", safePosition)}>
        <p>{t("Safe")}</p>
        {progress("safe")}
      </button>}
  </div>;
};

interface NativeJogStepSizeSelectorProps {
  context: NativeJogAxisActionsContext;
  stepSize: number;
}

const validCustomStep = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const cachedCustomStep = () => {
  const cached = window.localStorage.getItem(
    NATIVE_JOG_CUSTOM_STEP_STORAGE_KEY,
  ) || "";
  return validCustomStep(cached) ? cached : "";
};

export const NativeJogStepSizeSelector = (
  props: NativeJogStepSizeSelectorProps,
) => {
  const standardSelected = NATIVE_JOG_STEP_CHOICES.includes(props.stepSize);
  const [custom, setCustom] = React.useState(() =>
    standardSelected ? cachedCustomStep() : `${props.stepSize}`);
  const select = (stepSize: number) =>
    props.context.dispatch(changeStepSize(stepSize));
  const selectCustom = (value: string) => {
    const customStep = validCustomStep(value);
    if (!customStep) { return; }
    window.localStorage.setItem(
      NATIVE_JOG_CUSTOM_STEP_STORAGE_KEY,
      `${customStep}`,
    );
    select(customStep);
  };
  return <div className={"move-amount-wrapper native-jog-step-selector"}>
    {NATIVE_JOG_STEP_CHOICES.map((choice, index) =>
      <button
        key={choice}
        type={"button"}
        title={t("{{ amount }}mm", { amount: choice })}
        className={[
          "move-amount no-radius fb-button",
          index == 0 ? "leftmost" : "",
          props.stepSize == choice ? "move-amount-selected" : "",
        ].filter(Boolean).join(" ")}
        onClick={() => select(choice)}>
        {choice}
      </button>)}
    <input
      type={"number"}
      min={1}
      className={[
        "move-amount rightmost native-jog-custom-step",
        standardSelected ? "" : "move-amount-selected",
      ].filter(Boolean).join(" ")}
      aria-label={t("Custom move amount")}
      placeholder={t("Custom")}
      value={custom}
      onFocus={() => selectCustom(custom)}
      onChange={event => {
        const value = event.currentTarget.value;
        setCustom(value);
        selectCustom(value);
      }} />
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
  onClose(): void;
  positionStore: BotPositionSnapshotStore;
}

// eslint-disable-next-line complexity
export const NativeJogPopup = (props: NativeJogPopupProps) => {
  const renderedPosition = useBotPositionSnapshot(props.positionStore);
  const renderedDevicePosition = getNativeJogDevicePosition(
    props.config,
    renderedPosition,
  );
  const commandPosition = validCommandPosition(props.context.botPosition);
  const axisPosition = props.context.botPosition[props.axis];
  const currentAxisPosition = isNumber(axisPosition)
    ? axisPosition
    : renderedDevicePosition[props.axis];
  const [target, setTarget] = React.useState("");
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
  const title = `${props.axis.toUpperCase()}: ${Math.round(
    currentAxisPosition,
  )}`;
  const movementAvailable = nativeJogMovementAvailable(props.context);
  const targetCoordinate = parseFloat(target);
  const targetValid = Number.isFinite(targetCoordinate) &&
    movementAvailable && !!commandPosition;
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
  const runMovement = (
    action: NativeJogAction,
    distance: number,
    command: () => unknown,
  ) => {
    if (!movementAvailable) { return; }
    const movementState: MovementState = {
      start: props.context.botPosition,
      distance: { x: 0, y: 0, z: 0, [props.axis]: distance },
    };
    props.context.dispatch(setMovementState(movementState));
    setActiveMovement({ action, movementState });
    command();
  };
  const go = () => {
    if (!commandPosition || !targetValid) { return; }
    const destination = {
      ...commandPosition,
      [props.axis]: targetCoordinate,
    };
    runMovement("go", targetCoordinate - commandPosition[props.axis],
      () => moveAbsolute(destination));
  };
  const stepSize = getNativeJogStepSize(props.context.stepSize);
  return <ThreeDPopup
    name={moreOptionsOpen
      ? "bot-jog-more-options-popup"
      : `bot-jog-${props.axis}-popup`}
    position={[0, 0, 0]}
    title={moreOptionsOpen ? t("More options") : title}
    headerActions={!moreOptionsOpen &&
      <button
        type={"button"}
        className={"fa fa-cog fb-icon-button invert"}
        title={t("More options")}
        onPointerDown={stopThreeDPopupEvent}
        onClick={event => {
          stopThreeDPopupEvent(event);
          setMoreOptionsOpen(true);
        }} />
    }
    onClose={moreOptionsOpen
      ? () => setMoreOptionsOpen(false)
      : props.onClose}>
    {moreOptionsOpen
      ? <NativeJogMoreOptions
        axis={props.axis}
        context={props.context}
        encoderVisibility={props.encoderVisibility} />
      : <>
        <NativeJogStepSizeSelector
          context={props.context}
          stepSize={stepSize} />
        <NativeJogActionButtons
          activeAction={activeAction}
          axis={props.axis}
          commandPosition={commandPosition}
          config={props.config}
          context={props.context}
          movementAvailable={movementAvailable}
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
            onChange={event => setTarget(event.currentTarget.value)} />
          <button
            type={"button"}
            className={[
              "fb-button green",
              "native-jog-progress-button",
            ].join(" ")}
            disabled={!targetValid}
            onClick={go}>
            <span>{t("GO")}</span>
            <NativeJogProgress
              active={activeAction == "go"}
              progress={progress} />
          </button>
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
  name: string;
}

const NativeJogArrow = (props: NativeJogArrowProps) =>
  <ControlArrow
    name={`${props.name}-${
      props.deviceDirection == 1 ? "plus" : "minus"}-arrow`}
    start={[0, 0, 0]}
    end={axisPoint(
      props.axis,
      getNativeJogRenderDirection(
        props.config,
        props.axis,
        props.deviceDirection,
      ) * NATIVE_JOG_ARROW_LENGTH,
    )}
    heads={"end"}
    width={NATIVE_JOG_ARROW_WIDTH}
    color={NATIVE_JOG_COLOR}
    hoverColor={NATIVE_JOG_HOVER_COLOR}
    hovered={props.hovered}
    enabled={props.enabled}
    {...NATIVE_JOG_RENDER_OPTIONS} />;

export interface NativeJogControlPairProps {
  axis: Xyz;
  axisActions?: NativeJogAxisActionsContext;
  config: NativeJogConfig;
  encoderData?: NativeJogEncoderData;
  encoderVisibility?: NativeJogEncoderVisibility;
  name: string;
  onClose(): void;
  onSelect(): void;
  position: ControlPoint;
  positionStore: BotPositionSnapshotStore;
  selected?: boolean;
}

export const NativeJogControlPair = (
  props: NativeJogControlPairProps,
) => {
  const enabled = nativeJogMovementAvailable(props.axisActions);
  return <Group name={props.name} position={props.position}>
    <Highlight highlightName={"jog-controls"}>
      <ControlHandle
        name={`${props.name}-control`}
        enabled={enabled}
        onActivate={props.onSelect}>
        {state => <>
          <ControlSphere
            name={`${props.name}-sphere`}
            radius={NATIVE_JOG_SPHERE_RADIUS}
            color={NATIVE_JOG_COLOR}
            hoverColor={NATIVE_JOG_HOVER_COLOR}
            hovered={state.hovered}
            active={props.selected}
            enabled={enabled}
            {...NATIVE_JOG_RENDER_OPTIONS} />
          <NativeJogArrow
            axis={props.axis}
            config={props.config}
            deviceDirection={-1}
            enabled={enabled}
            hovered={state.hovered}
            name={props.name} />
          <NativeJogArrow
            axis={props.axis}
            config={props.config}
            deviceDirection={1}
            enabled={enabled}
            hovered={state.hovered}
            name={props.name} />
        </>}
      </ControlHandle>
    </Highlight>
    {props.selected && props.axisActions &&
      <NativeJogPopup
        axis={props.axis}
        config={props.config}
        context={props.axisActions}
        encoderData={props.encoderData}
        encoderVisibility={props.encoderVisibility}
        onClose={props.onClose}
        positionStore={props.positionStore} />}
  </Group>;
};
