import { BooleanSetting } from "../../session_keys";
import { Content, DeviceSetting } from "../../constants";
import {
  GetWebAppConfigValue, setWebAppConfigValue,
} from "../../config_storage/actions";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { t } from "../../i18next_wrapper";

export interface LabsFeature {
  /** Toggle label. */
  name: string;
  description: string;
  /** Configuration key name such as "disable_i18n". Must be unique. */
  storageKey: BooleanConfigKey;
  /** Placeholder value (use false). */
  value: boolean;
  /** Confirmation message to display before allowing a toggle to true. */
  confirmationMessage?: string;
  /** Invert displayed toggle value for `disable_` settings. */
  displayInvert?: boolean;
  /** If the feature requires any special logic after being flipped, add it
   * here. */
  callback?(): void;
}

export const fetchLabFeatures =
  (getConfigValue: GetWebAppConfigValue): LabsFeature[] => ([
    {
      name: DeviceSetting.internationalizeWebApp,
      description: Content.INTERNATIONALIZE_WEB_APP,
      storageKey: BooleanSetting.disable_i18n,
      value: false,
      displayInvert: true,
      callback: () => window.location.reload()
    },
    {
      name: DeviceSetting.use24hourTimeFormat,
      description: Content.TIME_FORMAT_24_HOUR,
      storageKey: BooleanSetting.time_format_24_hour,
      value: false,
    },
    {
      name: DeviceSetting.showSecondsInTime,
      description: Content.TIME_FORMAT_SECONDS,
      storageKey: BooleanSetting.time_format_seconds,
      value: false,
    },
    {
      name: DeviceSetting.hideWebcamWidget,
      description: Content.HIDE_WEBCAM_WIDGET,
      storageKey: BooleanSetting.hide_webcam_widget,
      value: false
    },
    {
      name: DeviceSetting.hideSensorsPanel,
      description: Content.HIDE_SENSORS_WIDGET,
      storageKey: BooleanSetting.hide_sensors,
      value: false
    },
    {
      name: DeviceSetting.readSpeakLogsInBrowser,
      description: Content.BROWSER_SPEAK_LOGS,
      storageKey: BooleanSetting.enable_browser_speak,
      value: false
    },
    {
      name: DeviceSetting.discardUnsavedChanges,
      description: Content.DISCARD_UNSAVED_CHANGES,
      storageKey: BooleanSetting.discard_unsaved,
      value: false,
      confirmationMessage: Content.DISCARD_UNSAVED_CHANGES_CONFIRM
    },
    {
      name: DeviceSetting.confirmEmergencyUnlock,
      description: Content.EMERGENCY_UNLOCK_CONFIRM_CONFIG,
      confirmationMessage: Content.CONFIRM_EMERGENCY_UNLOCK_CONFIRM_DISABLE,
      storageKey: BooleanSetting.disable_emergency_unlock_confirmation,
      value: false,
      displayInvert: true,
    },
    {
      name: DeviceSetting.userInterfaceReadOnlyMode,
      description: Content.USER_INTERFACE_READ_ONLY_MODE,
      storageKey: BooleanSetting.user_interface_read_only_mode,
      value: false,
      displayInvert: false,
    },
  ].map(fetchSettingValue(getConfigValue)));

/** Always allow toggling from true => false (deactivate).
 * Require a disclaimer when going from false => true (activate). */
export const maybeToggleFeature =
  (getConfigValue: GetWebAppConfigValue, dispatch: Function) =>
    (x: LabsFeature): LabsFeature | undefined =>
      (x.value
        || !x.confirmationMessage
        || window.confirm(t(x.confirmationMessage))) ?
        toggleFeatureValue(getConfigValue, dispatch)(x) : undefined;

/** Takes a `LabFeature` (probably one with an uninitialized fallback / default
 * value) and sets it to the _real_ value that's in the API. */
const fetchSettingValue = (getConfigValue: GetWebAppConfigValue) =>
  (x: LabsFeature): LabsFeature => {
    return { ...x, value: !!getConfigValue(x.storageKey) };
  };

/** Toggle the `.value` of a `LabsToggle` object */
const toggleFeatureValue =
  (getConfigValue: GetWebAppConfigValue, dispatch: Function) =>
    (x: LabsFeature) => {
      const value = !getConfigValue(x.storageKey);
      dispatch(setWebAppConfigValue(x.storageKey, value));
      return { ...x, value };
    };
