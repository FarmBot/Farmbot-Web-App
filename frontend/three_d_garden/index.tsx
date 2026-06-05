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
import { NavigateFunction } from "react-router";
import { Path } from "../internal_urls";
import { t } from "../i18next_wrapper";
import { Actions, Content, DeviceSetting } from "../constants";
import { isMobile } from "../screen_size";
import { BooleanSetting } from "../session_keys";
import {
  GetWebAppConfigValue, setWebAppConfigValue,
} from "../config_storage/actions";
import { DesignerState } from "../farm_designer/interfaces";
import { TaggedPlant } from "../farm_designer/map/interfaces";
import { ThreeDGardenPlant } from "./garden";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { isTopDown } from "./helpers";
import { perfMark, usePerfRenderCount } from "../performance/perf";
import { setPanelOpen3D } from "./panel_actions";
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
          addPlantProps={props.addPlantProps} />
      </Canvas>
    </div>
  </div>;
});

ThreeDGarden.displayName = "ThreeDGarden";

export interface ThreeDGardenToggleProps {
  navigate: NavigateFunction;
  dispatch: Function;
  designer: DesignerState;
  threeDGarden: boolean;
  device: DeviceAccountSettings;
  getConfigValue: GetWebAppConfigValue;
}

interface ThreeDControlsHelpProps {
  text: string;
  ariaLabel: string;
}

const ThreeDControlsHelp = (props: ThreeDControlsHelpProps) => {
  const [open, setOpen] = React.useState(false);
  const lines = props.text.trim().split("\n").map(line => line.trim());
  const title = lines[0].replace(/\*/g, "");
  const items = lines.slice(1).map(line => line.replace(/^-\s*/, ""));
  return <span className={"help three-d-controls-help"}>
    <i
      title={title}
      role={"tooltip"}
      aria-label={props.ariaLabel}
      className={"fa fa-question-circle help-icon"}
      onClick={() => setOpen(!open)} />
    {open &&
      <div className={"help-text-content"}>
        <strong>{title}</strong>
        <ul>
          {items.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>}
  </span>;
};

interface ThreeDLayerToggleProps {
  value: boolean;
  getConfigValue: GetWebAppConfigValue;
  onClick(): void;
}

const ThreeDLayerToggle = (props: ThreeDLayerToggleProps) => {
  const label = DeviceSetting.axisHeadingLabels;
  const classNames = [
    "fb-button",
    "fb-toggle-button",
    "fb-layer-toggle",
    props.value ? "green" : "red",
    props.value && props.getConfigValue(BooleanSetting.highlight_modified_settings)
      ? "modified"
      : "",
  ].join(" ");
  return <fieldset>
    <label>
      <span>{t(label)}</span>
    </label>
    <button className={classNames} onClick={props.onClick}
      title={`${props.value ? t("hide") : t("show")} ${t(label.replace("?", ""))}`} />
  </fieldset>;
};

// eslint-disable-next-line complexity
export const ThreeDGardenToggle = (props: ThreeDGardenToggleProps) => {
  const { navigate, dispatch, threeDGarden } = props;
  const topDown = isTopDown(props.designer, props.getConfigValue);
  const exaggeratedZ = props.designer.threeDExaggeratedZ;
  const description = isMobile()
    ? Content.SHOW_3D_VIEW_DESCRIPTION_MOBILE
    : Content.SHOW_3D_VIEW_DESCRIPTION_DESKTOP;
  return <div className={"three-d-map-toggle-menu row"}>
    {threeDGarden &&
      <button className={"fb-button gray"}
        title={t("3D Settings")}
        onClick={() => {
          dispatch(setPanelOpen3D(true));
          navigate(Path.settings("3d_garden"));
        }}>
        <i className={"fa fa-cog"} />
      </button>}
    {threeDGarden &&
      <button className={"fb-button gray"}
        title={exaggeratedZ ? t("normal z") : t("exaggerated z")}
        onClick={() => dispatch({
          type: Actions.TOGGLE_3D_EXAGGERATED_Z,
          payload: !exaggeratedZ,
        })}>
        <i className={[
          "fa",
          exaggeratedZ
            ? "fa-angle-up"
            : "fa-angle-double-up",
        ].join(" ")} />
      </button>}
    {threeDGarden &&
      <button className={"fb-button gray"}
        title={topDown ? t("3D View") : t("Top down View")}
        onClick={() => dispatch({
          type: Actions.TOGGLE_3D_TOP_DOWN_VIEW,
          payload: !topDown,
        })}>
        <i className={`fa ${topDown ? "fa-cube" : "fa-th"}`} />
      </button>}
    <div className={"three-d-map-toggle row"}>
      <div className={"row half-gap"}>
        <label>{t(DeviceSetting.show3DMap)}</label>
        {threeDGarden &&
          <ThreeDControlsHelp
            text={description}
            ariaLabel={`${t(DeviceSetting.show3DMap)} help`} />}
      </div>
      <ThreeDLayerToggle
        value={threeDGarden}
        getConfigValue={props.getConfigValue}
        onClick={() => dispatch(setWebAppConfigValue(
          BooleanSetting.three_d_garden, !threeDGarden))} />
    </div>
  </div>;
};
