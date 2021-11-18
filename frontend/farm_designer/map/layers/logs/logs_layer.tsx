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
  [RenderedLog.findHome]: "Finding home",
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
  [RenderedLog.findHome]: AnimationClass.find,
};

const ANIMATION_DURATION_LOOKUP =
  (target: string): Record<RenderedLog, number> => {
    const slow = target == "rpi";
    return {
      [RenderedLog.imageCapture]: slow ? 10 : 5,
      [RenderedLog.imageCalibrate]: slow ? 60 : 15,
      [RenderedLog.imageDetect]: slow ? 60 : 15,
      [RenderedLog.imageMeasure]: slow ? 60 : 15,
      [RenderedLog.findHome]: 10,
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
    case RenderedLog.findHome:
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
    {display && positionDifferent(props.botPosition, { x: 0, y: 0, z: 0 }, 5)
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
