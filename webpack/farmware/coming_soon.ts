import { Session } from "../session";
import { BooleanSetting } from "../session_keys";

/** Conditionally generate "coming-soon" CSS rule based on user prefs. */
export function comingSoon(): string {
  return Session.getBool(BooleanSetting.weedDetector) ? "" : "  coming-soon";
}
