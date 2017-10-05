import { Content } from "../../constants";
import { Session } from "../../session";
import { BooleanSetting } from "../../session_keys";
import { trim } from "../../util";

export interface LabsFeature {
  name: string;
  description: string;
  /** Entry for localStorage. Must be unique. */
  storageKey: BooleanSetting;
  value: boolean;
  experimental?: boolean;
}

export const fetchLabFeatures = (): LabsFeature[] => ([
  {
    name: "Hide Webcam Widget",
    description: trim(`If not using a webcam, use this setting to remove the
      widget from the Controls page.`),
    storageKey: BooleanSetting.hideWebcamWidget,
    value: false
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
