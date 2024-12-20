import React from "react";
import { OtherSettingsProps, SettingDescriptionProps } from "./interfaces";
import { Highlight } from "./maybe_highlight";
import { DeviceSetting, Content, ToolTips } from "../constants";
import { Header } from "./hardware_settings/header";
import { Collapse } from "@blueprintjs/core";
import { t } from "../i18next_wrapper";
import {
  NumberConfigKey as WebAppNumberConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { Setting } from "./farm_designer_settings";
import { Row, ToggleButton } from "../ui";
import {
  setWebAppConfigValue, GetWebAppConfigValue,
} from "../config_storage/actions";
import { updateConfig } from "../devices/actions";
import { SourceFbosConfig } from "../devices/interfaces";
import { ConfigurationName } from "farmbot";

export const OtherSettings = (props: OtherSettingsProps) =>
  <Highlight className={"section"} hidden={true}
    settingName={DeviceSetting.otherSettings}>
    <Header
      title={DeviceSetting.otherSettings}
      panel={"other_settings"}
      dispatch={props.dispatch}
      expanded={props.settingsPanelState.other_settings} />
    <Collapse isOpen={!!props.settingsPanelState.other_settings}>
      {OTHER_SETTINGS().map(setting =>
        <Setting key={setting.title} {...setting} {...props} />)}
      {LOG_LEVEL_SETTINGS().map(setting =>
        <LogLevelSetting key={setting.title} {...setting} {...props} />)}
      {LOG_ENABLE_SETTINGS().map(setting =>
        <LogEnableSetting key={setting.title} {...setting} {...props} />)}
    </Collapse>
  </Highlight>;

export interface LogLevelSettingProps {
  dispatch: Function;
  title: DeviceSetting;
  setting: WebAppNumberConfigKey;
  description: string;
  getConfigValue: GetWebAppConfigValue;
}

export const LogLevelSetting = (props: LogLevelSettingProps) => {
  const value = !!props.getConfigValue(props.setting);
  return <Highlight settingName={props.title}>
    <Row className="grid-exp-1">
      <label>{t(props.title)}</label>
      <ToggleButton
        toggleValue={value}
        toggleAction={() =>
          props.dispatch(setWebAppConfigValue(props.setting, !value))}
        title={`${t("toggle")} ${props.title}`} />
    </Row>
  </Highlight>;
};

export interface LogEnableSettingProps {
  dispatch: Function;
  title: DeviceSetting;
  setting: ConfigurationName;
  description: string;
  sourceFbosConfig: SourceFbosConfig;
}

export const LogEnableSetting = (props: LogEnableSettingProps) => {
  const value = props.sourceFbosConfig(props.setting).value;
  return <Highlight settingName={props.title}>
    <Row className="grid-exp-1">
      <label>{t(props.title)}</label>
      <ToggleButton
        toggleValue={value}
        toggleAction={() =>
          props.dispatch(updateConfig({ [props.setting]: !value }))}
        title={`${t("toggle")} ${props.title}`} />
    </Row>
  </Highlight>;
};

const OTHER_SETTINGS = (): SettingDescriptionProps[] => ([
  {
    title: DeviceSetting.showPlantsMapLayer,
    description: "",
    setting: BooleanSetting.show_plants,
  },
  {
    title: DeviceSetting.showPointsMapLayer,
    description: "",
    setting: BooleanSetting.show_points,
  },
  {
    title: DeviceSetting.showWeedsMapLayer,
    description: "",
    setting: BooleanSetting.show_weeds,
  },
  {
    title: DeviceSetting.showRemovedWeedsMapLayer,
    description: "",
    setting: BooleanSetting.show_historic_points,
  },
  {
    title: DeviceSetting.showSoilInterpolationMapLayer,
    description: "",
    setting: BooleanSetting.show_soil_interpolation_map,
  },
  {
    title: DeviceSetting.showSpreadMapLayer,
    description: "",
    setting: BooleanSetting.show_spread,
  },
  {
    title: DeviceSetting.showFarmbotMapLayer,
    description: "",
    setting: BooleanSetting.show_farmbot,
  },
  {
    title: DeviceSetting.showPhotosMapLayer,
    description: "",
    setting: BooleanSetting.show_images,
  },
  {
    title: DeviceSetting.showAreasMapLayer,
    description: "",
    setting: BooleanSetting.show_zones,
  },
  {
    title: DeviceSetting.showReadingsMapLayer,
    description: "",
    setting: BooleanSetting.show_sensor_readings,
  },
  {
    title: DeviceSetting.showMoistureInterpolationMapLayer,
    description: "",
    setting: BooleanSetting.show_moisture_interpolation_map,
  },
  {
    title: DeviceSetting.invertXAxisJogButton,
    description: "",
    setting: BooleanSetting.x_axis_inverted,
  },
  {
    title: DeviceSetting.invertYAxisJogButton,
    description: "",
    setting: BooleanSetting.y_axis_inverted,
  },
  {
    title: DeviceSetting.invertZAxisJogButton,
    description: "",
    setting: BooleanSetting.z_axis_inverted,
  },
  {
    title: DeviceSetting.displayScaledEncoderPosition,
    description: t("Display Encoder Data"),
    setting: BooleanSetting.scaled_encoders,
  },
  {
    title: DeviceSetting.displayRawEncoderPosition,
    description: t("Display Encoder Data"),
    setting: BooleanSetting.raw_encoders,
  },
  {
    title: DeviceSetting.swapXAndYAxisJogButtons,
    description: t("Swap jog buttons (and rotate map)"),
    setting: BooleanSetting.xy_swap,
  },
  {
    title: DeviceSetting.showMotorPositionPlotDisplay,
    description: "",
    setting: BooleanSetting.show_motor_plot,
  },
  {
    title: DeviceSetting.showMotorLoadPlotDisplay,
    description: "",
    setting: BooleanSetting.show_missed_step_plot,
  },
  {
    title: DeviceSetting.confirmStepDeletion,
    description: Content.CONFIRM_STEP_DELETION,
    setting: BooleanSetting.confirm_step_deletion,
  },
  {
    title: DeviceSetting.confirmSequenceDeletion,
    description: Content.CONFIRM_SEQUENCE_DELETION,
    setting: BooleanSetting.confirm_sequence_deletion,
  },
  {
    title: DeviceSetting.showPins,
    description: Content.SHOW_PINS,
    setting: BooleanSetting.show_pins,
  },
  {
    title: DeviceSetting.openOptionsByDefault,
    description: Content.EXPAND_STEP_OPTIONS,
    setting: BooleanSetting.expand_step_options,
  },
  {
    title: DeviceSetting.discardUnsavedSequenceChanges,
    description: Content.DISCARD_UNSAVED_SEQUENCE_CHANGES,
    setting: BooleanSetting.discard_unsaved_sequences,
    confirm: Content.DISCARD_UNSAVED_SEQUENCE_CHANGES_CONFIRM,
  },
  {
    title: DeviceSetting.viewCeleryScript,
    description: Content.VIEW_CELERY_SCRIPT,
    setting: BooleanSetting.view_celery_script,
  },
]);

interface LogLevelSettingDescriptionProps {
  setting: WebAppNumberConfigKey;
  title: DeviceSetting;
  description: string;
}

const LOG_DESCRIPTION = () => t("Show logs");

const LOG_LEVEL_SETTINGS = (): LogLevelSettingDescriptionProps[] => ([
  {
    title: DeviceSetting.logFilterLevelSuccess,
    description: LOG_DESCRIPTION(),
    setting: NumericSetting.success_log,
  },
  {
    title: DeviceSetting.logFilterLevelBusy,
    description: LOG_DESCRIPTION(),
    setting: NumericSetting.busy_log,
  },
  {
    title: DeviceSetting.logFilterLevelWarn,
    description: LOG_DESCRIPTION(),
    setting: NumericSetting.warn_log,
  },
  {
    title: DeviceSetting.logFilterLevelError,
    description: LOG_DESCRIPTION(),
    setting: NumericSetting.error_log,
  },
  {
    title: DeviceSetting.logFilterLevelInfo,
    description: LOG_DESCRIPTION(),
    setting: NumericSetting.info_log,
  },
  {
    title: DeviceSetting.logFilterLevelFun,
    description: LOG_DESCRIPTION(),
    setting: NumericSetting.fun_log,
  },
  {
    title: DeviceSetting.logFilterLevelDebug,
    description: LOG_DESCRIPTION(),
    setting: NumericSetting.debug_log,
  },
  {
    title: DeviceSetting.logFilterLevelAssertion,
    description: LOG_DESCRIPTION(),
    setting: NumericSetting.assertion_log,
  },
]);

interface LogEnableSettingDescriptionProps {
  setting: ConfigurationName;
  title: DeviceSetting;
  description: string;
}

const LOG_ENABLE_SETTINGS = (): LogEnableSettingDescriptionProps[] => ([
  {
    title: DeviceSetting.enableSequenceBeginLogs,
    description: ToolTips.SEQUENCE_LOG_BEGIN,
    setting: "sequence_init_log",
  },
  {
    title: DeviceSetting.enableSequenceStepLogs,
    description: ToolTips.SEQUENCE_LOG_STEP,
    setting: "sequence_body_log",
  },
  {
    title: DeviceSetting.enableSequenceCompleteLogs,
    description: ToolTips.SEQUENCE_LOG_END,
    setting: "sequence_complete_log",
  },
]);
