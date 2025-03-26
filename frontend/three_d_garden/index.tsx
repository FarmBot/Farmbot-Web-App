import { Canvas } from "@react-three/fiber";
import React from "react";
import { Config } from "./config";
import { GardenModel } from "./garden_model";
import { noop } from "lodash";
import { AddPlantProps } from "./bed";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import { SlotWithTool } from "../resources/interfaces";
import { NavigateFunction } from "react-router";
import { Path } from "../internal_urls";
import { t } from "../i18next_wrapper";
import { Actions, Content, DeviceSetting } from "../constants";
import { isMobile } from "../screen_size";
import { Help } from "../ui";
import { BooleanSetting } from "../session_keys";
import { LayerToggle } from "../farm_designer/map/legend/layer_toggle";
import { setWebAppConfigValue } from "../config_storage/actions";
import { DesignerState } from "../farm_designer/interfaces";

export interface ThreeDGardenProps {
  config: Config;
  addPlantProps: AddPlantProps;
  mapPoints: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  toolSlots?: SlotWithTool[];
  mountedToolName?: string;
}

export const ThreeDGarden = (props: ThreeDGardenProps) => {
  return <div className={"three-d-garden"}>
    <div className={"garden-bed-3d-model"}>
      <Canvas shadows={true}>
        <GardenModel
          config={props.config}
          activeFocus={""}
          setActiveFocus={noop}
          mapPoints={props.mapPoints}
          weeds={props.weeds}
          toolSlots={props.toolSlots}
          mountedToolName={props.mountedToolName}
          addPlantProps={props.addPlantProps} />
      </Canvas>
    </div>
  </div>;
};

export interface ThreeDGardenToggleProps {
  navigate: NavigateFunction;
  dispatch: Function;
  designer: DesignerState;
  threeDGarden: boolean;
}

export const ThreeDGardenToggle = (props: ThreeDGardenToggleProps) => {
  const { navigate, dispatch, threeDGarden } = props;
  const topDown = props.designer.threeDTopDownView;
  const description = isMobile()
    ? Content.SHOW_3D_VIEW_DESCRIPTION_MOBILE
    : Content.SHOW_3D_VIEW_DESCRIPTION_DESKTOP;
  return <div className={"three-d-map-toggle-menu grid"}>
    {threeDGarden
      ? <>
        <button className={"fb-button gray"}
          title={t("3D Settings")}
          onClick={() => { navigate(Path.settings("3d_garden")); }}>
          <i className={"fa fa-cog"} />
        </button>
        <button className={"fb-button gray"}
          title={t("3D View")}
          onClick={() => dispatch({
            type: Actions.TOGGLE_3D_TOP_DOWN_VIEW,
            payload: false,
          })}>
          <i className={"fa fa-cube"} />
        </button>
        <button className={["fb-button gray", topDown ? "active" : ""].join(" ")}
          title={t("Top down View")}
          onClick={() => dispatch({
            type: Actions.TOGGLE_3D_TOP_DOWN_VIEW,
            payload: true,
          })}>
          <i className={"fa fa-th"} />
        </button>
      </>
      : <>
        <div />
        <div />
        <div />
      </>}
    <div className={"three-d-map-toggle grid"}>
      <label>{t(DeviceSetting.show3DMap)}</label>
      {threeDGarden
        ? <Help text={description} enableMarkdown={true} />
        : <div />}
      <LayerToggle
        settingName={BooleanSetting.three_d_garden}
        value={threeDGarden}
        label={DeviceSetting.axisHeadingLabels}
        onClick={() => dispatch(setWebAppConfigValue(
          BooleanSetting.three_d_garden, !threeDGarden))} />
    </div>
  </div>;
};
