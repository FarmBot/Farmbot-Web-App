import React from "react";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting, Content } from "../../constants";
import { Header } from "../hardware_settings/header";
import { Collapse, Slider } from "@blueprintjs/core";
import { t } from "../../i18next_wrapper";
import { BlurableInput, FBSelect, Help, Row, ToggleButton } from "../../ui";
import { edit, save } from "../../api/crud";
import { SettingDescriptionProps } from "../interfaces";
import { BooleanSetting, NumericSetting, StringSetting } from "../../session_keys";
import { Setting } from "../farm_designer_settings";
import { resetAccount, deleteUser } from "./actions";
import { requestAccountExport } from "./request_account_export";
import { success } from "../../toast/toast";
import { ChangePassword } from "./change_password";
import { DangerousDeleteWidget } from "./dangerous_delete_widget";
import { AccountSettingsProps } from "./interfaces";
import {
  GetWebAppConfigValue, setWebAppConfigValue,
} from "../../config_storage/actions";
import {
  getModifiedClassName, getModifiedClassNameDefaultFalse,
} from "../default_values";
import { PAGE_SLUGS } from "../../internal_urls";
import { DevSettings } from "../dev/dev_support";

export const AccountSettings = (props: AccountSettingsProps) =>
  <Highlight className={"section"}
    settingName={DeviceSetting.accountSettings}>
    <Header
      expanded={props.settingsPanelState.account}
      title={DeviceSetting.accountSettings}
      panel={"account"}
      dispatch={props.dispatch} />
    <Collapse isOpen={!!props.settingsPanelState.account}>
      <Highlight settingName={DeviceSetting.accountName}>
        <Row className="grid-2-col">
          <label>
            {t(DeviceSetting.accountName)}
          </label>
          <BlurableInput
            type="text"
            name="userName"
            value={props.user.body.name || ""}
            onCommit={e => {
              props.dispatch(edit(
                props.user, { name: e.currentTarget.value }));
              props.dispatch(save(props.user.uuid));
            }} />
        </Row>
      </Highlight>
      <Highlight settingName={DeviceSetting.accountEmail}>
        <div className={"settings-warning-banner"}>
          <p>{t(Content.ACCOUNT_EMAIL_CHANGE)}</p>
        </div>
      </Highlight>
      <Highlight settingName={DeviceSetting.accountEmail}>
        <Row className="grid-2-col">
          <label>
            {t(DeviceSetting.accountEmail)}
          </label>
          <BlurableInput
            type="text"
            name="email"
            value={props.user.body.email || ""}
            onCommit={e => {
              success(t(Content.CHECK_EMAIL_TO_CONFIRM));
              props.dispatch(edit(
                props.user, { email: e.currentTarget.value }));
              props.dispatch(save(props.user.uuid));
            }} />
        </Row>
      </Highlight>
      <Highlight settingName={DeviceSetting.changePassword}>
        <ChangePassword />
      </Highlight>
      <Highlight settingName={DeviceSetting.language}>
        <Row className="grid-2-col">
          <label>
            {t(DeviceSetting.language)}
          </label>
          <BlurableInput
            type="text"
            name="language"
            value={props.user.body.language || ""}
            onCommit={e => {
              props.dispatch(edit(
                props.user,
                { language: e.currentTarget.value }));
              props.dispatch(save(props.user.uuid));
            }} />
        </Row>
      </Highlight>
      {APP_SETTINGS().map(setting => <Setting key={setting.title}
        {...setting} {...props} useToolTip={true} />)}
      <LandingPageSetting {...props} />
      <ActivityBeepSetting {...props} />
      <Highlight settingName={DeviceSetting.resetAccount}>
        <DangerousDeleteWidget
          title={DeviceSetting.resetAccount}
          warning={t(Content.ACCOUNT_RESET_WARNING)}
          confirmation={t(Content.TYPE_PASSWORD_TO_RESET)}
          dispatch={props.dispatch}
          onClick={resetAccount} />
      </Highlight>
      <Highlight settingName={DeviceSetting.deleteAccount}>
        <DangerousDeleteWidget
          title={DeviceSetting.deleteAccount}
          warning={t(Content.ACCOUNT_DELETE_WARNING)}
          confirmation={t(Content.TYPE_PASSWORD_TO_DELETE)}
          dispatch={props.dispatch}
          onClick={deleteUser} />
      </Highlight>
      <Highlight settingName={DeviceSetting.exportAccountData}>
        <Row className={"export-data"}>
          <label>
            {t(DeviceSetting.exportAccountData)}
          </label>
          <p>
            {t(Content.EXPORT_DATA_DESC)}
          </p>
          <button className="green fb-button"
            title={t("Export")}
            onClick={() => { requestAccountExport(); }}>
            {t("Export")}
          </button>
        </Row>
      </Highlight>
    </Collapse>
  </Highlight>;

const APP_SETTINGS = (): SettingDescriptionProps[] => ([
  {
    title: DeviceSetting.internationalizeWebApp,
    description: Content.INTERNATIONALIZE_WEB_APP,
    setting: BooleanSetting.disable_i18n,
    invert: true,
  },
  {
    title: DeviceSetting.use24hourTimeFormat,
    description: Content.TIME_FORMAT_24_HOUR,
    setting: BooleanSetting.time_format_24_hour,
  },
  {
    title: DeviceSetting.showSecondsInTime,
    description: Content.TIME_FORMAT_SECONDS,
    setting: BooleanSetting.time_format_seconds,
  },
  {
    title: DeviceSetting.hideSensorsPanel,
    description: Content.HIDE_SENSORS_WIDGET,
    setting: BooleanSetting.hide_sensors,
  },
  {
    title: DeviceSetting.enable3dElectronicsBox,
    description: Content.ENABLE_3D_ELECTRONICS_BOX_TOP,
    setting: BooleanSetting.enable_3d_electronics_box_top,
  },
  {
    title: DeviceSetting.readSpeakLogsInBrowser,
    description: Content.BROWSER_SPEAK_LOGS,
    setting: BooleanSetting.enable_browser_speak,
  },
  {
    title: DeviceSetting.discardUnsavedChanges,
    description: Content.DISCARD_UNSAVED_CHANGES,
    setting: BooleanSetting.discard_unsaved,
    confirm: Content.DISCARD_UNSAVED_CHANGES_CONFIRM,
  },
  {
    title: DeviceSetting.confirmEmergencyUnlock,
    description: Content.EMERGENCY_UNLOCK_CONFIRM_CONFIG,
    setting: BooleanSetting.disable_emergency_unlock_confirmation,
    invert: true,
    confirm: Content.CONFIRM_EMERGENCY_UNLOCK_CONFIRM_DISABLE,
  },
  {
    title: DeviceSetting.userInterfaceReadOnlyMode,
    description: Content.USER_INTERFACE_READ_ONLY_MODE,
    setting: BooleanSetting.user_interface_read_only_mode,
  },
  {
    title: DeviceSetting.darkMode,
    description: Content.DARK_MODE,
    setting: BooleanSetting.dark_mode,
  },
]);

export interface ActivityBeepSettingProps {
  getConfigValue: GetWebAppConfigValue;
  dispatch: Function;
}

export const ActivityBeepSetting = (props: ActivityBeepSettingProps) => {
  const value = props.getConfigValue(NumericSetting.beep_verbosity);
  return <Highlight settingName={DeviceSetting.browserFarmbotActivityBeep}>
    <Row className={"activity-beep-setting"}>
      <label>{t(DeviceSetting.browserFarmbotActivityBeep)}</label>
      <Help text={Content.BROWSER_ACTIVITY_BEEP} />
      <ToggleButton
        className={getModifiedClassNameDefaultFalse(value)}
        toggleValue={!!value}
        toggleAction={() => props.dispatch(setWebAppConfigValue(
          NumericSetting.beep_verbosity, value ? 0 : 1))}
        title={t("toggle beeps")} />
      <Slider min={0} max={3} stepSize={1}
        className={getModifiedClassName(NumericSetting.beep_verbosity)}
        onChange={newValue => props.dispatch(setWebAppConfigValue(
          NumericSetting.beep_verbosity, newValue))}
        value={parseInt("" + value)} />
    </Row>
  </Highlight>;
};

export interface LandingPageSettingProps {
  getConfigValue: GetWebAppConfigValue;
  dispatch: Function;
}

export const LandingPageSetting = (props: LandingPageSettingProps) => {
  const value = "" + props.getConfigValue(StringSetting.landing_page);
  const change = (page: string) => props.dispatch(setWebAppConfigValue(
    StringSetting.landing_page, page));
  const [page, setPage] = React.useState(value);
  return <Highlight settingName={DeviceSetting.landingPage}>
    <Row className={"grid-2-col align-baseline"}>
      <div className="row grid-exp-2">
        <label>{t(DeviceSetting.landingPage)}</label>
        <Help text={Content.LANDING_PAGE} />
      </div>
      <div className="grid">
        <FBSelect
          key={value}
          list={Object.entries(PAGE_SLUGS())
            .map(([value, label]) => ({ label, value }))}
          selectedItem={{ label: PAGE_SLUGS()[value] || t("Custom"), value }}
          onChange={ddi => {
            const newValue = "" + ddi.value;
            change(newValue);
            setPage(newValue);
          }} />
        {DevSettings.futureFeaturesEnabled() &&
          <input value={page}
            onBlur={() => change(page)}
            onChange={e => setPage(e.currentTarget.value)} />}
      </div>
    </Row>
  </Highlight>;
};
