import React from "react";
import { VirtualFarmBotProps } from "../../interfaces";
import { BooleanSetting } from "../../../../session_keys";
import { BotFigure } from "./bot_figure";
import { BotTrail } from "./bot_trail";
import { BotPeripherals } from "./bot_peripherals";
import { NegativePositionLabel } from "./negative_position_labels";

export function VirtualFarmBot(props: VirtualFarmBotProps) {
  const {
    mapTransformProps, plantAreaOffset, peripheralValues, eStopStatus,
    getConfigValue,
  } = props;
  const displayTrail = !!getConfigValue(BooleanSetting.display_trail);
  const displayMissedSteps =
    !!getConfigValue(BooleanSetting.display_map_missed_steps);
  const encoderFigure = !!getConfigValue(BooleanSetting.encoder_figure);
  const cameraViewArea = !!getConfigValue(BooleanSetting.show_camera_view_area);
  const showUncroppedArea = !!getConfigValue(
    BooleanSetting.show_uncropped_camera_view_area);
  const cropPhotos = !!getConfigValue(BooleanSetting.crop_images);

  return <g id="virtual-farmbot">
    <NegativePositionLabel
      position={props.botLocationData.position}
      mapTransformProps={mapTransformProps}
      plantAreaOffset={plantAreaOffset} />
    <BotPeripherals
      position={props.botLocationData.position}
      mapTransformProps={mapTransformProps}
      plantAreaOffset={plantAreaOffset}
      peripheralValues={peripheralValues}
      getConfigValue={getConfigValue} />
    <BotFigure figureName={"motor-position"}
      position={props.botLocationData.position}
      mapTransformProps={mapTransformProps}
      plantAreaOffset={plantAreaOffset}
      mountedToolInfo={props.mountedToolInfo}
      cameraCalibrationData={props.cameraCalibrationData}
      cameraViewArea={cameraViewArea}
      cropPhotos={cropPhotos}
      showUncroppedArea={showUncroppedArea}
      eStopStatus={eStopStatus} />
    {encoderFigure &&
      <BotFigure figureName={"encoder-position"}
        position={props.botLocationData.scaled_encoders}
        mapTransformProps={mapTransformProps}
        plantAreaOffset={plantAreaOffset} />}
    {displayTrail &&
      <BotTrail
        position={props.botLocationData.position}
        missedSteps={props.botLocationData.load}
        displayMissedSteps={displayMissedSteps}
        mapTransformProps={mapTransformProps}
        peripheralValues={peripheralValues} />}
  </g>;
}
