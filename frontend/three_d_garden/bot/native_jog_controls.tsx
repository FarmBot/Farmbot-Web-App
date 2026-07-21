import React from "react";
import { McuParams, Xyz } from "farmbot";
import { isNumber } from "lodash";
import { Config, PositionConfig } from "../config";
import { Group } from "../components";
import {
  ControlArrow, ControlHandle, ControlPoint, ControlSphere,
  ThreeDPopup,
} from "../controls";
import {
  BotPositionSnapshotStore, useBotPositionSnapshot,
} from "./position_spring";
import {
  findAxisLength, findHome, moveAbsolute, moveRelative, moveToHome,
  setHome,
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
import { StepSizeSelector } from "../../controls/move/step_size_selector";
import { setAxisLength } from "../../controls/move/bot_position_rows";
import { setMovementStateFromPosition } from
  "../../connectivity/log_handlers";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { Path } from "../../internal_urls";
import { getBotVersion } from "./bot_versions";
import { Link } from "../../link";

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

export type NativeJogDirection = -1 | 1;

export interface NativeJogSelection {
  name: string;
}

export interface NativeJogEncoderVisibility {
  raw: boolean;
  scaled: boolean;
}

export type NativeJogEncoderData = Pick<BotLocationData,
  "raw_encoders" | "scaled_encoders">;

export interface NativeJogAxisActionsContext {
  arduinoBusy: boolean;
  botPosition: BotPosition;
  botOnline: boolean;
  dispatch: Function;
  firmwareSettings: McuParams;
  locked: boolean;
  stepSize?: number;
}

type NativeJogConfig = Pick<Config,
  "beamLength" | "bedWidthOuter" | "bedYOffset" | "botSizeX" |
  "botSizeY" | "columnLength" | "kitVersion" | "mirrorX" |
  "mirrorY" | "negativeZ">;

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
  NATIVE_JOG_STEP_CHOICES.includes(stepSize || 0) ? stepSize || 100 : 100;

const relativeMove = (axis: Xyz, distance: number) => {
  void moveRelative({
    x: axis == "x" ? distance : 0,
    y: axis == "y" ? distance : 0,
    z: axis == "z" ? distance : 0,
  });
};

const encoderValue = (value: number | undefined) =>
  isNumber(value) ? value.toLocaleString() : "---";

interface NativeJogMoreOptionsPopupProps {
  axis: Xyz;
  context: NativeJogAxisActionsContext;
  encoderVisibility?: NativeJogEncoderVisibility;
  onClose(): void;
}

export const NativeJogMoreOptionsPopup = (
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
  return <ThreeDPopup
    name={"bot-jog-more-options-popup"}
    position={[0, 0, 0]}
    title={t("More options")}
    onClose={props.onClose}>
    <div className={"native-jog-more-options"}>
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
    </div>
  </ThreeDPopup>;
};

interface NativeJogActionButtonsProps {
  axis: Xyz;
  context: NativeJogAxisActionsContext;
  movementAvailable: boolean;
  stepSize: number;
}

const NativeJogActionButtons = (props: NativeJogActionButtonsProps) => {
  const axisLabel = props.axis.toUpperCase();
  const negativeArrow = props.axis == "z" ? "down" : "left";
  const positiveArrow = props.axis == "z" ? "up" : "right";
  const hardwareDisabled =
    disabledAxisMap(props.context.firmwareSettings)[props.axis];
  const moveHome = () => {
    if (props.movementAvailable) { void moveToHome(props.axis); }
  };
  const findAxisHome = () => {
    if (!props.movementAvailable || hardwareDisabled) { return; }
    void findHome(props.axis);
    props.context.dispatch(setMovementStateFromPosition());
  };
  const jog = (direction: NativeJogDirection) => {
    if (props.movementAvailable) {
      relativeMove(props.axis, direction * props.stepSize);
    }
  };
  return <div className={"native-jog-popup-actions"}>
    <button
      type={"button"}
      className={"home-button arrow-button fb-button gray"}
      disabled={!props.movementAvailable}
      aria-label={t("Move Home {{axis}}", { axis: axisLabel })}
      title={t("Move Home {{axis}}", { axis: axisLabel })}
      onClick={moveHome}>
      <div className={"fa-stack"}>
        <i className={"fa fa-home fa-stack-2x"} />
        <i className={"fa fa-arrow-right fa-stack-1x"} />
      </div>
    </button>
    <button
      type={"button"}
      className={"home-button arrow-button fb-button gray"}
      disabled={!props.movementAvailable || hardwareDisabled}
      aria-label={t("Find Home {{axis}}", { axis: axisLabel })}
      title={t("Find Home {{axis}}", { axis: axisLabel })}
      onClick={findAxisHome}>
      <div className={"fa-stack"}>
        <i className={"fa fa-home fa-stack-2x"} />
        <i className={"fa fa-search fa-stack-1x"} />
      </div>
    </button>
    <button
      type={"button"}
      className={[
        "fb-button gray arrow-button fa fa-2x",
        `fa-arrow-${negativeArrow}`,
      ].join(" ")}
      disabled={!props.movementAvailable}
      aria-label={t("Jog -{{axis}}", { axis: axisLabel })}
      title={t("Jog -{{axis}}", { axis: axisLabel })}
      onClick={() => jog(-1)}>
      <p>{`-${axisLabel}`}</p>
    </button>
    <button
      type={"button"}
      className={[
        "fb-button gray arrow-button fa fa-2x",
        `fa-arrow-${positiveArrow}`,
      ].join(" ")}
      disabled={!props.movementAvailable}
      aria-label={t("Jog +{{axis}}", { axis: axisLabel })}
      title={t("Jog +{{axis}}", { axis: axisLabel })}
      onClick={() => jog(1)}>
      <p>{`+${axisLabel}`}</p>
    </button>
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
  const [target, setTarget] = React.useState(
    () => `${currentAxisPosition}`,
  );
  const [moreOptionsOpen, setMoreOptionsOpen] = React.useState(false);
  const title = `${props.axis.toUpperCase()}: ${Math.round(
    currentAxisPosition,
  ).toLocaleString()}`;
  const movementAvailable = nativeJogMovementAvailable(props.context);
  const targetCoordinate = parseFloat(target);
  const targetValid = Number.isFinite(targetCoordinate) &&
    movementAvailable && !!commandPosition;
  const go = () => {
    if (!commandPosition || !targetValid) { return; }
    void moveAbsolute({
      ...commandPosition,
      [props.axis]: targetCoordinate,
    });
  };
  if (moreOptionsOpen) {
    return <NativeJogMoreOptionsPopup
      axis={props.axis}
      context={props.context}
      encoderVisibility={props.encoderVisibility}
      onClose={() => setMoreOptionsOpen(false)} />;
  }
  const stepSize = getNativeJogStepSize(props.context.stepSize);
  return <ThreeDPopup
    name={`bot-jog-${props.axis}-popup`}
    position={[0, 0, 0]}
    title={title}
    headerActions={
      <button
        type={"button"}
        className={"fa fa-cog fb-icon-button invert"}
        title={t("More options")}
        onClick={() => setMoreOptionsOpen(true)} />
    }
    onClose={props.onClose}>
    <StepSizeSelector
      choices={NATIVE_JOG_STEP_CHOICES}
      dispatch={props.context.dispatch}
      selected={stepSize} />
    <NativeJogActionButtons
      axis={props.axis}
      context={props.context}
      movementAvailable={movementAvailable}
      stepSize={stepSize} />
    <div className={"native-jog-position-row"}>
      <input
        id={`native-jog-${props.axis}-target`}
        type={"number"}
        aria-label={t("{{axis}} axis position", {
          axis: props.axis.toUpperCase(),
        })}
        disabled={!movementAvailable}
        value={target}
        onChange={event => setTarget(event.currentTarget.value)} />
      <button
        type={"button"}
        className={"fb-button green"}
        disabled={!targetValid}
        onClick={go}>
        {t("GO")}
      </button>
    </div>
    <NativeJogEncoderReadings
      axis={props.axis}
      encoderData={props.encoderData}
      visibility={props.encoderVisibility} />
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
  const enabled = !!props.axisActions;
  return <Group name={props.name} position={props.position}>
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
