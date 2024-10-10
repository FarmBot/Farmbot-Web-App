import { useHistory } from "react-router-dom";

/** Remove `/app` from URL. */
const maybeStripAppFromUrl =
  (url: string) => url.startsWith("/app") ? url.replace("/app", "") : url;

/** Navigate to a URL and add it to browser history. */
export const push = (url: string) => {
  const history = useHistory();
  history.push(maybeStripAppFromUrl(url));
};

/** Get the current app location path as an array. */
export function getPathArray() {
  return location.pathname.split("/");
}
