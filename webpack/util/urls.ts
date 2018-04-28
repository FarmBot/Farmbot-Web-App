import { history } from "../history";

/** When needing to reference the url in some js universally or vice versa. */
export function urlFriendly(stringToFormat: string) {
  return encodeURIComponent(stringToFormat.replace(/ /gi, "_").toLowerCase());
}

/** Get remainder of current url after the last "/". */
export function lastUrlChunk() {
  const p = history.getCurrentLocation().pathname;
  return p.split("/")[p.split("/").length - 1];
}
