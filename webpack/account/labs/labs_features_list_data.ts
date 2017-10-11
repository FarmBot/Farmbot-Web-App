import { Content } from "../../constants";
import { Session } from "../../session";
import { BooleanSetting } from "../../session_keys";
import { trim } from "../../util";
import { t } from "i18next";

export interface LabsFeature {
  name: string;
  description: string;
  /** Entry for localStorage. Must be unique. */
  storageKey: BooleanSetting;
  value: boolean;
  experimental?: boolean;
  displayInvert?: boolean;
}

export const fetchLabFeatures = (): LabsFeature[] => ([
  {
    name: t("Internationalize Web App"),
    description: t("Turn off to set Web App to English."),
    storageKey: BooleanSetting.disableI18n,
    value: false,
    displayInvert: true
  },
  {
    name: t("Confirm Sequence step deletion"),
    description: trim(t(`Show a confirmation dialog when the sequence delete step
      icon is pressed.`)),
    storageKey: BooleanSetting.confirmStepDeletion,
    value: false
  },
  {
    name: t("Hide Webcam widget"),
    description: trim(t(`If not using a webcam, use this setting to remove the
      widget from the Controls page.`)),
    storageKey: BooleanSetting.hideWebcamWidget,
    value: false
  },
  {
    name: t("Dynamic map size"),
    description: trim(t(`Change the Farm Designer map size based on axis length.
      A value must be input in AXIS LENGTH and STOP AT MAX must be enabled in
      the HARDWARE widget.`)),
    storageKey: BooleanSetting.dynamicMap,
    value: false
  },
  {
    name: t("Double default map dimensions"),
    description: trim(t(`Double the default dimensions of the Farm Designer map
    for a map with four times the area.`)),
    storageKey: BooleanSetting.mapXL,
    value: false
  },
  {
    name: t("Display plant animations"),
    description: trim(t(`Enable plant animations in the Farm Designer.`)),
    storageKey: BooleanSetting.disableAnimations,
    value: false,
    displayInvert: true
  }
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
const fetchVal = (k: BooleanSetting) => !!Session.getBool(k);

/** Takes a `LabFeature` (probably one with an uninitialized fallback / default
 * value) and sets it to the _real_ value that's in localStorage. */
const fetchRealValue = (x: LabsFeature): LabsFeature => {
  return { ...x, value: fetchVal(x.storageKey) };
};

/** Toggle the `.value` of a `LabsToggle` object */
const toggleFeatureValue = (x: LabsFeature) => {
  return { ...x, value: Session.invertBool(x.storageKey) };
};
