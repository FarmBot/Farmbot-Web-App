import { navigate } from "takeme";
import { maybeStripLegacyUrl } from "./link";

/** Navigate to a URL and add it to browser history. */
export const push = (url: string) => navigate(maybeStripLegacyUrl(url));

/** Get the current app location path as an array. */
export function getPathArray() {
  return location.pathname.split("/");
}
