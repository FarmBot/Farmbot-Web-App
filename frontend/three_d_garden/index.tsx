import { Canvas } from "@react-three/fiber";
import * as ReactThreeFiber from "@react-three/fiber";
import React from "react";
import { Config, PositionConfig } from "./config";
import {
  FarmDesignerViewPrism, GardenModel, getViewPrismCameraProjection,
  ViewPrismBridge, VIEW_PRISM_VIEWPORT_SIZE,
} from "./garden_model";
import { NORMAL_CAMERA_FOV } from "./camera";
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
  TaggedPeripheral,
  TaggedSceneObject,
} from "farmbot";
import { SlotWithTool } from "../resources/interfaces";
import { TaggedPlant } from "../farm_designer/map/interfaces";
import { ThreeDGardenPlant } from "./garden";
import { perfMark, usePerfRenderCount } from "../performance/perf";
import { BotPosition, BotState, UserEnv } from "../devices/interfaces";
import { MovementState, TimeSettings } from "../interfaces";
import { PeripheralValues } from
  "../farm_designer/map/layers/farmbot/bot_trail";
import { HighlightProvider } from "./elements";
import {
  PanelCameraController, PanelCameraStore,
} from "./panel_camera";
import { filterSectionIntersections } from "./section";

const sectionAwareEvents: typeof ReactThreeFiber.events = store => ({
  ...ReactThreeFiber.events(store),
  filter: filterSectionIntersections,
});

export interface ThreeDGardenProps {
  config: Config;
  configPosition: PositionConfig;
  panelCameraStore: PanelCameraStore;
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
  peripherals?: TaggedPeripheral[];
  peripheralValues?: PeripheralValues;
  env?: UserEnv;
  set3DConfigValue?(key: keyof Config, value: string): void;
  sceneObjects: TaggedSceneObject[];
}

interface ViewPrismViewportProps {
  bridgeRef: React.RefObject<ViewPrismBridge | null>;
}

export const ViewPrismViewport = (props: ViewPrismViewportProps) => {
  const viewPrismCamera = getViewPrismCameraProjection(
    VIEW_PRISM_VIEWPORT_SIZE,
    NORMAL_CAMERA_FOV,
  );
  return <div
    className={"view-prism-viewport"}
    style={{
      width: VIEW_PRISM_VIEWPORT_SIZE,
      height: VIEW_PRISM_VIEWPORT_SIZE,
    }}
    aria-hidden={true}>
    <Canvas
      gl={{ alpha: true }}
      camera={{
        position: [0, 0, viewPrismCamera.distance],
        fov: NORMAL_CAMERA_FOV,
        near: viewPrismCamera.near,
        far: viewPrismCamera.far,
      }}>
      <FarmDesignerViewPrism bridgeRef={props.bridgeRef} />
    </Canvas>
  </div>;
};

export const ThreeDGarden = React.memo((props: ThreeDGardenProps) => {
  usePerfRenderCount("ThreeDGarden");
  const viewPrismBridgeRef = React.useRef<ViewPrismBridge | null>({});
  React.useEffect(() => {
    perfMark("three_d_garden_mounted");
  }, []);
  return <div className={"three-d-garden"}>
    <div className={"garden-bed-3d-model"}>
      <Canvas
        events={sectionAwareEvents}
        shadows={props.config.lowDetail ? false : "variance"}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          perfMark("canvas_created");
        }}>
        <HighlightProvider highlighted3DObject={
          props.addPlantProps.designer.highlighted3DObject}>
          <GardenModel
            config={props.config}
            configPosition={props.configPosition}
            panelCamera={true}
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
            peripherals={props.peripherals}
            peripheralValues={props.peripheralValues}
            env={props.env}
            set3DConfigValue={props.set3DConfigValue}
            sceneObjects={props.sceneObjects}
            viewPrismBridgeRef={viewPrismBridgeRef}
            addPlantProps={props.addPlantProps} />
        </HighlightProvider>
        <PanelCameraController store={props.panelCameraStore} />
      </Canvas>
    </div>
    {props.config.viewCube &&
      <ViewPrismViewport
        bridgeRef={viewPrismBridgeRef} />}
  </div>;
});

ThreeDGarden.displayName = "ThreeDGarden";
