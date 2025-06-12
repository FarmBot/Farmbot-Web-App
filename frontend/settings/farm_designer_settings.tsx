import React from "react";
import { Content, DeviceSetting } from "../constants";
import { t } from "../i18next_wrapper";
import { setWebAppConfigValue } from "../config_storage/actions";
import { Help, ToggleButton, BlurableInput } from "../ui";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { resetVirtualTrail } from "../farm_designer/map/layers/farmbot/bot_trail";
import { MapSizeInputs } from "../farm_designer/map_size_setting";
import { isUndefined } from "lodash";
import { Collapse } from "@blueprintjs/core";
import { Header } from "./hardware_settings/header";
import { Highlight } from "./maybe_highlight";
import {
  DesignerSettingsSectionProps, SettingProps,
  DesignerSettingsPropsBase, SettingDescriptionProps, WebAppNumberSettingProps,
} from "./interfaces";
import { getModifiedClassName } from "./default_values";
import { McuParams } from "farmbot";

export const Designer = (props: DesignerSettingsSectionProps) => {
  const { getConfigValue, dispatch, settingsPanelState, firmwareConfig } = props;
  const settingsProps = { getConfigValue, dispatch, firmwareConfig };
  return <Highlight className={"section"} hidden={true}
    settingName={DeviceSetting.farmDesigner}>
    <Header
      title={DeviceSetting.farmDesigner}
      panel={"farm_designer"}
      dispatch={dispatch}
      expanded={settingsPanelState.farm_designer} />
    <Collapse isOpen={!!settingsPanelState.farm_designer}>
      {PlainDesignerSettings(settingsProps, firmwareConfig)}
    </Collapse>
  </Highlight>;
};

export const PlainDesignerSettings = (
  settingsProps: DesignerSettingsPropsBase,
  firmwareConfig: McuParams | undefined,
) =>
  DESIGNER_SETTINGS(settingsProps, firmwareConfig).map(setting =>
    <Setting key={setting.title} {...setting} {...settingsProps}
      useToolTip={true} />);

export const Setting = (props: SettingProps) => {
  const { title, setting, numberSetting, callback, defaultOn } = props;
  const raw_value = setting ? props.getConfigValue(setting) : undefined;
  const value = (defaultOn && isUndefined(raw_value)) ? true : !!raw_value;
  return <Highlight settingName={title}>
    <div
      className={[
        "designer-setting row grid-exp-1",
        props.disabled ? "disabled" : "",
      ].join(" ")}>
      <div>
        <label>{t(title)}</label>
        <Help text={props.description} />
      </div>
      {setting && <ToggleButton
        toggleValue={props.invert ? !value : value}
        toggleAction={() => {
          if (value || !props.confirm || confirm(t(props.confirm))) {
            props.dispatch(setWebAppConfigValue(setting, !value));
            callback?.();
          }
        }}
        title={`${t("toggle")} ${title}`}
        className={getModifiedClassName(setting)}
        customText={{ textFalse: t("off"), textTrue: t("on") }} />}
      {numberSetting && <WebAppNumberSetting {...props}
        numberSetting={numberSetting} />}
      {props.children}
    </div>
  </Highlight>;
};

export const WebAppNumberSetting = (props: WebAppNumberSettingProps) => {
  const { dispatch, getConfigValue, numberSetting } = props;
  return <BlurableInput
    type={"number"}
    wrapperClassName={getModifiedClassName(numberSetting)}
    onCommit={e => dispatch(setWebAppConfigValue(numberSetting,
      parseInt(e.currentTarget.value)))}
    value={parseInt("" + getConfigValue(numberSetting))} />;
};

const DESIGNER_SETTINGS =
  (
    settingsProps: DesignerSettingsPropsBase,
    firmwareConfig: McuParams | undefined,
  ): SettingDescriptionProps[] => ([
    {
      title: DeviceSetting.animations,
      description: Content.PLANT_ANIMATIONS,
      setting: BooleanSetting.disable_animations,
      invert: true
    },
    {
      title: DeviceSetting.trail,
      description: Content.VIRTUAL_TRAIL,
      setting: BooleanSetting.display_trail,
      callback: resetVirtualTrail,
    },
    {
      title: DeviceSetting.mapMissedSteps,
      description: Content.MAP_MISSED_STEPS,
      setting: BooleanSetting.display_map_missed_steps,
      disabled: !settingsProps.getConfigValue(BooleanSetting.display_trail),
    },
    {
      title: DeviceSetting.dynamicMap,
      description: Content.DYNAMIC_MAP_SIZE,
      setting: BooleanSetting.dynamic_map,
    },
    {
      title: DeviceSetting.mapSize,
      description: Content.MAP_SIZE,
      children: <MapSizeInputs {...settingsProps}
        firmwareConfig={firmwareConfig} />,
      disabled: !!settingsProps.getConfigValue(BooleanSetting.dynamic_map),
    },
    {
      title: DeviceSetting.rotateMap,
      description: Content.MAP_SWAP_XY,
      setting: BooleanSetting.xy_swap,
    },
    {
      title: DeviceSetting.mapOrigin,
      description: Content.MAP_ORIGIN,
      children: <OriginSelector {...settingsProps} />
    },
    {
      title: DeviceSetting.cropMapImages,
      description: Content.CROP_MAP_IMAGES,
      setting: BooleanSetting.crop_images,
    },
    {
      title: DeviceSetting.clipPhotosOutOfBounds,
      description: Content.CLIP_PHOTOS_OUT_OF_BOUNDS,
      setting: BooleanSetting.clip_image_layer,
    },
    {
      title: DeviceSetting.cameraView,
      description: Content.SHOW_CAMERA_VIEW_AREA,
      setting: BooleanSetting.show_camera_view_area,
    },
    {
      title: DeviceSetting.uncroppedCameraView,
      description: Content.SHOW_UNCROPPED_CAMERA_VIEW_AREA,
      setting: BooleanSetting.show_uncropped_camera_view_area,
    },
    {
      title: DeviceSetting.defaultPlantDepth,
      description: Content.DEFAULT_PLANT_DEPTH,
      numberSetting: NumericSetting.default_plant_depth,
    },
    {
      title: DeviceSetting.confirmPlantDeletion,
      description: Content.CONFIRM_PLANT_DELETION,
      setting: BooleanSetting.confirm_plant_deletion,
      defaultOn: true,
    },
  ]);

export const OriginSelector = (props: DesignerSettingsPropsBase) => {
  const settingKey = NumericSetting.bot_origin_quadrant;
  const swapXY = props.getConfigValue(BooleanSetting.xy_swap);
  const quadrant = props.getConfigValue(settingKey);
  const update = (value: number) => () =>
    props.dispatch(setWebAppConfigValue(settingKey, value));
  return <div className={[
    "farmbot-origin",
    getModifiedClassName(settingKey),
    swapXY ? "xy-swap" : "",
  ].join(" ")}>
    <div className="quadrants">
      {[2, 1, 3, 4].map(q =>
        <div key={"quadrant_" + q}
          className={`quadrant ${quadrant === q ? "selected" : ""}`}
          onClick={update(q)} />)}
    </div>
  </div>;
};
