import { isUndefined } from "lodash";
import React from "react";
import { BotPosition } from "../../../../devices/interfaces";
import { BooleanSetting } from "../../../../session_keys";
import { Color } from "../../../../ui";
import { BotFigure, CameraViewArea } from "../farmbot/bot_figure";
import {
  RenderedLog, AnimationClass, LogsLayerProps, LogVisualProps,
} from "./interfaces";

const LOG_MESSAGE_LOOKUP: Record<RenderedLog, string> = {
  [RenderedLog.imageCapture]: "Taking photo",
  [RenderedLog.imageCalibrate]: "Calibrating camera",
  [RenderedLog.imageDetect]: "Running weed detector",
  [RenderedLog.imageMeasure]: "Executing Measure Soil Height",
  [RenderedLog.findHomeAll]: "Finding home on all axes",
  [RenderedLog.findHomeX]: "Finding home on the X axis",
  [RenderedLog.findHomeY]: "Finding home on the Y axis",
  [RenderedLog.findHomeZ]: "Finding home on the Z axis",
  [RenderedLog.findLengthAll]: "Finding length of all axes",
  [RenderedLog.findLengthX]: "Determining length of the X axis",
  [RenderedLog.findLengthY]: "Determining length of the Y axis",
  [RenderedLog.findLengthZ]: "Determining length of the Z axis",
};

const LOG_VISUAL_LOOKUP: Record<string, RenderedLog> = {};
Object.entries(LOG_MESSAGE_LOOKUP)
  .map(([visual, message]: [RenderedLog, string]) =>
    LOG_VISUAL_LOOKUP[message] = visual);

const ANIMATION_CLASS_LOOKUP: Record<RenderedLog, AnimationClass> = {
  [RenderedLog.imageCapture]: AnimationClass.capture,
  [RenderedLog.imageCalibrate]: AnimationClass.scan,
  [RenderedLog.imageDetect]: AnimationClass.scan,
  [RenderedLog.imageMeasure]: AnimationClass.scan,
  [RenderedLog.findHomeAll]: AnimationClass.find,
  [RenderedLog.findHomeX]: AnimationClass.find,
  [RenderedLog.findHomeY]: AnimationClass.find,
  [RenderedLog.findHomeZ]: AnimationClass.find,
  [RenderedLog.findLengthAll]: AnimationClass.find,
  [RenderedLog.findLengthX]: AnimationClass.find,
  [RenderedLog.findLengthY]: AnimationClass.find,
  [RenderedLog.findLengthZ]: AnimationClass.find,
};

const ANIMATION_DURATION_LOOKUP =
  (target: string): Record<RenderedLog, number> => {
    const slow = target == "rpi";
    return {
      [RenderedLog.imageCapture]: slow ? 10 : 5,
      [RenderedLog.imageCalibrate]: slow ? 60 : 15,
      [RenderedLog.imageDetect]: slow ? 60 : 15,
      [RenderedLog.imageMeasure]: slow ? 60 : 15,
      [RenderedLog.findHomeAll]: 20,
      [RenderedLog.findHomeX]: 10,
      [RenderedLog.findHomeY]: 10,
      [RenderedLog.findHomeZ]: 10,
      [RenderedLog.findLengthAll]: 20,
      [RenderedLog.findLengthX]: 10,
      [RenderedLog.findLengthY]: 10,
      [RenderedLog.findLengthZ]: 10,
    };
  };

export const LogsLayer = (props: LogsLayerProps) =>
  <g id="logs-layer" className="logs-layer">
    {props.visible &&
      props.logs
        .filter(log => !log.body.id // new logs
          && Object.values(LOG_MESSAGE_LOOKUP).includes(log.body.message))
        .map(log =>
          <LogVisual key={log.uuid}
            log={log}
            visual={LOG_VISUAL_LOOKUP[log.body.message]}
            cropImage={!!props.getConfigValue(BooleanSetting.crop_images)}
            showUncroppedArea={!!props.getConfigValue(
              BooleanSetting.show_uncropped_camera_view_area)}
            animate={!props.getConfigValue(BooleanSetting.disable_animations)}
            cameraCalibrationData={props.cameraCalibrationData}
            deviceTarget={props.deviceTarget}
            botPosition={props.botPosition}
            plantAreaOffset={props.plantAreaOffset}
            mapTransformProps={props.mapTransformProps} />)}
  </g>;

export const LogVisual = (props: LogVisualProps) => {
  switch (props.visual) {
    case RenderedLog.imageCapture:
    case RenderedLog.imageCalibrate:
    case RenderedLog.imageDetect:
    case RenderedLog.imageMeasure:
      return <ImageVisual {...props} />;
    case RenderedLog.findHomeAll:
    case RenderedLog.findHomeX:
    case RenderedLog.findHomeY:
    case RenderedLog.findHomeZ:
    case RenderedLog.findLengthAll:
    case RenderedLog.findLengthX:
    case RenderedLog.findLengthY:
    case RenderedLog.findLengthZ:
      return <MovementVisual {...props} />;
  }
};

const ImageVisual = (props: LogVisualProps) => {
  const { x, y, z } = props.log.body;
  const fadeDelay = ANIMATION_DURATION_LOOKUP(props.deviceTarget)[props.visual];
  const fadeDuration = 0.5;
  const [display, setDisplay] = React.useState(true);
  setTimeout(() => setDisplay(false), (fadeDelay + fadeDuration) * 1000);
  const className = [
    ANIMATION_CLASS_LOOKUP[props.visual],
    props.animate ? "animate" : "",
  ].join(" ");
  const style = props.animate
    ? { animation: `fade-out ${fadeDuration}s ease ${fadeDelay}s forwards` }
    : {};
  return <g id={`image-log-${props.log.uuid}-visual`}
    className={className} style={style}>
    {display && <CameraViewArea logVisual={true}
      position={{ x, y, z }}
      cropPhotos={props.cropImage}
      showUncroppedArea={props.showUncroppedArea}
      cameraCalibrationData={props.cameraCalibrationData}
      mapTransformProps={props.mapTransformProps} />}
  </g>;
};

const MovementVisual = (props: LogVisualProps) => {
  const fadeDelay = ANIMATION_DURATION_LOOKUP(props.deviceTarget)[props.visual];
  const fadeDuration = 0.5;
  const [display, setDisplay] = React.useState(true);
  setTimeout(() => setDisplay(false), (fadeDelay + fadeDuration) * 1000);
  const className = [
    ANIMATION_CLASS_LOOKUP[props.visual],
    props.animate ? "animate" : "",
  ].join(" ");
  const style = props.animate
    ? { animation: `fade-out ${fadeDuration}s ease ${fadeDelay}s forwards` }
    : {};
  return <g id={`movement-log-${props.log.uuid}-visual`}
    className={className} style={style}>
    {display && awayFromHome(props.botPosition, 5)
      && <BotFigure figureName={"finding-home"}
        color={Color.yellow}
        position={{ x: 0, y: 0, z: 0 }}
        mapTransformProps={props.mapTransformProps}
        plantAreaOffset={props.plantAreaOffset} />}
  </g>;
};

export const positionDifferent =
  (botPosition0: BotPosition, botPosition1: BotPosition, threshold = 0) => {
    if (isUndefined(botPosition0.x)
      || isUndefined(botPosition0.y)
      || isUndefined(botPosition0.z)
      || isUndefined(botPosition1.x)
      || isUndefined(botPosition1.y)
      || isUndefined(botPosition1.z)) { return false; }
    const xDelta = Math.abs(botPosition1.x - botPosition0.x);
    const yDelta = Math.abs(botPosition1.y - botPosition0.y);
    const zDelta = Math.abs(botPosition1.z - botPosition0.z);
    return xDelta > threshold
      || yDelta > threshold
      || zDelta > threshold;
  };

export const awayFromHome = (botPosition: BotPosition, threshold = 0) =>
  positionDifferent(botPosition, { x: 0, y: 0, z: 0 }, threshold);
