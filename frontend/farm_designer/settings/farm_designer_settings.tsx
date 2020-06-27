import * as React from "react";
import { Content, DeviceSetting } from "../../constants";
import { t } from "../../i18next_wrapper";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { Row, Col } from "../../ui";
import { ToggleButton } from "../../controls/toggle_button";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { resetVirtualTrail } from "../map/layers/farmbot/bot_trail";
import { MapSizeInputs } from "../map_size_setting";
import { isUndefined } from "lodash";
import { Collapse } from "@blueprintjs/core";
import { Header } from "../../devices/components/hardware_settings/header";
import { Highlight } from "../../devices/components/maybe_highlight";
import {
  DesignerSettingsSectionProps, SettingProps,
  DesignerSettingsPropsBase, SettingDescriptionProps,
} from "./interfaces";

export const Designer = (props: DesignerSettingsSectionProps) => {
  const { getConfigValue, dispatch, controlPanelState } = props;
  const settingsProps = { getConfigValue, dispatch };
  return <Highlight className={"section"}
    settingName={DeviceSetting.farmDesigner}>
    <Header
      title={DeviceSetting.farmDesigner}
      panel={"farm_designer"}
      dispatch={dispatch}
      expanded={controlPanelState.farm_designer} />
    <Collapse isOpen={!!controlPanelState.farm_designer}>
      {PlainDesignerSettings(settingsProps)}
    </Collapse>
  </Highlight>;
};

export const PlainDesignerSettings =
  (settingsProps: DesignerSettingsPropsBase) =>
    DESIGNER_SETTINGS(settingsProps).map(setting =>
      <Setting key={setting.title} {...setting} {...settingsProps} />);

export const Setting = (props: SettingProps) => {
  const { title, setting, callback, defaultOn } = props;
  const raw_value = setting ? props.getConfigValue(setting) : undefined;
  const value = (defaultOn && isUndefined(raw_value)) ? true : !!raw_value;
  return <Highlight settingName={title}>
    <div
      className={`designer-setting ${props.disabled ? "disabled" : ""}`}>
      <Row>
        <Col xs={9}>
          <label>{t(title)}</label>
        </Col>
        <Col xs={3}>
          {setting && <ToggleButton
            toggleValue={props.invert ? !value : value}
            toggleAction={() => {
              if (value || !props.confirm || confirm(t(props.confirm))) {
                props.dispatch(setWebAppConfigValue(setting, !value));
                callback?.();
              }
            }}
            title={`${t("toggle")} ${title}`}
            customText={{ textFalse: t("off"), textTrue: t("on") }} />}
        </Col>
      </Row>
      <Row>
        <p>{t(props.description)}</p>
      </Row>
      {props.children}
    </div>
  </Highlight>;
};

const DESIGNER_SETTINGS =
  (settingsProps: DesignerSettingsPropsBase): SettingDescriptionProps[] => ([
    {
      title: DeviceSetting.animations,
      description: t(Content.PLANT_ANIMATIONS),
      setting: BooleanSetting.disable_animations,
      invert: true
    },
    {
      title: DeviceSetting.trail,
      description: t(Content.VIRTUAL_TRAIL),
      setting: BooleanSetting.display_trail,
      callback: resetVirtualTrail,
    },
    {
      title: DeviceSetting.mapMissedSteps,
      description: t(Content.MAP_MISSED_STEPS),
      setting: BooleanSetting.display_map_missed_steps,
      disabled: !settingsProps.getConfigValue(BooleanSetting.display_trail),
    },
    {
      title: DeviceSetting.dynamicMap,
      description: t(Content.DYNAMIC_MAP_SIZE),
      setting: BooleanSetting.dynamic_map,
    },
    {
      title: DeviceSetting.mapSize,
      description: t(Content.MAP_SIZE),
      children: <MapSizeInputs {...settingsProps} />,
      disabled: !!settingsProps.getConfigValue(BooleanSetting.dynamic_map),
    },
    {
      title: DeviceSetting.rotateMap,
      description: t(Content.MAP_SWAP_XY),
      setting: BooleanSetting.xy_swap,
    },
    {
      title: DeviceSetting.mapOrigin,
      description: t(Content.MAP_ORIGIN),
      children: <OriginSelector {...settingsProps} />
    },
    {
      title: DeviceSetting.confirmPlantDeletion,
      description: t(Content.CONFIRM_PLANT_DELETION),
      setting: BooleanSetting.confirm_plant_deletion,
      defaultOn: true,
    },
  ]);

const OriginSelector = (props: DesignerSettingsPropsBase) => {
  const quadrant = props.getConfigValue(NumericSetting.bot_origin_quadrant);
  const update = (value: number) => () => props.dispatch(setWebAppConfigValue(
    NumericSetting.bot_origin_quadrant, value));
  return <div className="farmbot-origin">
    <div className="quadrants">
      {[2, 1, 3, 4].map(q =>
        <div key={"quadrant_" + q}
          className={`quadrant ${quadrant === q ? "selected" : ""}`}
          onClick={update(q)} />)}
    </div>
  </div>;
};
