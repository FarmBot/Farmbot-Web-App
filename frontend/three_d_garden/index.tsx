import { Canvas } from "@react-three/fiber";
import React from "react";
import { Config } from "./config";
import { GardenModel } from "./garden_model";
import { noop } from "lodash";
import { AddPlantProps } from "./bed";
import {
  TaggedGenericPointer, TaggedImage, TaggedPoint, TaggedPointGroup,
  TaggedSensor,
  TaggedSensorReading,
  TaggedWeedPointer,
} from "farmbot";
import { SlotWithTool } from "../resources/interfaces";
import { NavigateFunction } from "react-router";
import { FilePath, Path } from "../internal_urls";
import { t } from "../i18next_wrapper";
import { Actions, Content, DeviceSetting } from "../constants";
import { isMobile } from "../screen_size";
import { Help } from "../ui";
import { BooleanSetting } from "../session_keys";
import { LayerToggle } from "../farm_designer/map/legend/layer_toggle";
import { setWebAppConfigValue } from "../config_storage/actions";
import { DesignerState } from "../farm_designer/interfaces";
import { setPanelOpen } from "../farm_designer/panel_header";
import { ThreeDGardenPlant } from "./garden";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { shouldEnableProfiler } from "../util/performance_profiler_settings";
import { recordReactCommit } from "../util/performance_profiler_metrics";

export interface ThreeDGardenProps {
  config: Config;
  threeDPlants: ThreeDGardenPlant[];
  showSpread?: boolean;
  addPlantProps: AddPlantProps;
  mapPoints: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  toolSlots?: SlotWithTool[];
  mountedToolName?: string;
  allPoints?: TaggedPoint[];
  groups?: TaggedPointGroup[];
  images?: TaggedImage[];
  sensorReadings?: TaggedSensorReading[];
  sensors?: TaggedSensor[];
}

export const shouldAnimateThreeDGarden = (
  config: Config,
  profilerEnabled: boolean,
) =>
  profilerEnabled
  || config.animateSeasons
  || (config.animate && config.clouds)
  || config.lightsDebug
  || config.rotary !== 0
  || config.trail
  || config.vacuum
  || config.waterFlow;

export const ThreeDGarden = React.memo((props: ThreeDGardenProps) => {
  const profilerEnabled = shouldEnableProfiler();
  const shouldAnimate = shouldAnimateThreeDGarden(
    props.config,
    profilerEnabled,
  );
  const onRender = React.useCallback<React.ProfilerOnRenderCallback>((
    id,
    _phase,
    actualDuration,
  ) => {
    recordReactCommit(id, actualDuration);
  }, []);
  return <div className={"three-d-garden"}>
    <div className={"garden-bed-3d-model"}>
      <React.Suspense
        fallback={
          <div className={"three-d-garden-loading-container"}>
            <img className={"three-d-garden-loading-image"}
              src={FilePath.THREE_D_GARDEN_LOADING}
              alt={"Loading 3D interactive experience..."} />
            <h1 className={"three-d-garden-loading-text"}>
              {t("Loading interactive 3D FarmBot...")}
            </h1>
          </div>}>
        <Canvas
          frameloop={"demand"}
          shadows={"variance"}
          onCreated={({ gl }) => {
            gl.localClippingEnabled = true;
          }}>
          {profilerEnabled
            ? <React.Profiler id={"ThreeDGarden"} onRender={onRender}>
              <GardenModel
                config={props.config}
                showSpread={props.showSpread}
                shouldAnimate={shouldAnimate}
                threeDPlants={props.threeDPlants}
                activeFocus={""}
                setActiveFocus={noop}
                mapPoints={props.mapPoints}
                weeds={props.weeds}
                toolSlots={props.toolSlots}
                mountedToolName={props.mountedToolName}
                allPoints={props.allPoints}
                groups={props.groups}
                images={props.images}
                sensorReadings={props.sensorReadings}
                sensors={props.sensors}
                addPlantProps={props.addPlantProps} />
            </React.Profiler>
            : <GardenModel
              config={props.config}
              showSpread={props.showSpread}
              shouldAnimate={shouldAnimate}
              threeDPlants={props.threeDPlants}
              activeFocus={""}
              setActiveFocus={noop}
              mapPoints={props.mapPoints}
              weeds={props.weeds}
              toolSlots={props.toolSlots}
              mountedToolName={props.mountedToolName}
              allPoints={props.allPoints}
              groups={props.groups}
              images={props.images}
              sensorReadings={props.sensorReadings}
              sensors={props.sensors}
              addPlantProps={props.addPlantProps} />}
        </Canvas>
      </React.Suspense>
    </div>
  </div>;
});

export interface ThreeDGardenToggleProps {
  navigate: NavigateFunction;
  dispatch: Function;
  designer: DesignerState;
  threeDGarden: boolean;
  device: DeviceAccountSettings;
}

// eslint-disable-next-line complexity
export const ThreeDGardenToggle = (props: ThreeDGardenToggleProps) => {
  const { navigate, dispatch, threeDGarden } = props;
  const topDown = props.designer.threeDTopDownView;
  const exaggeratedZ = props.designer.threeDExaggeratedZ;
  const description = isMobile()
    ? Content.SHOW_3D_VIEW_DESCRIPTION_MOBILE
    : Content.SHOW_3D_VIEW_DESCRIPTION_DESKTOP;
  return <div className={"three-d-map-toggle-menu row"}>
    {threeDGarden &&
      <button className={"fb-button gray"}
        title={t("3D Settings")}
        onClick={() => {
          dispatch(setPanelOpen(true));
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
          <Help
            text={description}
            enableMarkdown={true}
            ariaLabel={`${t(DeviceSetting.show3DMap)} help`} />}
      </div>
      <LayerToggle
        settingName={BooleanSetting.three_d_garden}
        value={threeDGarden}
        label={DeviceSetting.axisHeadingLabels}
        onClick={() => dispatch(setWebAppConfigValue(
          BooleanSetting.three_d_garden, !threeDGarden))} />
    </div>
  </div>;
};
