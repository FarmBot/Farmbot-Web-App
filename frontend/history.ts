import { navigate } from "takeme";

/** Remove `/app` from URL. */
const maybeStripAppFromUrl =
  (url: string) => url.startsWith("/app") ? url.replace("/app", "") : url;

/** Navigate to a URL and add it to browser history. */
export const push = (url: string) => navigate(maybeStripAppFromUrl(url));

/** Get the current app location path as an array. */
export function getPathArray() {
  return location.pathname.split("/");
}
