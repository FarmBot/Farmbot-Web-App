import { Canvas } from "@react-three/fiber";
import React from "react";
import { Config, PositionConfig } from "./config";
import { GardenModel } from "./garden_model";
import { noop } from "lodash";
import { AddPlantProps } from "./bed";
import {
  TaggedGenericPointer, TaggedImage, TaggedPoint, TaggedPointGroup,
  TaggedSensor,
  TaggedSensorReading,
  TaggedDevice,
  TaggedFbosConfig,
  TaggedSequence,
  TaggedTool,
  TaggedWeedPointer,
} from "farmbot";
import { SlotWithTool } from "../resources/interfaces";
import { TaggedPlant } from "../farm_designer/map/interfaces";
import { ThreeDGardenPlant } from "./garden";
import { perfMark, usePerfRenderCount } from "../performance/perf";
import { BotPosition, BotState, UserEnv } from "../devices/interfaces";
import { MovementState, TimeSettings } from "../interfaces";

export interface ThreeDGardenProps {
  config: Config;
  configPosition: PositionConfig;
  threeDPlants: ThreeDGardenPlant[];
  plants?: TaggedPlant[];
  addPlantProps: AddPlantProps;
  mapPoints: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  toolSlots?: SlotWithTool[];
  tools?: TaggedTool[];
  sequences?: TaggedSequence[];
  fbosConfig?: TaggedFbosConfig;
  timeSettings?: TimeSettings;
  botOnline?: boolean;
  arduinoBusy?: boolean;
  currentBotLocation?: BotPosition;
  movementState?: MovementState;
  defaultAxes?: string;
  noUTM?: boolean;
  deviceAccount?: TaggedDevice;
  bot?: BotState;
  mountedToolName?: string;
  allPoints?: TaggedPoint[];
  groups?: TaggedPointGroup[];
  images?: TaggedImage[];
  sensorReadings?: TaggedSensorReading[];
  sensors?: TaggedSensor[];
  env?: UserEnv;
  set3DConfigValue?(key: keyof Config, value: string): void;
}

export const ThreeDGarden = React.memo((props: ThreeDGardenProps) => {
  usePerfRenderCount("ThreeDGarden");
  React.useEffect(() => {
    perfMark("three_d_garden_mounted");
  }, []);
  return <div className={"three-d-garden"}>
    <div className={"garden-bed-3d-model"}>
      <Canvas
        shadows={props.config.lowDetail ? false : "variance"}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          perfMark("canvas_created");
        }}>
        <GardenModel
          config={props.config}
          configPosition={props.configPosition}
          threeDPlants={props.threeDPlants}
          plants={props.plants}
          activeFocus={""}
          setActiveFocus={noop}
          mapPoints={props.mapPoints}
          weeds={props.weeds}
          toolSlots={props.toolSlots}
          tools={props.tools}
          sequences={props.sequences}
          fbosConfig={props.fbosConfig}
          timeSettings={props.timeSettings}
          botOnline={props.botOnline}
          arduinoBusy={props.arduinoBusy}
          currentBotLocation={props.currentBotLocation}
          movementState={props.movementState}
          defaultAxes={props.defaultAxes}
          noUTM={props.noUTM}
          deviceAccount={props.deviceAccount}
          bot={props.bot}
          mountedToolName={props.mountedToolName}
          allPoints={props.allPoints}
          groups={props.groups}
          images={props.images}
          sensorReadings={props.sensorReadings}
          sensors={props.sensors}
          env={props.env}
          set3DConfigValue={props.set3DConfigValue}
          addPlantProps={props.addPlantProps} />
      </Canvas>
    </div>
  </div>;
});

ThreeDGarden.displayName = "ThreeDGarden";
