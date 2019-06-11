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
import { BooleanSetting } from "../session_keys";
import { resetVirtualTrail } from "./map/layers/farmbot/bot_trail";
import { MapSizeInputs } from "../account/components/map_size_setting";
import { DesignerNavTabs } from "./panel_header";

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
    return <DesignerPanel panelName={"settings"} panelColor={"gray"}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"settings"}>
        {DESIGNER_SETTINGS.map(setting =>
          <Setting key={setting.title}
            dispatch={this.props.dispatch}
            getConfigValue={this.props.getConfigValue}
            setting={setting.setting}
            title={setting.title}
            description={setting.description}
            invert={setting.invert}
            callback={setting.callback} />)}
        <MapSizeInputs
          getConfigValue={this.props.getConfigValue}
          dispatch={this.props.dispatch} />
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
}

interface SettingProps
  extends DesignerSettingsProps, SettingDescriptionProps { }

const Setting = (props: SettingProps) => {
  const { title, setting, callback } = props;
  const value = setting ? !!props.getConfigValue(setting) : undefined;
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
  </div>;
};

const DESIGNER_SETTINGS: SettingDescriptionProps[] = [
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
  },
];
