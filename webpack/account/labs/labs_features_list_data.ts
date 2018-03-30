import { Session } from "../../session";
import { t } from "i18next";
import { BooleanConfigKey } from "../../config_storage/web_app_configs";
import { BooleanSetting } from "../../session_keys";
import { Content } from "../../constants";

export interface LabsFeature {
  /** Toggle label. */
  name: string;
  description: string;
  /** Entry for localStorage. Must be unique. */
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

export const fetchLabFeatures = (): LabsFeature[] => ([
  {
    name: t("Internationalize Web App"),
    description: t("Turn off to set Web App to English."),
    storageKey: BooleanSetting.disable_i18n,
    value: false,
    displayInvert: true,
    callback: () => window.location.reload()
  },
  {
    name: t("Confirm Sequence step deletion"),
    description: t(Content.CONFIRM_STEP_DELETION),
    storageKey: BooleanSetting.confirm_step_deletion,
    value: false
  },
  {
    name: t("Hide Webcam widget"),
    description: t(Content.HIDE_WEBCAM_WIDGET),
    storageKey: BooleanSetting.hide_webcam_widget,
    value: false
  },
  {
    name: t("Dynamic map size"),
    description: t(Content.DYNAMIC_MAP_SIZE),
    storageKey: BooleanSetting.dynamic_map,
    value: false
  },
  {
    name: t("Double default map dimensions"),
    description: t(Content.DOUBLE_MAP_DIMENSIONS),
    storageKey: BooleanSetting.map_xl,
    value: false
  },
  {
    name: t("Display plant animations"),
    description: t(Content.PLANT_ANIMATIONS),
    storageKey: BooleanSetting.disable_animations,
    value: false,
    displayInvert: true
  },
  {
    name: t("Read speak logs in browser"),
    description: t(Content.BROWSER_SPEAK_LOGS),
    storageKey: BooleanSetting.enable_browser_speak,
    value: false
  },
  {
    name: t("Discard Unsaved Changes"),
    description: t(Content.DISCARD_UNSAVED_CHANGES),
    storageKey: BooleanSetting.discard_unsaved,
    value: false,
    confirmationMessage: t(Content.DISCARD_UNSAVED_CHANGES_CONFIRM)
  },
  {
    name: t("Display virtual FarmBot trail"),
    description: t(Content.VIRTUAL_TRAIL),
    storageKey: BooleanSetting.display_trail,
    value: false,
    callback: () => sessionStorage.virtualTrailRecords = "[]"
  },
].map(fetchRealValue));

/** Always allow toggling from true => false (deactivate).
 * Require a disclaimer when going from false => true (activate). */
export const maybeToggleFeature =
  (x: LabsFeature): LabsFeature | undefined => {
    return (x.value
      || !x.confirmationMessage
      || window.confirm(x.confirmationMessage)) ?
      toggleFeatureValue(x) : undefined;
  };

/** Stub this when testing if need be. */
const fetchVal = (k: BooleanConfigKey) => !!Session.deprecatedGetBool(k);

/** Takes a `LabFeature` (probably one with an uninitialized fallback / default
 * value) and sets it to the _real_ value that's in the API. */
const fetchRealValue = (x: LabsFeature): LabsFeature => {
  return { ...x, value: fetchVal(x.storageKey) };
};

/** Toggle the `.value` of a `LabsToggle` object */
const toggleFeatureValue = (x: LabsFeature) => {
  return { ...x, value: Session.invertBool(x.storageKey) };
};
