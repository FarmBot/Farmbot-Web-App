import React from "react";
import { McuParams, Xyz } from "farmbot";
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
  moveAbsolute, moveRelative, moveToHome,
} from "../../devices/actions";
import { t } from "../../i18next_wrapper";
import { ToggleButton } from "../../ui";
import { BooleanSetting } from "../../session_keys";
import { toggleWebAppBool } from "../../config_storage/actions";
import { DeviceSetting } from "../../constants";
import { BotLocationData, BotPosition } from "../../devices/interfaces";
import { isNumber } from "lodash";
import { AxisActionsMenu } from "../../controls/move/bot_position_rows";
import {
  disabledAxisMap,
} from "../../settings/hardware_settings/axis_tracking_status";
import { sourceFwConfigValue } from "../../settings/source_config_value";

export const NATIVE_JOG_ARROW_LENGTH = 100;
const NATIVE_JOG_ARROW_WIDTH = 12;
const NATIVE_JOG_SPHERE_RADIUS = 20;
const NATIVE_JOG_COLOR = "gray";
const NATIVE_JOG_HOVER_COLOR = "lightgray";
const NATIVE_JOG_BED_OFFSET = 200;

export type NativeJogDirection = -1 | 1;

export type NativeJogSelection = {
  name: string;
  type: "axis-actions";
} | {
  direction: NativeJogDirection;
  name: string;
  type: "jog";
};

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
}

type NativeJogConfig = Pick<Config,
  "bedWidthOuter" | "bedYOffset" | "botSizeX" | "botSizeY" |
  "botSizeZ" | "mirrorX" | "mirrorY" | "negativeZ">;

export const getNativeJogControlPositions = (
  config: NativeJogConfig,
) => ({
  x: [
    [0, -config.bedYOffset - NATIVE_JOG_BED_OFFSET, 0],
    [
      0,
      config.bedWidthOuter - config.bedYOffset + NATIVE_JOG_BED_OFFSET,
      0,
    ],
  ] as [ControlPoint, ControlPoint],
  y: [0, 0, 200] as ControlPoint,
  z: [100, 0, 300] as ControlPoint,
});

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

const relativeMove = (axis: Xyz, distance: number) => {
  void moveRelative({
    x: axis == "x" ? distance : 0,
    y: axis == "y" ? distance : 0,
    z: axis == "z" ? distance : 0,
  });
};

const axisMaximum = (config: NativeJogConfig, axis: Xyz) => ({
  x: config.botSizeX,
  y: config.botSizeY,
  z: config.botSizeZ,
})[axis];

interface NativeJogPopupProps {
  axis: Xyz;
  config: NativeJogConfig;
  context: NativeJogAxisActionsContext;
  direction: NativeJogDirection;
  encoderData?: NativeJogEncoderData;
  encoderVisibility?: NativeJogEncoderVisibility;
  onClose(): void;
  positionStore: BotPositionSnapshotStore;
}

const popupPosition = (
  config: NativeJogConfig,
  axis: Xyz,
  direction: NativeJogDirection,
) => axisPoint(
  axis,
  getNativeJogRenderDirection(config, axis, direction) *
    NATIVE_JOG_ARROW_LENGTH / 2,
);

const encoderValue = (value: number | undefined) =>
  isNumber(value) ? value.toLocaleString() : "---";

interface NativeJogEncoderSettingsPopupProps {
  axis: Xyz;
  config: NativeJogConfig;
  direction: NativeJogDirection;
  dispatch: Function;
  encoderVisibility?: NativeJogEncoderVisibility;
  onClose(): void;
}

export const NativeJogEncoderSettingsPopup = (
  props: NativeJogEncoderSettingsPopupProps,
) => {
  const toggle = (setting: "raw_encoders" | "scaled_encoders") =>
    props.dispatch(toggleWebAppBool(BooleanSetting[setting]));
  return <ThreeDPopup
    name={"bot-jog-encoder-settings-popup"}
    position={popupPosition(props.config, props.axis, props.direction)}
    title={t("Encoder display")}
    onClose={props.onClose}>
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
  </ThreeDPopup>;
};

interface NativeJogAxisActionsPopupProps {
  axis: Xyz;
  context: NativeJogAxisActionsContext;
  onClose(): void;
}

export const NativeJogAxisActionsPopup = (
  props: NativeJogAxisActionsPopupProps,
) => {
  return <ThreeDPopup
    name={`bot-jog-${props.axis}-axis-actions-popup`}
    position={[0, 0, 0]}
    title={t("{{axis}} AXIS", { axis: props.axis.toUpperCase() })}
    onClose={props.onClose}>
    <AxisActionsMenu
      axis={props.axis}
      arduinoBusy={props.context.arduinoBusy}
      locked={props.context.locked}
      hardwareDisabled={
        disabledAxisMap(props.context.firmwareSettings)[props.axis]}
      botOnline={props.context.botOnline}
      dispatch={props.context.dispatch}
      botPosition={props.context.botPosition}
      sourceFwConfig={sourceFwConfigValue(
        undefined,
        props.context.firmwareSettings,
      )} />
  </ThreeDPopup>;
};

interface NativeJogActionButtonsProps {
  axis: Xyz;
  commandPosition: PositionConfig | undefined;
  config: NativeJogConfig;
  direction: NativeJogDirection;
  movementAvailable: boolean;
}

const NativeJogActionButtons = (props: NativeJogActionButtonsProps) => {
  const jogDistances = props.direction == 1
    ? [1, 10, 100, 1000]
    : [-1, -10, -100, -1000];
  const moveHome = () => {
    if (props.movementAvailable) { void moveToHome(props.axis); }
  };
  const jog = (distance: number) => {
    if (props.movementAvailable) { relativeMove(props.axis, distance); }
  };
  const moveToMax = () => {
    if (!props.movementAvailable || !props.commandPosition) { return; }
    void moveAbsolute({
      ...props.commandPosition,
      [props.axis]: axisMaximum(props.config, props.axis),
    });
  };
  return <div className={"native-jog-popup-actions"}>
    {props.direction == -1 &&
      <button
        type={"button"}
        className={"fb-button gray"}
        disabled={!props.movementAvailable}
        onClick={moveHome}>
        {t("Home")}
      </button>}
    {jogDistances.map(distance =>
      <button
        type={"button"}
        className={"fb-button gray"}
        disabled={!props.movementAvailable}
        key={distance}
        onClick={() => jog(distance)}>
        {distance > 0 ? `+${distance}` : distance}
      </button>)}
    {props.direction == 1 &&
      <button
        type={"button"}
        className={"fb-button gray"}
        disabled={!props.movementAvailable || !props.commandPosition}
        onClick={moveToMax}>
        {t("Max")}
      </button>}
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
  const [settingsOpen, setSettingsOpen] = React.useState(false);
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
  if (settingsOpen) {
    return <NativeJogEncoderSettingsPopup
      axis={props.axis}
      config={props.config}
      direction={props.direction}
      dispatch={props.context.dispatch}
      encoderVisibility={props.encoderVisibility}
      onClose={() => setSettingsOpen(false)} />;
  }
  return <ThreeDPopup
    name={`bot-jog-${props.axis}-popup`}
    position={popupPosition(props.config, props.axis, props.direction)}
    title={title}
    headerActions={
      <button
        type={"button"}
        className={"fa fa-cog fb-icon-button invert"}
        title={t("encoder display settings")}
        onClick={() => setSettingsOpen(true)} />
    }
    onClose={props.onClose}>
    <NativeJogActionButtons
      axis={props.axis}
      commandPosition={commandPosition}
      config={props.config}
      direction={props.direction}
      movementAvailable={movementAvailable} />
    <div className={"native-jog-position-row"}>
      <label htmlFor={`native-jog-${props.axis}-target`}>
        {t("{{axis}} axis position", {
          axis: props.axis.toUpperCase(),
        })}
      </label>
      <input
        id={`native-jog-${props.axis}-target`}
        type={"number"}
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
  deviceDirection: NativeJogDirection;
  enabled: boolean;
  name: string;
  onActivate(): void;
  renderDirection: NativeJogDirection;
}

const NativeJogArrow = (props: NativeJogArrowProps) =>
  <ControlHandle
    name={`${props.name}-${
      props.deviceDirection == 1 ? "positive" : "negative"}`}
    enabled={props.enabled}
    onActivate={props.onActivate}>
    {state => <ControlArrow
      name={`${props.name}-${
        props.deviceDirection == 1 ? "plus" : "minus"}-arrow`}
      start={[0, 0, 0]}
      end={axisPoint(
        props.axis,
        props.renderDirection * NATIVE_JOG_ARROW_LENGTH,
      )}
      heads={"end"}
      width={NATIVE_JOG_ARROW_WIDTH}
      color={NATIVE_JOG_COLOR}
      hoverColor={NATIVE_JOG_HOVER_COLOR}
      hovered={state.hovered}
      renderOnTop={true} />}
  </ControlHandle>;

export interface NativeJogControlPairProps {
  axis: Xyz;
  axisActions?: NativeJogAxisActionsContext;
  axisActionsSelected?: boolean;
  config: NativeJogConfig;
  encoderData?: NativeJogEncoderData;
  encoderVisibility?: NativeJogEncoderVisibility;
  name: string;
  onClose(): void;
  onSelect(direction: NativeJogDirection): void;
  onSelectAxisActions?(): void;
  position: ControlPoint;
  positionStore: BotPositionSnapshotStore;
  selectedDirection?: NativeJogDirection;
}

export const NativeJogControlPair = (
  props: NativeJogControlPairProps,
) => {
  const movementAvailable = nativeJogMovementAvailable(props.axisActions);
  return <Group name={props.name} position={props.position}>
    <ControlHandle
      name={`${props.name}-center`}
      enabled={!!props.axisActions && !!props.onSelectAxisActions}
      onActivate={props.onSelectAxisActions}>
      {state => <ControlSphere
        name={`${props.name}-sphere`}
        radius={NATIVE_JOG_SPHERE_RADIUS}
        color={NATIVE_JOG_COLOR}
        hoverColor={NATIVE_JOG_HOVER_COLOR}
        hovered={state.hovered}
        active={props.axisActionsSelected}
        renderOnTop={true} />}
    </ControlHandle>
    <NativeJogArrow
      axis={props.axis}
      deviceDirection={-1}
      enabled={movementAvailable}
      name={props.name}
      onActivate={() => props.onSelect(-1)}
      renderDirection={getNativeJogRenderDirection(
        props.config, props.axis, -1)} />
    <NativeJogArrow
      axis={props.axis}
      deviceDirection={1}
      enabled={movementAvailable}
      name={props.name}
      onActivate={() => props.onSelect(1)}
      renderDirection={getNativeJogRenderDirection(
        props.config, props.axis, 1)} />
    {props.selectedDirection && props.axisActions &&
      <NativeJogPopup
        axis={props.axis}
        config={props.config}
        context={props.axisActions}
        direction={props.selectedDirection}
        encoderData={props.encoderData}
        encoderVisibility={props.encoderVisibility}
        onClose={props.onClose}
        positionStore={props.positionStore} />}
    {props.axisActionsSelected && props.axisActions &&
      <NativeJogAxisActionsPopup
        axis={props.axis}
        context={props.axisActions}
        onClose={props.onClose} />}
  </Group>;
};
