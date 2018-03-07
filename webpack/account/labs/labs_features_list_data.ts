import { Content } from "../../constants";
import { Session } from "../../session";
import { trim } from "../../util";
import { t } from "i18next";
import { BooleanConfigKey } from "../../config_storage/web_app_configs";
import { BooleanSetting } from "../../session_keys";

export interface LabsFeature {
  name: string;
  description: string;
  /** Entry for localStorage. Must be unique. */
  storageKey: BooleanConfigKey;
  value: boolean;
  experimental?: boolean;
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
    description: trim(t(`Show a confirmation dialog when the sequence delete step
      icon is pressed.`)),
    storageKey: BooleanSetting.confirm_step_deletion,
    value: false
  },
  {
    name: t("Hide Webcam widget"),
    description: trim(t(`If not using a webcam, use this setting to remove the
      widget from the Controls page.`)),
    storageKey: BooleanSetting.hide_webcam_widget,
    value: false
  },
  {
    name: t("Dynamic map size"),
    description: trim(t(`Change the Farm Designer map size based on axis length.
      A value must be input in AXIS LENGTH and STOP AT MAX must be enabled in
      the HARDWARE widget.`)),
    storageKey: BooleanSetting.dynamic_map,
    value: false
  },
  {
    name: t("Double default map dimensions"),
    description: trim(t(`Double the default dimensions of the Farm Designer map
    for a map with four times the area.`)),
    storageKey: BooleanSetting.map_xl,
    value: false
  },
  {
    name: t("Display plant animations"),
    description: trim(t(`Enable plant animations in the Farm Designer.`)),
    storageKey: BooleanSetting.disable_animations,
    value: false,
    displayInvert: true
  },
  {
    name: t("Read speak logs in browser"),
    description: trim(t(`Have the browser also read aloud log messages on the
    "Speak" channel that are spoken by FarmBot.`)),
    storageKey: BooleanSetting.enable_browser_speak,
    value: false
  },
  {
    name: t("Discard Unsaved Changes"),
    description: trim(t(`Don't ask about saving work before
      closing browser tab.`)),
    storageKey: BooleanSetting.discard_unsaved,
    value: false
  },
].map(fetchRealValue));

/** Always allow toggling from true => false (deactivate).
 * Require a disclaimer when going from false => true (activate). */
export const maybeToggleFeature =
  (x: LabsFeature): LabsFeature | undefined => {
    return (x.value
      || !x.experimental
      || window.confirm(Content.EXPERIMENTAL_WARNING)) ?
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
