import { navigate } from "takeme";
import { maybeStripLegacyUrl } from "./link";

export const push = (url: string) => navigate(maybeStripLegacyUrl(url));

export function getPathArray() {
  return location.pathname.split("/");
}

/** This is a stub from the `react-router` days. Don't use it anymore. */
export const history = { push, getCurrentLocation: () => window.location };
