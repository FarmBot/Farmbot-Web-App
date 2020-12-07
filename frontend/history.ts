import { navigate } from "takeme";
import { maybeStripLegacyUrl } from "./link";

/** Navigate to a URL and add it to browser history. */
export const push = (url: string) => navigate(maybeStripLegacyUrl(url));

/** Get the current app location path as an array. */
export function getPathArray() {
  return location.pathname.split("/");
}

/** This is a stub from the `react-router` days. Don't use it anymore. */
export const history = { push, getCurrentLocation: () => window.location };
