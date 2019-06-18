import * as React from "react";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { Content } from "../constants";
import { DesignerPanel, DesignerPanelContent } from "./plants/designer_panel";
import { t } from "../i18next_wrapper";
import {
  GetWebAppConfigValue, getWebAppConfigValue, setWebAppConfigValue
} from "../config_storage/actions";
import { Row, Col } from "../ui";
import { ToggleButton } from "../controls/toggle_button";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { resetVirtualTrail } from "./map/layers/farmbot/bot_trail";
import { MapSizeInputs } from "./map_size_setting";
import { DesignerNavTabs } from "./panel_header";
import { isUndefined } from "lodash";

export const mapStateToProps = (props: Everything): DesignerSettingsProps => ({
  dispatch: props.dispatch,
  getConfigValue: getWebAppConfigValue(() => props),
});

export interface DesignerSettingsProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

@connect(mapStateToProps)
export class DesignerSettings
  extends React.Component<DesignerSettingsProps, {}> {

  render() {
    const { getConfigValue, dispatch } = this.props;
    const settingsProps = { getConfigValue, dispatch };
    return <DesignerPanel panelName={"settings"} panelColor={"gray"}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"settings"}>
        {DESIGNER_SETTINGS(settingsProps).map(setting =>
          <Setting key={setting.title} {...setting} {...settingsProps} />)}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

interface SettingDescriptionProps {
  setting?: BooleanConfigKey;
  title: string;
  description: string;
  invert?: boolean;
  callback?: () => void;
  children?: React.ReactChild;
  defaultOn?: boolean;
}

interface SettingProps
  extends DesignerSettingsProps, SettingDescriptionProps { }

const Setting = (props: SettingProps) => {
  const { title, setting, callback, defaultOn } = props;
  const raw_value = setting ? props.getConfigValue(setting) : undefined;
  const value = (defaultOn && isUndefined(raw_value)) ? true : !!raw_value;
  return <div className="designer-setting">
    <Row>
      <Col xs={9}>
        <label>{t(title)}</label>
      </Col>
      <Col xs={3}>
        {setting && <ToggleButton
          toggleValue={props.invert ? !value : value}
          toggleAction={() => {
            props.dispatch(setWebAppConfigValue(setting, !value));
            callback && callback();
          }}
          title={`${t("toggle")} ${title}`}
          customText={{ textFalse: t("off"), textTrue: t("on") }} />}
      </Col>
    </Row>
    <Row>
      <p>{t(props.description)}</p>
    </Row>
    {props.children}
  </div>;
};

const DESIGNER_SETTINGS =
  (settingsProps: DesignerSettingsProps): SettingDescriptionProps[] => ([
    {
      title: t("Display plant animations"),
      description: t(Content.PLANT_ANIMATIONS),
      setting: BooleanSetting.disable_animations,
      invert: true
    },
    {
      title: t("Display virtual FarmBot trail"),
      description: t(Content.VIRTUAL_TRAIL),
      setting: BooleanSetting.display_trail,
      callback: resetVirtualTrail,
    },
    {
      title: t("Dynamic map size"),
      description: t(Content.DYNAMIC_MAP_SIZE),
      setting: BooleanSetting.dynamic_map,
    },
    {
      title: t("Map size"),
      description: t(Content.MAP_SIZE),
      children: <MapSizeInputs {...settingsProps} />
    },
    {
      title: t("Rotate map"),
      description: t(Content.MAP_SWAP_XY),
      setting: BooleanSetting.xy_swap,
    },
    {
      title: t("Map origin"),
      description: t(Content.MAP_ORIGIN),
      children: <OriginSelector {...settingsProps} />
    },
    {
      title: t("Confirm plant deletion"),
      description: t(Content.CONFIRM_PLANT_DELETION),
      setting: BooleanSetting.confirm_plant_deletion,
      defaultOn: true,
    },
  ]);

const OriginSelector = (props: DesignerSettingsProps) => {
  const quadrant = props.getConfigValue(NumericSetting.bot_origin_quadrant);
  const update = (value: number) => () => props.dispatch(setWebAppConfigValue(
    NumericSetting.bot_origin_quadrant, value));
  return <div className="farmbot-origin">
    <div className="quadrants">
      {[2, 1, 3, 4].map(q =>
        <div key={"quadrant_" + q}
          className={`quadrant ${quadrant === q ? "selected" : ""}`}
          onClick={update(q)} />
      )}
    </div>
  </div>;
};
